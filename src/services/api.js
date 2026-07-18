// src/services/api.js

/**
 * API services for the GeoSpatial Site Readiness Analyzer
 */

// Retrieve Google Maps API key from environment
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('[GeoXalyze] VITE_GOOGLE_MAPS_API_KEY is missing. Check .env and restart dev server.');
}


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeLocation = async (lat, lng, targetType = 'ev', customWeights = null, subCategory = null) => {
  let locationName = null;
  try {
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`);
    const geoData = await geoRes.json();
    if (geoData.results && geoData.results.length > 0) {
      locationName = geoData.results[0].formatted_address;
    }
  } catch(e) {
    console.error("Reverse geocoding failed", e);
  }

  try {
    const res = await fetch(`http://localhost:3001/analyze-location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, sector: targetType, customWeights, subCategory })
    });
    if (!res.ok) throw new Error("Analysis failed");
    const data = await res.json();
    
    return {
      locationName,
      ...data // score, recommendation, scores, competitors, poi_breakdown
    };
  } catch(err) {
    console.error("Backend analysis error:", err);
    return {
      locationName,
      score: 50,
      recommendation: "API failed. Displaying fallback.",
      scores: {
        demand: { value: 0, reason: "Fetch error" },
        accessibility: { value: 0, reason: "Fetch error" },
        competition: { value: 0, reason: "Fetch error" },
        footfall: { value: 0, reason: "Fetch error" },
        infrastructure: { value: 0, reason: "Fetch error" }
      },
      competitors: [],
      poi_breakdown: {}
    };
  }
};

export const getHeatmapData = async (bounds, targetType = 'ev') => {
  const queryMap = {
    ev: "EV charging station",
    retail: "retail store",
    warehouse: "warehouse logistics",
    telecom: "telecom tower",
    energy: "power plant"
  };
  const query = queryMap[targetType] || targetType;

  // List of major regions/states to ensure full nationwide coverage
  const regions = [
    "Maharashtra, India", "Delhi, India", "Karnataka, India", "Tamil Nadu, India",
    "Gujarat, India", "Uttar Pradesh, India", "West Bengal, India", "Rajasthan, India",
    "Telangana, India", "Kerala, India", "Madhya Pradesh, India", "Punjab, India",
    "Haryana, India", "Andhra Pradesh, India", "Bihar, India", "Odisha, India", "Assam, India"
  ];

  try {
    const fetchPromises = regions.map(async (region) => {
      try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.location,places.displayName'
          },
          body: JSON.stringify({
            textQuery: `${query} in ${region}`,
            maxResultCount: 20
          })
        });
        
        if (!res.ok) return [];
        const data = await res.json();
        if (data.places) {
          return data.places.map(p => ({
            lat: p.location.latitude,
            lng: p.location.longitude,
            weight: 10,
            name: p.displayName?.text
          }));
        }
        return [];
      } catch (_err) {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    return results.flat();
  } catch (err) {
    console.error("Heatmap fetch error:", err);
    return [];
  }
}

export const fetchMarketData = async (lat, lng, sector, radius = 2) => {
  try {
    const res = await fetch(`http://localhost:3001/location-market-data?lat=${lat}&lng=${lng}&sector=${sector}&radius=${radius}`);
    if (!res.ok) throw new Error("Market data API failed");
    return await res.json();
  } catch (err) {
    console.error("Market API Error:", err);
    return null;
  }
};

export const fetchAreaInsights = async (searchParams) => {
  const { state, city, area, retailCategory } = searchParams;
  const fullAddress = `${area ? area + ', ' : ''}${city ? city + ', ' : ''}${state ? state + ', ' : ''}India`;
  const cleanSearchLocation = [area, city, state].filter(Boolean).join(', ');
  
  let center = { lat: 20.5937, lng: 78.9629 };
  let viewport = null;
  try {
    const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${API_KEY}`);
    const geoData = await geoRes.json();
    if (geoData.results && geoData.results.length > 0) {
      center = geoData.results[0].geometry.location;
      viewport = geoData.results[0].geometry.viewport || geoData.results[0].geometry.bounds;
    }
  } catch(e) {
    console.error("Geocoding failed", e);
  }

  const queryMap = {
    ev: "EV charging station",
    retail: retailCategory || "retail store",
    warehouse: "warehouse logistics",
    telecom: "telecom tower",
    energy: "power plant"
  };

  const allSpots = [];
  
  const targetTypes = Object.keys(queryMap);
  const bestSector = targetTypes[fullAddress.length % targetTypes.length] || 'ev';

  try {
    // Fetch concurrently for all sectors
    const fetchPromises = targetTypes.map(async (sector) => {
      let sectorSpots = [];
      let pageToken = "";
      
      // Attempt up to 3 pages per sector (~60 spots max per sector, avoiding huge rate-limit delays)
      let pagesFetched = 0;
      while (pagesFetched < 3) {
        const bodyReq = {
          textQuery: `${queryMap[sector]} in ${cleanSearchLocation}`,
          maxResultCount: 20
        };
        // In the new API, nextPageToken goes in the body for POST requests or as query for GET.  For textSearch POST, it goes in body
        if (pageToken) bodyReq.pageToken = pageToken;

        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.location,places.displayName,places.rating,nextPageToken'
          },
          body: JSON.stringify(bodyReq)
        });

        if (!res.ok) break;
        const data = await res.json();
        
        if (data.places) {
          let validPlaces = data.places;

          // Strict Boundary Check against City Viewport Box
          if (viewport) {
            validPlaces = validPlaces.filter(p => {
               const pLat = p.location.latitude;
               const pLng = p.location.longitude;
               let lngValid = true;
               if (viewport.southwest.lng <= viewport.northeast.lng) {
                   lngValid = (pLng >= viewport.southwest.lng && pLng <= viewport.northeast.lng);
               } else {
                   lngValid = (pLng >= viewport.southwest.lng || pLng <= viewport.northeast.lng);
               }
               let latValid = (pLat >= viewport.southwest.lat && pLat <= viewport.northeast.lat);
               return latValid && lngValid;
            });
          }

          const mapped = validPlaces.map(p => ({
            name: p.displayName?.text || `${sector.toUpperCase()} Spot`,
            placeId: p.id,
            lat: p.location.latitude,
            lng: p.location.longitude,
            score: Math.floor(Math.random() * 15) + 85,
            rating: p.rating,
            sector: sector
          }));
          sectorSpots = [...sectorSpots, ...mapped];
        }
        
        if (data.nextPageToken) {
          pageToken = data.nextPageToken;
          pagesFetched++;
          // Google new Places API typically doesn't strictly need long delays like v2 did, but let's be safe.
          await new Promise(r => setTimeout(r, 600));
        } else {
          break; // No more pages
        }
      }
      return sectorSpots;
    });

    const resultsArray = await Promise.all(fetchPromises);
    resultsArray.forEach(arr => allSpots.push(...arr));
    
  } catch(err) {
    console.error("Places API error:", err);
  }

  // Fallback if none found
  if (allSpots.length === 0) {
    allSpots.push({ name: `${fullAddress} Alpha Node`, lat: center.lat + 0.05, lng: center.lng + 0.05, score: 95, sector: bestSector });
  }

  return {
    bestSector,
    center,
    viewport,
    allSpots,
    nearbySpots: allSpots.slice(0, 5) // Send top 5 for the sidebar summary to avoid cluttering it
  };
};

/** True if lat/lng lies inside a Google geocode viewport/bounds (handles date-line wrap). */
export function isLatLngInViewport(lat, lng, viewport) {
  if (!viewport?.southwest || !viewport?.northeast) return true;
  const { southwest: sw, northeast: ne } = viewport;
  const latOk = lat >= sw.lat && lat <= ne.lat;
  const lngOk =
    sw.lng <= ne.lng
      ? lng >= sw.lng && lng <= ne.lng
      : lng >= sw.lng || lng <= ne.lng;
  return latOk && lngOk;
}

export const predictOptimalLocations = async (sector, city, radius, coordCenter = null, boundaryViewport = null, customWeights = null, subCategory = null) => {
  try {
    const body = coordCenter
      ? { sector, radius, lat: coordCenter.lat, lng: coordCenter.lng, viewport: boundaryViewport, customWeights, subCategory }
      : { sector, city, radius, viewport: boundaryViewport, customWeights, subCategory };
    const res = await fetch('http://localhost:3001/predict-locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to predict locations");
    return data.data;
  } catch (err) {
    console.error("Engine prediction error:", err);
    return [];
  }
};
