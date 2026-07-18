import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { predictLocations, getMarketIntelligence, analyzeLocationDetails } from './LocationEngine.js';
import PopulationGrid from './PopulationGrid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Endpoint for Location Intelligence Engine
app.post('/predict-locations', async (req, res) => {
  try {
    const { sector, city, radius, lat, lng, viewport, customWeights, subCategory } = req.body;

    if (!sector || radius === undefined) {
      return res.status(400).json({ error: "Missing required parameters: sector, radius" });
    }

    const hasCoords = lat != null && lng != null && lat !== '' && lng !== '';
    if (!hasCoords && !city) {
      return res.status(400).json({ error: "Provide either city or lat/lng for prediction" });
    }

    console.log(
      hasCoords
        ? `[LocationEngine] Prediction for ${sector} at ${lat},${lng} radius ${radius}km (city viewport: ${viewport ? 'yes' : 'no'})`
        : `[LocationEngine] Processing prediction for ${sector} in ${city} with radius ${radius}km`
    );

    const predictions = await predictLocations(
      sector,
      city,
      parseFloat(radius),
      hasCoords ? { lat, lng } : null,
      viewport || null,
      customWeights,
      subCategory
    );
    
    console.log(`[LocationEngine] Successfully generated ${predictions.length} candidate locations.`);
    res.json({ data: predictions });
    
  } catch (error) {
    console.error("[LocationEngine] Prediction Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// API Endpoint for Market Intelligence Dashboard
app.get('/location-market-data', async (req, res) => {
  try {
    const { lat, lng, sector, radius } = req.query;
    if (!lat || !lng || !sector) {
      return res.status(400).json({ error: "Missing required parameters: lat, lng, sector" });
    }
    console.log(`[LocationEngine] Fetching Market Data for lat:${lat}, lng:${lng}, sector:${sector}`);
    
    const data = await getMarketIntelligence(lat, lng, sector, radius);
    res.json(data);
  } catch (error) {
    console.error("[LocationEngine] Market Data Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.post('/analyze-location', async (req, res) => {
  try {
    const { lat, lng, sector, customWeights, subCategory } = req.body;
    if (!lat || !lng || !sector) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const data = await analyzeLocationDetails(lat, lng, sector, customWeights, subCategory);
    res.json(data);
  } catch (error) {
    console.error("[LocationEngine] Analyze Location Error:", error);
    res.status(500).json({ error: "Analysis failed", details: error.message });
  }
});

// API Endpoint for fetching Place details bypassing CORS
app.get('/place-details', async (req, res) => {
  try {
    const { lat, lng, place_id } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Missing lat/lng" });
    
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Server missing API Key" });

    let placeId = place_id;

    if (!placeId) {
      // 1. Nearby Search to get Place ID
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${apiKey}`;
      const nearbyResp = await fetch(nearbyUrl);
      const nearbyData = await nearbyResp.json();
      
      if (!nearbyData.results || nearbyData.results.length === 0) {
        return res.status(404).json({ error: "No place found near coordinates." });
      }
      
      placeId = nearbyData.results[0].place_id;
    }

    // 2. Details Search for phone, rating, etc.
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,rating,website,url&key=${apiKey}`;
    const detailsResp = await fetch(detailsUrl);
    const detailsData = await detailsResp.json();

    if (!detailsData.result) {
      return res.status(404).json({ error: "No details found for place." });
    }

    const result = detailsData.result;
    res.json({
      name: result.name,
      address: result.formatted_address,
      phoneNumber: result.formatted_phone_number || null,
      rating: result.rating || null,
      googleMapsUrl: result.url || `https://www.google.com/maps/search/?api=1&query=place_id:${placeId}`
    });
  } catch (error) {
    console.error("[PlaceDetails] Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

// API Endpoint for Location Intelligence Summary (Powered by Ollama Cloud)
app.post('/location-intelligence-summary', async (req, res) => {
  try {
    const { sector, score, confidenceScore, scores, poi_breakdown } = req.body;
    const sectorName = (sector || 'retail').toUpperCase();

    const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY || '45a70ec11f314c7eb1da7b83660a1e08.sZ-TJaXJABYsKdyDW-9PhygW';

    const poiTotal = poi_breakdown
      ? Object.values(poi_breakdown).reduce((a, b) => a + b, 0)
      : 0;

    const scoresSummary = scores
      ? Object.entries(scores).map(([k, v]) => `${k}: ${v.value}/100`).join(', ')
      : 'No detailed scores available';

    const prompt = `You are an expert commercial real estate and site-selection AI analyst. A user wants to evaluate a potential ${sectorName} site. The AI scoring engine has produced the following analysis:

Overall Viability Score: ${score}/100
Confidence Level: ${confidenceScore}%
Total POIs detected nearby: ${poiTotal}
Detailed Metric Scores: ${scoresSummary}

Based on this data, provide a site evaluation in ONLY this exact JSON format with no markdown, no explanation, no extra text:
{"pros":["pro1","pro2","pro3"],"cons":["con1","con2"],"conclusion":"Two sentence verdict here."}

Make the pros and cons specific to the ${sectorName} sector and grounded in the score values. High scores (>65) indicate strengths (pros), low scores (<40) indicate weaknesses (cons).`;

    const ollamaRes = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-oss:120b',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      console.error('[Ollama] API Error:', ollamaRes.status, errText.slice(0, 200));
      throw new Error(`Ollama API call failed: ${ollamaRes.status}`);
    }

    const ollamaData = await ollamaRes.json();
    const rawText = ollamaData?.message?.content || ollamaData?.choices?.[0]?.message?.content || '{}';
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (_) {
      // Try to extract JSON from response if model added extra text
      const match = cleanText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    console.log('[Ollama] Successfully generated intelligence summary.');
    res.json({
      pros: (parsed.pros || []).slice(0, 4),
      cons: (parsed.cons || []).slice(0, 3),
      conclusion: parsed.conclusion || ''
    });
  } catch (error) {
    console.error('[Ollama Intelligence] Error:', error.message);
    const { sector, score } = req.body;
    const sectorName = (sector || 'retail').toUpperCase();
    res.json({
      pros: [`Site scored ${score}/100 for ${sectorName} deployment.`, 'Demand and accessibility proxies indicate commercial viability.'],
      cons: ['AI analysis temporarily unavailable. Results are based on rule-based scoring.'],
      conclusion: `Score of ${score}/100 suggests ${score >= 60 ? 'moderate to strong' : 'below-average'} viability for ${sectorName}. Manual site inspection is advised.`
    });
  }
});

// Start listening after loading spatial population density map
PopulationGrid.load().then(() => {
  app.listen(PORT, () => {
    console.log(`Location Intelligence Engine backend running on port ${PORT}`);
  });
}).catch(e => {
  console.error("Failed to boot population density service:", e);
});
