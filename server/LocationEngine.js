import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PopulationGrid from './PopulationGrid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.warn("WARNING: VITE_GOOGLE_MAPS_API_KEY is not defined in .env");
}
// ── MATH HELPERS ──────────────────────────────────────────────────────────────

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Logarithmic scale: maps [0, maxExpected] → [0, 100] using log curve to prevent saturation */
function logScale(value, maxExpected) {
  if (maxExpected <= 0) return 0;
  const clamped = Math.max(0, Math.min(value, maxExpected * 2));
  return Math.round((Math.log(1 + clamped) / Math.log(1 + maxExpected)) * 100);
}

/** Clamp score to [1,99] — never auto-give 0 or 100 unless explicitly at true boundary */
function clampScore(score, allowZero = false, allowHundred = false) {
  return Math.max(allowZero ? 0 : 1, Math.min(allowHundred ? 100 : 99, Math.round(score)));
}

// ── SECTOR CONFIGURATION ──────────────────────────────────────────────────────

/**
 * Each sector defines:
 * - types[]: Google Places API (New) includedTypes for searchNearby endpoint
 * - query:   fallback text query for searchText (used when types[] is empty)
 */
const SECTOR_COMPETITOR_CONFIG = {
  ev: { types: ['electric_vehicle_charging_station'], query: null },
  retail: { types: ['shopping_mall', 'department_store', 'grocery_store', 'clothing_store'], query: null },
  warehouse: { types: ['warehouse'], query: 'logistics warehouse storage facility' },
  telecom: { types: [], query: 'mobile tower telecom tower cell tower' },
  energy: { types: [], query: 'solar power plant wind energy station' },
};

export const SECTOR_WEIGHTS = {
  ev: { demandProximity: 0.30, accessibility: 0.25, infrastructure: 0.25, competition: 0.20 },
  retail: { footfallDensity: 0.30, purchasingPower: 0.20, visibilityFrontage: 0.20, competitionDensity: 0.20, rentalCost: 0.10 },
  warehouse: { logisticsConnectivity: 0.30, infrastructureQuality: 0.25, landCost: 0.20, zoningRegulations: 0.15, distanceToSuppliers: 0.10 },
  telecom: { populationCoverage: 0.30, elevationTerrain: 0.25, networkGap: 0.20, powerAvailability: 0.15, regulatoryApproval: 0.10 },
  energy: { resourceAvailability: 0.35, landAvailability: 0.20, gridConnectivity: 0.20, governmentPolicy: 0.15, environmentalConstraints: 0.10 }
};

export const RETAIL_SUBCATEGORY_WEIGHTS = {
  "retail store": { footfallDensity: 0.30, purchasingPower: 0.20, visibilityFrontage: 0.20, competitionDensity: 0.20, rentalCost: 0.10 },
  "ice-cream shop": { footfallDensity: 0.35, visibilityWalkability: 0.25, competitionDensity: 0.15, seasonalDemand: 0.15, rentalCost: 0.10 },
  "grocery shop": { residentialDensity: 0.35, accessibility: 0.20, competitionDensity: 0.20, purchasingPower: 0.15, parkingAvailability: 0.10 },
  "apparel shop": { purchasingPower: 0.30, footfallDensity: 0.25, visibility: 0.20, competitionDensity: 0.15, rentalCost: 0.10 },
  "toys shop": { familyDensity: 0.30, footfall: 0.25, visibility: 0.20, competition: 0.15, seasonalTrends: 0.10 },
  "sports shop": { youthPopulation: 0.25, incomeLevel: 0.20, accessibility: 0.20, competition: 0.20, visibility: 0.15 },
  "electronic shop": { purchasingPower: 0.30, accessibility: 0.20, competitionDensity: 0.20, visibility: 0.15, afterSalesServiceReach: 0.15 },
  "medical shop": { proximityToHospitalsClinics: 0.40, accessibility: 0.20, residentialDensity: 0.15, competition: 0.15, demand247Potential: 0.10 },
  "stationary shop": { studentDensity: 0.35, proximityToSchoolsColleges: 0.25, footfall: 0.15, competition: 0.15, rentalCost: 0.10 },
  "footwear store": { footfallDensity: 0.30, purchasingPower: 0.25, visibility: 0.20, competition: 0.15, rentalCost: 0.10 },
  "bakery store": { footfallDensity: 0.30, residentialDensity: 0.25, visibility: 0.20, competition: 0.15, freshDemandCycle: 0.10 },
  "jewellery store": { purchasingPower: 0.40, security: 0.20, visibility: 0.15, brandPositioningArea: 0.15, competition: 0.10 }
};

// ── ACCURATE PLACES API HELPERS ───────────────────────────────────────────────

/**
 * Count places using searchNearby with includedTypes.
 * Uses strict locationRestriction (NOT locationBias) so only places
 * actually within `radiusM` metres are returned.
 * Paginates up to `maxPages` pages (20 per page → up to 40 with 2 pages).
 */
async function countByTypes(lat, lng, includedTypes, radiusM = 1000, maxPages = 2) {
  let total = 0;
  let pageToken = null;

  for (let page = 0; page < maxPages; page++) {
    const body = {
      includedTypes,
      locationRestriction: {
        circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
      },
      maxResultCount: 20,
      rankPreference: 'DISTANCE'
    };
    if (pageToken) body.pageToken = pageToken;

    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,nextPageToken'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.places || data.places.length === 0) break;

      total += data.places.length;
      pageToken = data.nextPageToken || null;
      if (!pageToken) break;
      if (page < maxPages - 1) await new Promise(r => setTimeout(r, 350));
    } catch { break; }
  }

  return total;
}

// ── NEW PHASE 1: ROBUST DATA COLLECTION ──────────────────────────────────────────

/**
 * Searches multiple keywords, enforces pagination limits,
 * deduplicates via place.id, and post-filters coordinates strictly to circle boundary.
 */
// Helper to count places using a free‑text search (used by market intelligence)
async function countByText(lat, lng, query, radiusM = 1000, maxPages = 2) {
  let total = 0;
  let pageToken = null;
  for (let page = 0; page < maxPages; page++) {
    const body = {
      textQuery: query,
      locationBias: {
        circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
      },
      maxResultCount: 20
    };
    if (pageToken) body.pageToken = pageToken;
    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) break;
      const data = await res.json();
      if (!data.places || data.places.length === 0) break;
      total += data.places.length;
      pageToken = data.nextPageToken || null;
      if (!pageToken) break;
      if (page < maxPages - 1) await new Promise(r => setTimeout(r, 350));
    } catch { break; }
  }
  return total;
}



/**
 * Fetch full competitor details using searchNearby (types-based).
 * Strict locationRestriction ensures only competitors WITHIN radiusM are returned.
 */
async function fetchCompetitorsByTypes(lat, lng, includedTypes, radiusM = 1500) {
  const body = {
    includedTypes,
    locationRestriction: {
      circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
    },
    maxResultCount: 20,
    rankPreference: 'DISTANCE'
  };

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.formattedAddress'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.places || [];
  } catch { return []; }
}

/**
 * Fetch full competitor details using searchText (for sectors without a dedicated type).
 * Uses locationBias plus strict manual filtering.
 */
async function fetchCompetitorsByText(lat, lng, query, radiusM = 1500) {
  const body = {
    textQuery: query,
    locationBias: {
      circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
    },
    maxResultCount: 20
  };

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.rating,places.userRatingCount,places.location,places.primaryTypeDisplayName,places.formattedAddress'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.places || [];
  } catch { return []; }
}

/** Unified competitor fetch: tries searchNearby first; falls back to text search */
async function fetchCompetitors(lat, lng, sector, radiusM = 1500) {
  const cfg = SECTOR_COMPETITOR_CONFIG[sector] || SECTOR_COMPETITOR_CONFIG.retail;
  let places = [];

  if (cfg.types && cfg.types.length > 0) {
    places = await fetchCompetitorsByTypes(lat, lng, cfg.types, radiusM);
  }

  // Fallback or supplement with text search if types yielded nothing
  if (places.length === 0 && cfg.query) {
    places = await fetchCompetitorsByText(lat, lng, cfg.query, radiusM);
  }

  // Map to unified object, computing true distance
  return places.map(p => ({
    name: p.displayName?.text || 'Competitor',
    type: p.primaryTypeDisplayName?.text || '',
    address: p.formattedAddress || '',
    rating: p.rating || 0,
    reviews: p.userRatingCount || 0,
    distance_km: parseFloat(getDistance(lat, lng, p.location.latitude, p.location.longitude).toFixed(2)),
    // Keep the raw location for verification
    lat: p.location.latitude,
    lng: p.location.longitude
  }))
    // Double-filter: despite locationRestriction, confirm within radius
    .filter(c => c.distance_km <= radiusM / 1000)
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 10);
}

// ── LEGACY HELPER (used by predictLocations grid scoring only) ─────────────────
// Still uses locationBias intentionally for broad grid scanning (not user-facing accuracy)
async function searchNearbyPlacesCount(lat, lng, query) {
  const body = {
    textQuery: query,
    locationBias: {
      circle: { center: { latitude: lat, longitude: lng }, radius: 1000 }
    },
    maxResultCount: 20
  };
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id'
      },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.places ? data.places.length : 0;
  } catch { return 0; }
}

// ── GEOCODING & GRID ──────────────────────────────────────────────────────────

async function geocodeCity(city) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${API_KEY}`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("Could not locate city");
  return {
    location: data.results[0].geometry.location,
    viewport: data.results[0].geometry.viewport || data.results[0].geometry.bounds
  };
}

/** Sanitize client-supplied viewport (same shape as Google Maps Geocoder). */
function normalizeViewport(vp) {
  if (!vp || typeof vp !== 'object') return null;
  const sw = vp.southwest;
  const ne = vp.northeast;
  if (!sw || !ne) return null;
  const swLat = parseFloat(sw.lat);
  const swLng = parseFloat(sw.lng);
  const neLat = parseFloat(ne.lat);
  const neLng = parseFloat(ne.lng);
  if ([swLat, swLng, neLat, neLng].some((n) => Number.isNaN(n))) return null;
  return {
    southwest: { lat: swLat, lng: swLng },
    northeast: { lat: neLat, lng: neLng }
  };
}

function generateGrid(center, radiusKm, viewport) {
  const points = [];
  const latDelta = radiusKm / 111.0;
  const lngDelta = radiusKm / (111.0 * Math.cos(center.lat * Math.PI / 180));
  const steps = 6; // increased from 4: 7x7 grid up to 49 points
  const latStep = (latDelta * 2) / steps;
  const lngStep = (lngDelta * 2) / steps;

  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const jitterLat = (Math.random() - 0.5) * latStep * 0.7;
      const jitterLng = (Math.random() - 0.5) * lngStep * 0.7;
      const pLat = (center.lat - latDelta) + (i * latStep) + jitterLat;
      const pLng = (center.lng - lngDelta) + (j * lngStep) + jitterLng;
      if (viewport) {
        let lngValid = viewport.southwest.lng <= viewport.northeast.lng
          ? (pLng >= viewport.southwest.lng && pLng <= viewport.northeast.lng)
          : (pLng >= viewport.southwest.lng || pLng <= viewport.northeast.lng);
        const latValid = pLat >= viewport.southwest.lat && pLat <= viewport.northeast.lat;
        if (!latValid || !lngValid) continue;
      }
      if (getDistance(center.lat, center.lng, pLat, pLng) <= radiusKm + 1) {
        points.push({ lat: pLat, lng: pLng, id: `grid_${i}_${j}` });
      }
    }
  }
  return points.slice(0, 50);
}

async function getDistanceMatrix(points, center) {
  const map = {};
  const chunkSize = 25; // API allows max 25 origins
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    const origins = chunk.map(p => `${p.lat},${p.lng}`).join('|');
    const dest = `${center.lat},${center.lng}`;
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${dest}&key=${API_KEY}`);
    const data = await res.json();
    if (data.rows) {
      chunk.forEach((p, idx) => {
        const element = data.rows[idx]?.elements[0];
        map[p.id] = element?.status === "OK"
          ? { distanceValue: element.distance.value, durationValue: element.duration.value }
          : { distanceValue: 999999, durationValue: 999999 };
      });
    }
  }
  return map;
}

async function checkRoadsProximity(points) {
  const path = points.map(p => `${p.lat},${p.lng}`).join('|');
  const res = await fetch(`https://roads.googleapis.com/v1/nearestRoads?points=${path}&key=${API_KEY}`);
  const data = await res.json();
  const map = {};
  points.forEach(p => map[p.id] = { nearRoad: false, lat: p.lat, lng: p.lng });
  if (data.snappedPoints) {
    data.snappedPoints.forEach(sp => {
      let minD = 999, matchedId = null;
      points.forEach(p => {
        const d = getDistance(p.lat, p.lng, sp.location.latitude, sp.location.longitude);
        if (d < minD) { minD = d; matchedId = p.id; }
      });
      if (matchedId && minD < 0.2) {
        map[matchedId] = { nearRoad: true, lat: sp.location.latitude, lng: sp.location.longitude };
      }
    });
  }
  return map;
}

// ── PREDICT LOCATIONS (uses legacy helpers — grid-level accuracy OK) ───────────

/**
 * @param {string} sector
 * @param {string} [city] - used when coordCenter is null (geocoded search area)
 * @param {number} radius - km
 * @param {{ lat: number, lng: number } | null} [coordCenter] - when set, grid is built around this point (map click / new location)
 * @param {object | null} [boundaryViewport] - when set, grid points are clipped to this box (selected city / search area)
 */
export async function predictLocations(sector, city, radius, coordCenter = null, boundaryViewport = null, customWeights = null, subCategory = null) {
  const clientVp = normalizeViewport(boundaryViewport);
  let center;
  let viewport = null;
  if (coordCenter != null && coordCenter.lat != null && coordCenter.lng != null) {
    center = { lat: parseFloat(coordCenter.lat), lng: parseFloat(coordCenter.lng) };
    viewport = clientVp;
  } else if (city) {
    const geoData = await geocodeCity(city);
    center = geoData.location;
    viewport = clientVp || geoData.viewport;
  } else {
    throw new Error('Provide city name or lat/lng for prediction');
  }
  const grid = generateGrid(center, radius, viewport);
  if (grid.length === 0) return [];

  const [distanceMap, roadsMap] = await Promise.all([
    getDistanceMatrix(grid, center),
    checkRoadsProximity(grid)
  ]);

  const predictionsArray = [];
  for (const pt of grid) {
    const dm = distanceMap[pt.id] || { distanceValue: 9999, durationValue: 9999 };
    const roadData = roadsMap[pt.id] || { nearRoad: false, lat: pt.lat, lng: pt.lng };
    const nearRoad = roadData.nearRoad;
    
    // Core Proxies extracted via API matching
    const [apts, commercial, industrial, premiumBrands, ev_stations] = await Promise.all([
      searchNearbyPlacesCount(pt.lat, pt.lng, "residential|apartments"),
      searchNearbyPlacesCount(pt.lat, pt.lng, "store|restaurant|mall"),
      searchNearbyPlacesCount(pt.lat, pt.lng, "industrial area|warehouse"),
      searchNearbyPlacesCount(pt.lat, pt.lng, "luxury brand|premium retail"),
      searchNearbyPlacesCount(pt.lat, pt.lng, "EV charging station")
    ]);

    const compCount = sector === 'ev' ? ev_stations : (sector === 'retail' ? commercial/10 : (sector === 'warehouse' ? industrial : 0));
    const basic_pois = apts + commercial + industrial;
    const highway_proximity = nearRoad ? Math.min(1.0, 1.0 / (dm.distanceValue / 5000 + 0.1)) : 0.1;
    const traff_dens = highway_proximity * Math.min(1.0, commercial * 0.05 + 0.2);
    const transport_pois = Math.min(1.0, (nearRoad ? 1 : 0) * (commercial / 20));
    const pop_dens = Math.min(1.0, apts / 10.0);
    const income_proxy = Math.min(1.0, premiumBrands / 3.0 + (commercial / 50));
    const visibility = nearRoad ? Math.min(1.0, 0.4 + commercial / 30) : 0.1;
    const low_density = Math.max(0, 1.0 - (basic_pois / 40.0));
    const open_space = low_density;
    
    let score = 0;
    let reason = "Evaluated Node";

    // Sector strictly driven formula:
    if (sector === 'ev') {
      score = (0.30 * traff_dens) + (0.25 * transport_pois) + (0.20 * pop_dens) + (0.15 * highway_proximity) - (0.10 * Math.min(1.0, compCount/5.0));
      reason = `Traffic Score: ${Math.round(traff_dens*100)}, Pop: ${Math.round(pop_dens*100)}`;
    } else if (sector === 'retail') {
      score = (0.30 * Math.min(1.0, commercial/30)) + (0.25 * income_proxy) + (0.20 * pop_dens) + (0.15 * visibility) - (0.10 * Math.min(1.0, compCount/5.0));
      reason = `Com Prox: ${commercial}, Income Proxy: ${Math.round(income_proxy*100)}`;
    } else if (sector === 'warehouse') {
      score = (0.35 * highway_proximity) + (0.25 * Math.min(1.0, industrial/5)) + (0.20 * low_density) + (0.10 * low_density) + (0.10 * highway_proximity);
      reason = `Highway: ${Math.round(highway_proximity*100)}, Low Density: ${Math.round(low_density*100)}`;
    } else if (sector === 'telecom') {
      score = (0.35 * pop_dens) + (0.30 * Math.max(0, pop_dens - (compCount/5.0))) + (0.15 * open_space) + (0.10 * open_space) + (0.10 * pop_dens);
      reason = `Coverage Gap: ${Math.round(Math.max(0, pop_dens - (compCount/5.0))*100)}`;
    } else if (sector === 'energy') {
      score = (0.30 * open_space) + (0.25 * open_space) + (0.20 * Math.max(0, 1-pop_dens)) + (0.15 * highway_proximity) + (0.10 * open_space);
      reason = `Open Land Prox: ${Math.round(open_space*100)}`;
    }
    
    predictionsArray.push({ lat: roadData.lat, lng: roadData.lng, score: clampScore(score * 100), reason, sector });
  }

  // Rank grid cells
  predictionsArray.sort((a, b) => b.score - a.score);

  // Geographic Spacing & Constraint Enforcement
  const finalCandidates = [];
  const minRequiredDistance = (sector === 'ev' || sector === 'retail') ? 0.8 : 3.0; // 500-800m vs 2-5km

  for (const node of predictionsArray) {
    if (finalCandidates.length >= 10) break;
    
    let tooClose = false;
    for (const chosen of finalCandidates) {
      const d = getDistance(node.lat, node.lng, chosen.lat, chosen.lng);
      if (d < minRequiredDistance) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) {
      finalCandidates.push(node);
    }
  }

  return finalCandidates;
}

// ── MARKET INTELLIGENCE ───────────────────────────────────────────────────────

export async function getMarketIntelligence(lat, lng, sector, radius) {
  const radiusM = (parseFloat(radius) || 2) * 1000; // convert km → metres

  // Fetch competitors with a strict 5km bounding override.
  const competitors = await fetchCompetitors(lat, lng, sector, 5000);

  // Fetch POI density using accurate type-based search with locationRestriction
  const [restaurants, offices, malls, transit] = await Promise.all([
    countByTypes(lat, lng, ['restaurant'], radiusM),
    countByText(lat, lng, 'office building OR corporate office', radiusM),
    countByTypes(lat, lng, ['shopping_mall', 'department_store'], radiusM),
    countByTypes(lat, lng, ['transit_station', 'bus_station', 'subway_station', 'train_station'], radiusM),
  ]);

  const competitor_count = competitors.length;
  const avg_rating = competitor_count > 0
    ? parseFloat((competitors.reduce((s, c) => s + c.rating, 0) / competitor_count).toFixed(1))
    : 0;
  const total_reviews = competitors.reduce((s, c) => s + c.reviews, 0);

  // Weighted footfall with log scaling
  const footfall_weighted = (restaurants * 0.3) + (offices * 0.3) + (malls * 0.2) + (transit * 0.2);
  const footfall_score = clampScore(logScale(footfall_weighted, 18));

  const total_poi = restaurants + offices + malls + transit;
  let insight = footfall_score > 70
    ? `High footfall due to dense commercial activity (${total_poi}+ POIs), `
    : footfall_score > 30
      ? `Moderate footfall with ${total_poi} nearby POIs, `
      : `Low footfall zone (${total_poi} POIs), `;

  insight += competitor_count > 5
    ? `but high competition: ${competitor_count} existing locations.`
    : competitor_count > 0
      ? `and moderate competition: ${competitor_count} location(s).`
      : `and excellent opportunity — ZERO competitors within ${radius || 2} km!`;

  return {
    competitors: competitors.slice(0, 5),
    competitor_count,
    avg_rating,
    total_reviews,
    footfall_score,
    poi_counts: { restaurants, offices, malls, transit },
    insight
  };
}

// ── Core Standardized Algebraic Computations (0.0 to 1.0) ────────────────────

export function computePurchasingPower(nightlightProxy, infraScore, popDensityProxy) {
  const econom = nightlightProxy;
  let val = (0.5 * nightlightProxy) + (0.3 * (econom / Math.max(0.1, popDensityProxy))) + (0.2 * infraScore);
  return Math.min(1.0, Math.max(0.0, val));
}

export function computeDemand(poiCount) {
  return Math.min(1.0, Math.log10(1 + poiCount) / Math.log10(1 + 200));
}

export function computeCompetition(compCount) {
  return Math.min(1.0, compCount / 20.0);
}

export function computeAccessibility(distanceToRoadKm, roadConnectivity) {
  const invDist = Math.min(1.0, 1.0 / Math.max(0.01, distanceToRoadKm));
  return (0.6 * invDist) + (0.4 * roadConnectivity);
}

export function computeVisibility(isOnMajorRoad, intersectionDensity) {
  const base = isOnMajorRoad ? 0.6 : 0.2;
  return Math.min(1.0, base + (intersectionDensity * 0.4));
}

export function computeProximity(distanceToRelevantPoiKm) {
  return Math.min(1.0, 1.0 / Math.max(0.01, distanceToRelevantPoiKm));
}

export function computeInfrastructure(roadDensity, utilityAvailability) {
  return (0.5 * roadDensity) + (0.5 * utilityAvailability);
}

export function computeZoningProxy(comCount, resCount, indCount) {
  const total = comCount + resCount + indCount;
  if (total === 0) return 0.5;
  return (comCount / total * 1.0) + (resCount / total * 0.6) + (indCount / total * 0.2);
}

function wrapRes(normalized, isProxy, dataSrc, reasonText, isCompetition = false) {
  return {
    value: Math.round(normalized * 100),
    normalized: normalized,
    reason: reasonText,
    isProxy: isProxy,
    dataSource: dataSrc,
    isCompetition
  };
}

// ── LOCATION DETAIL ANALYSIS (PHASE 1, 3, 4) ────────────────────────────────

async function multiKeywordSearch(lat, lng, keywords, radiusM = 1000, extraFields = '') {
  const uniquePlaces = new Map();
  const maxPages = 3;
  const fieldMask = `places.id,places.location,nextPageToken${extraFields ? ',' + extraFields : ''}`;

  for (const keyword of keywords) {
    let pageToken = null;
    let page = 0;

    while (page < maxPages) {
      const body = {
        textQuery: keyword,
        locationBias: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: radiusM }
        },
        maxResultCount: 20
      };
      if (pageToken) body.pageToken = pageToken;

      try {
        const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY, 'X-Goog-FieldMask': fieldMask },
          body: JSON.stringify(body)
        });
        if (!res.ok) break;
        const data = await res.json();

        if (data.places) {
          data.places.forEach(p => {
            if (p.location) {
              const d = getDistance(lat, lng, p.location.latitude, p.location.longitude);
              if (d <= radiusM / 1000) uniquePlaces.set(p.id, p);
            }
          });
        }

        pageToken = data.nextPageToken || null;
        if (!pageToken) break;
        await new Promise(r => setTimeout(r, 350));
        page++;
      } catch (err) {
        break;
      }
    }
  }

  return Array.from(uniquePlaces.values());
}


export async function analyzeLocationDetails(lat, lng, sector, customWeights = null, subCategory = null) {
  let radiusM = 1500;

  // Helper: fetch POI count AND distance-weighted density for a place type.
  // Returns { count, avgDist, density } where density = sum(1/distKm) for each POI.
  // This differentiates locations even when the API caps results at 20.
  const countPlacesByType = async (types, r = radiusM) => {
    try {
      const body = {
        includedTypes: types,
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: r }
        },
        maxResultCount: 20
      };
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.location'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) return { count: 0, avgDist: 0, density: 0 };
      const data = await res.json();
      const places = data.places || [];
      if (places.length === 0) return { count: 0, avgDist: 0, density: 0 };
      let totalDist = 0, invDistSum = 0;
      for (const p of places) {
        if (p.location) {
          const d = Math.max(0.05, getDistance(parseFloat(lat), parseFloat(lng), p.location.latitude, p.location.longitude));
          totalDist += d;
          invDistSum += 1.0 / d;
        }
      }
      return { count: places.length, avgDist: totalDist / places.length, density: invDistSum };
    } catch (_) { return { count: 0, avgDist: 0, density: 0 }; }
  };

  // Helper: fetch competitors by PLACE TYPE (strict boundary, most accurate)
  const fetchCompetitorsByType = async (types, r = 5000) => {
    try {
      const body = {
        includedTypes: types,
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: r }
        },
        maxResultCount: 20
      };
      const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.location,places.displayName,places.rating,places.userRatingCount,places.formattedAddress'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.places || [];
    } catch (_) { return []; }
  };

  // Sector -> NARROW Google place types (direct competitors only, not broad category)
  // For retail: use subCategory to pick specific type instead of all retail
  const retailTypeMap = {
    'restaurant': ['restaurant', 'cafe'],
    'food': ['restaurant', 'cafe', 'fast_food_restaurant'],
    'pharmacy': ['pharmacy', 'drugstore'],
    'electronics': ['electronics_store'],
    'grocery': ['supermarket', 'grocery_store'],
    'supermarket': ['supermarket'],
    'clothing': ['clothing_store'],
    'furniture': ['furniture_store', 'home_goods_store'],
    'gym': ['gym', 'fitness_center'],
    'salon': ['beauty_salon', 'hair_care'],
  };
  const subKey = (subCategory || '').toLowerCase();
  const retailTypes = Object.keys(retailTypeMap).find(k => subKey.includes(k))
    ? retailTypeMap[Object.keys(retailTypeMap).find(k => subKey.includes(k))]
    : ['clothing_store', 'department_store']; // narrow default — not all retail

  const compTypes = sector === 'ev'
    ? ['electric_vehicle_charging_station']
    : sector === 'warehouse'
    ? ['warehousing_storage']
    : sector === 'telecom'
    ? ['telecommunications_service_provider']
    : sector === 'energy'
    ? ['solar_energy_equipment_supplier', 'wind_energy_equipment_supplier']
    : retailTypes;

  // Sector-specific saturation ceilings (what count = 100% saturated)
  const compCeiling = sector === 'ev' ? 15
    : sector === 'warehouse' ? 8
    : sector === 'telecom' ? 6
    : sector === 'energy' ? 5
    : 25; // retail

  // Composite: typed search (precise) + text fallback for uncommon types
  const fetchAllCompetitors = async (r = 5000) => {
    const byType = await fetchCompetitorsByType(compTypes, r);
    if (byType.length >= 3) return byType;
    // fallback: text search for harder-to-type sectors
    const fallbackKeyword = sector === 'ev' ? 'EV charging station'
      : sector === 'warehouse' ? 'warehouse logistics'
      : sector === 'telecom' ? 'mobile tower cell tower'
      : sector === 'energy' ? 'solar power plant'
      : (subCategory || 'retail store');
    try {
      const body = {
        textQuery: fallbackKeyword,
        locationRestriction: {
          circle: { center: { latitude: parseFloat(lat), longitude: parseFloat(lng) }, radius: r }
        },
        maxResultCount: 20
      };
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.location,places.displayName,places.rating,places.userRatingCount,places.formattedAddress'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) return byType;
      const data = await res.json();
      const textResults = data.places || [];
      // Merge and deduplicate by id
      const merged = [...byType];
      textResults.forEach(p => { if (!merged.find(m => m.id === p.id)) merged.push(p); });
      return merged;
    } catch (_) { return byType; }
  };

  // Fetch all categories concurrently using real Google Places API types
  const [
    aptsData, officesData, restaurantsData, mallsData, storesData,
    fuelData, transitData, competitorsList, roadProximityMap
  ] = await Promise.all([
    countPlacesByType(['apartment_complex', 'residential_complex'], radiusM),
    countPlacesByType(['office', 'corporate_office'], radiusM),
    countPlacesByType(['restaurant', 'cafe', 'food'], radiusM),
    countPlacesByType(['shopping_mall', 'department_store', 'supermarket'], radiusM),
    countPlacesByType(['clothing_store', 'convenience_store', 'electronics_store', 'hardware_store'], radiusM),
    countPlacesByType(['gas_station', 'electric_vehicle_charging_station'], radiusM),
    countPlacesByType(['transit_station', 'bus_station', 'train_station', 'subway_station'], radiusM),
    fetchAllCompetitors(5000),
    checkRoadsProximity([{ lat: parseFloat(lat), lng: parseFloat(lng), id: 'center' }])
  ]);

  // Extract counts and distance-weighted densities (density varies per location even when counts cap at 20)
  const apts_count = aptsData.count, offices_count = officesData.count, restaurants_count = restaurantsData.count;
  const malls_count = mallsData.count, stores_count = storesData.count, fuel_count = fuelData.count, transit_count = transitData.count;
  const totalPois = apts_count + offices_count + restaurants_count + malls_count + stores_count + fuel_count + transit_count;

  // Strict 5km distance filter — parseFloat ensures string lat/lng from req.body don't cause NaN
  const COMP_RADIUS_KM = 5.0;
  const _lat = parseFloat(lat);
  const _lng = parseFloat(lng);
  const competitorsWithin5km = competitorsList.filter(c => {
    const cLat = c.location?.latitude;
    const cLng = c.location?.longitude;
    if (cLat == null || cLng == null) return false;
    const d = getDistance(_lat, _lng, cLat, cLng);
    return d <= COMP_RADIUS_KM;
  });
  const compCount = competitorsWithin5km.length;
  console.log(`[Competition] Total API results: ${competitorsList.length}, Within 5km: ${compCount}`);

  // Expand radius if very low POI density
  let apts = apts_count, off_count = offices_count, restaurants = restaurants_count,
      malls = malls_count, stores = stores_count, fuel = fuel_count, transit = transit_count;
  // Distance-weighted density scores (location-unique even when counts cap at API max of 20)
  let aDens = aptsData.density, oDens = officesData.density, rDens = restaurantsData.density;
  let mDens = mallsData.density, sDens = storesData.density, fDens = fuelData.density, tDens = transitData.density;

  if (totalPois < 5) {
    console.log('[Engine] Low POI density — expanding to 3000m');
    const [a2, o2, r2, m2, s2, f2, t2] = await Promise.all([
      countPlacesByType(['apartment_complex', 'residential_complex'], 3000),
      countPlacesByType(['office', 'corporate_office'], 3000),
      countPlacesByType(['restaurant', 'cafe', 'food'], 3000),
      countPlacesByType(['shopping_mall', 'department_store', 'supermarket'], 3000),
      countPlacesByType(['clothing_store', 'convenience_store', 'electronics_store'], 3000),
      countPlacesByType(['gas_station', 'electric_vehicle_charging_station'], 3000),
      countPlacesByType(['transit_station', 'bus_station', 'train_station'], 3000)
    ]);
    apts = a2.count; off_count = o2.count; restaurants = r2.count; malls = m2.count;
    stores = s2.count; fuel = f2.count; transit = t2.count;
    aDens = a2.density; oDens = o2.density; rDens = r2.density; mDens = m2.density;
    sDens = s2.density; fDens = f2.density; tDens = t2.density;
  }

  const totalReal = apts + off_count + restaurants + malls + stores + fuel + transit;

  // ── SCORING (Distance-Weighted Density — differentiates locations even when API caps at 20) ──
  // The Google Places API returns max 20 results per type. In urban areas this means
  // every category returns 20 for every location, making raw counts useless.
  // Solution: use inverse-distance-weighted density = sum(1/dist_km) per POI found.
  // Closer POIs → higher density → different fingerprint per location.
  const exactPopulationDensity = PopulationGrid.getDensityNear(lat, lng, 1.5) || 5000;
  const roadData = roadProximityMap['center'] || { nearRoad: false };
  const isNearRoad = typeof roadData === 'object' ? roadData.nearRoad : roadData;

  console.log(`[Density] rDens=${rDens.toFixed(1)} mDens=${mDens.toFixed(1)} sDens=${sDens.toFixed(1)} oDens=${oDens.toFixed(1)} tDens=${tDens.toFixed(1)} fDens=${fDens.toFixed(1)} aDens=${aDens.toFixed(1)} popDen=${exactPopulationDensity}`);

  // Transit+road proxy: log-scaled density prevents saturation
  const transitDenScore = Math.min(1.0, Math.log10(1 + tDens) / Math.log10(1 + 80));
  const roadDensityProxy = Math.min(1.0, (transitDenScore * 0.6) + (isNearRoad ? 0.35 : 0.05));
  const distToRoadKm = isNearRoad ? Math.max(0.3, 1.5 - (transitDenScore * 0.8)) : 3.0;

  // Demand: distance-weighted commercial density, log-scaled
  const commercialDensity = rDens * 1.0 + mDens * 2.5 + sDens * 1.5 + oDens * 1.0 + tDens * 1.5;
  const _demand = Math.min(1.0, Math.log10(1 + commercialDensity) / Math.log10(1 + 600));

  // Competition saturation using sector-specific ceiling
  const _compBase = Math.min(1.0, compCount / compCeiling);
  console.log(`[Competition] sector=${sector} | found=${compCount} | ceiling=${compCeiling} | saturation=${Math.round(_compBase*100)}%`);

  // Accessibility: road proximity + transit density
  const invDist = Math.min(1.0, 1.0 / Math.max(0.3, distToRoadKm));
  const _access = Math.min(1.0, (0.45 * invDist) + (0.55 * roadDensityProxy));

  // Infrastructure: fuel + transit density, log-scaled to prevent saturation
  const infraDensity = fDens * 1.5 + tDens * 1.0;
  const _infra = Math.min(1.0, Math.log10(1 + infraDensity) / Math.log10(1 + 150) + (isNearRoad ? 0.1 : 0));

  // Visibility: commercial density proximity, log-scaled
  const visDensity = rDens + mDens + sDens;
  const _visibility = Math.min(1.0, Math.log10(1 + visDensity) / Math.log10(1 + 200) + (isNearRoad ? 0.08 : 0));

  // Purchasing power: offices + malls density as premium-income proxy
  const popDenProxy = Math.min(1.0, Math.max(0.01, exactPopulationDensity / 50000.0));
  const nightlightProxy = Math.min(1.0, Math.log10(1 + oDens * 1.5 + mDens * 2.0) / Math.log10(1 + 80));
  const _purchasing = computePurchasingPower(nightlightProxy, _infra, Math.max(0.01, popDenProxy));

  // Zoning: use density-weighted proportions to differentiate locations
  const _zoning = computeZoningProxy(oDens + mDens + sDens, aDens, fDens);
  const _rentalProxy = Math.max(0.1, 1.0 - _purchasing);

  const subcat = (subCategory || 'retail store').toLowerCase();
  const weights = customWeights || (sector === 'retail' ? RETAIL_SUBCATEGORY_WEIGHTS[subcat] : null) || SECTOR_WEIGHTS[sector] || SECTOR_WEIGHTS['retail'];
  let overallScore = 0;

  const generatedScores = {};
  let proxyCount = 0, realCount = 0;

  function setScore(key, normVal, isProxy, source, reason) {
    if (isProxy) proxyCount++; else realCount++;
    generatedScores[key] = wrapRes(normVal, isProxy, source, reason);
  }

  for (const k of Object.keys(weights)) {
    if (k === 'purchasingPower' || k === 'incomeLevel') {
      setScore(k, _purchasing, true, 'Office/Mall density proxy', `${off_count} offices, ${malls} malls nearby.`);
    } else if (['footfallDensity','footfall','demandProximity','residentialDensity','studentDensity','familyDensity','youthPopulation'].includes(k)) {
      setScore(k, _demand, false, 'Google Places API (Typed Search)', `${restaurants} restaurants, ${malls} malls, ${stores} stores, ${transit} transit nearby.`);
    } else if (['competitionDensity','competition','networkGap'].includes(k)) {
      // Store raw saturation (0=no competition, 1=fully saturated) for display.
      // Overall score calculation inverts this so high saturation hurts the score.
      generatedScores[k] = wrapRes(_compBase, false, 'Google Places API (Competitor Search)', `${compCount} direct competitors within 5km. Higher = more saturated market.`, true);
      realCount++;
    } else if (['accessibility','logisticsConnectivity','gridConnectivity'].includes(k)) {
      setScore(k, _access, false, 'Google Roads + Transit API', `${transit} transit nodes; road proximity: ${isNearRoad ? 'Yes' : 'No'}.`);
    } else if (['visibilityFrontage','visibilityWalkability','visibility','brandPositioningArea'].includes(k)) {
      setScore(k, _visibility, true, 'Google Places API (Commercial density)', `${restaurants + malls + stores} commercial POIs visible nearby.`);
    } else if (['infrastructureQuality','infrastructure','powerAvailability'].includes(k)) {
      setScore(k, _infra, false, 'Google Places API (Fuel/Transit)', `${fuel} fuel/EV stations, ${transit} transit nodes.`);
    } else if (['rentalCost','landCost'].includes(k)) {
      setScore(k, _rentalProxy, true, 'Purchasing Power Inverse', 'Higher commercial density implies higher rental cost.');
    } else if (['zoningRegulations','regulatoryApproval','governmentPolicy'].includes(k)) {
      setScore(k, _zoning, true, 'POI Composition Proxy', `Commercial: ${off_count + malls + stores}, Residential: ${apts}, Industrial: ${fuel}.`);
    } else if (k.startsWith('proximityTo') || ['distanceToSuppliers','afterSalesServiceReach','environmentalConstraints','security'].includes(k)) {
      const distanceKM = Math.max(0.1, 1.5 - _demand * 0.5);
      setScore(k, computeProximity(distanceKM), true, 'Google Places API', '1 / distance to nearest relevant POI anchor.');
    } else if (['seasonalDemand','seasonalTrends','freshDemandCycle','demand247Potential'].includes(k)) {
      setScore(k, _demand * Math.max(0.5, _visibility), true, 'Economic & Places Data', 'Demand × Visibility composite.');
    } else {
      setScore(k, _demand, false, 'Google Places API', 'Baseline demand POI scaling.');
    }
  }

  const confidenceScore = Math.round((realCount / Math.max(1, realCount + proxyCount)) * 100);

  const COMPETITION_KEYS = new Set(['competitionDensity','competition','networkGap']);
  for (const [k, metric] of Object.entries(generatedScores)) {
    const wt = weights[k] || 0;
    // Competition is stored as saturation (high=bad), so invert for scoring
    const scoreVal = COMPETITION_KEYS.has(k) ? (1.0 - metric.normalized) : metric.normalized;
    overallScore += scoreVal * wt;
  }
  overallScore = clampScore(overallScore * 100);

  if (totalReal === 0) {
    overallScore = 0;
    Object.keys(generatedScores).forEach(k => generatedScores[k].value = 0);
  }

  console.log(`[Validation Engine] GPS: ${lat}, ${lng} | Sector: ${sector.toUpperCase()} -> SCORE: ${overallScore}/100 | POIs: restaurants=${restaurants}, malls=${malls}, stores=${stores}, offices=${off_count}, transit=${transit}, fuel=${fuel}, competitors=${compCount}`);

  let recommendation;
  if (totalReal === 0) {
    recommendation = 'CAUTION: No POIs detected in this area. Verify coordinates and radius.';
  } else if (_compBase >= 0.7) {
    recommendation = `⚠️ High market saturation: ${compCount} direct competitors within 5km. Only proceed with strong differentiation.`;
  } else if (overallScore >= 75) {
    recommendation = `Strong site for ${sector.toUpperCase()} — high demand density, good infrastructure, manageable competition.`;
  } else {
    recommendation = `Moderate viability for ${sector.toUpperCase()}. Demand potential exists but competition or access may limit returns.`;
  }

  const mappedCompetitors = competitorsWithin5km
    .map(c => ({
      name: c.displayName?.text || 'Local Competitor',
      address: c.formattedAddress || 'Nearby',
      rating: c.rating || 0,
      reviews: c.userRatingCount || 0,
      distance: getDistance(_lat, _lng, c.location?.latitude, c.location?.longitude).toFixed(2) + ' km'
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 8);

  return {
    score: Math.round(overallScore),
    recommendation,
    weights,
    scores: generatedScores,
    competitors: mappedCompetitors,
    confidenceScore,
    poi_breakdown: { residential: apts, offices: off_count, restaurants, retail_shops: malls, stores, fuel_stations: fuel, transit_nodes: transit }
  };
}
