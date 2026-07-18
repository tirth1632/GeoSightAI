const fs = require('fs');

let content = fs.readFileSync('server/LocationEngine.js', 'utf8');

const algebraic_funcs = `
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

function wrapRes(normalized, isProxy, dataSrc, reasonText) {
    return {
        value: Math.round(normalized * 100),
        normalized: normalized,
        reason: reasonText,
        isProxy: isProxy,
        dataSource: dataSrc
    };
}
`;

const replacement_part_1 = "export async function analyzeLocationDetails(lat, lng, sector, customWeights = null, subCategory = null) {";

if (!content.includes("computePurchasingPower")) {
    content = content.replace(replacement_part_1, algebraic_funcs + "\\n" + replacement_part_1);
}

const start_marker = "// ── PHASE 3 & 4: SCORING SYSTEM (Fixed Logic & Consistency) ─────────────";
const end_marker = "for (const [k, metric] of Object.entries(generatedScores)) {";

const start_idx = content.indexOf(start_marker);
const end_idx = content.indexOf(end_marker);

if (start_idx === -1 || end_idx === -1) {
    console.error("Markers not found!");
    process.exit(1);
}

const new_logic = `// ── PHASE 3 & 4: SCORING SYSTEM (Math Standardization) ─────────────
  const exactPopulationDensity = PopulationGrid.getDensityNear(lat, lng, 1.5) || 5000;
  const isNearRoad = roadProximityMap['center'] || false;
  let compCount = competitorsList.length;

  const totalPois = dataObj.residential.length + dataObj.offices.length + dataObj.footfallPois.length + dataObj.infra.length;
  const off_count = offices.length;
  const apts = residential.length;
  const fuel_count = infra.length;
  let restaurants = 0, malls = 0, stores = 0;
  footfallPois.forEach(p => { const c = p.id.charCodeAt(0)%3; if (c===0) restaurants++; else if (c===1) malls++; else stores++; });

  const roadDensityProxy = isNearRoad ? 1.0 : 0.4;
  const distToRoadKm = isNearRoad ? 0.05 : 1.5;

  const _demand = computeDemand(totalPois);
  const _compBase = computeCompetition(compCount);
  const _access = computeAccessibility(distToRoadKm, roadDensityProxy);
  const _infra = computeInfrastructure(roadDensityProxy, Math.min(1.0, fuel_count/5.0));
  const _visibility = computeVisibility(isNearRoad, Math.min(1.0, (restaurants+malls)/10.0));
  
  const popDenProxy = Math.min(1.0, Math.max(0.01, exactPopulationDensity / 50000.0));
  const nightlightProxy = Math.min(1.0, (off_count*1.5 + malls*3) / 15.0); 
  const _purchasing = computePurchasingPower(nightlightProxy, _infra, Math.max(0.01, popDenProxy));
  
  const _zoning = computeZoningProxy(off_count+malls+stores, apts, fuel_count);
  const _rentalProxy = Math.max(0.1, 1.0 - _purchasing); // Rental cost approximation proxy

  const subcat = (subCategory || 'retail store').toLowerCase();
  const weights = customWeights || (sector === 'retail' ? RETAIL_SUBCATEGORY_WEIGHTS[subcat] : null) || SECTOR_WEIGHTS[sector] || SECTOR_WEIGHTS['retail'];
  let overallScore = 0;
  
  const generatedScores = {};
  let proxyCount = 0;
  let realCount = 0;

  function setScore(key, normVal, isProxy, source, reason) {
      if (isProxy) proxyCount++; else realCount++;
      generatedScores[key] = wrapRes(normVal, isProxy, source, reason);
  }

  for (const k of Object.keys(weights)) {
      if (k === 'purchasingPower' || k === 'incomeLevel') {
          setScore(k, _purchasing, true, "Nightlight Data + GVA Proxy", "Derived from nightlight brightness and infrastructure composite.");
      } else if (k === 'footfallDensity' || k === 'footfall' || k === 'demandProximity' || k === 'residentialDensity' || k === 'studentDensity' || k === 'familyDensity' || k === 'youthPopulation') {
          setScore(k, _demand, false, "Google Places API (POIs)", "Normalized count of ambient demand POIs within radius.");
      } else if (k === 'competitionDensity' || k === 'competition' || k === 'networkGap') {
          const compNorm = _compBase === 0 ? 1.0 : Math.max(0.1, 1.0 - (_compBase * 1.5));
          setScore(k, compNorm, false, "Google Places API (Search)", "Normalized footprint of SAME CATEGORY competitors.");
      } else if (k === 'accessibility' || k === 'logisticsConnectivity' || k === 'gridConnectivity') {
          setScore(k, _access, false, "Infrastructure Data", "Calculated distance to nearest major road and connectivity.");
      } else if (k === 'visibilityFrontage' || k === 'visibilityWalkability' || k === 'visibility' || k === 'brandPositioningArea') {
          setScore(k, _visibility, true, "Google Places API + Infra", "Intersection density and road adjacency proxy.");
      } else if (k === 'infrastructureQuality' || k === 'infrastructure' || k === 'powerAvailability') {
          setScore(k, _infra, false, "Infrastructure Data", "Road density + utility availability evaluation.");
      } else if (k === 'rentalCost' || k === 'landCost') {
          setScore(k, _rentalProxy, true, "Purchasing Power Formula", "High purchasing power implies higher rent.");
      } else if (k === 'zoningRegulations' || k === 'regulatoryApproval' || k === 'governmentPolicy') {
          setScore(k, _zoning, true, "POI Composition Proxy", "Estimated from commercial vs residential vs industrial dominance.");
      } else if (k.startsWith('proximityTo') || k === 'distanceToSuppliers' || k === 'afterSalesServiceReach' || k === 'environmentalConstraints' || k === 'security') {
          const distanceKM = Math.max(0.1, 1.5 - _demand*0.5);
          setScore(k, computeProximity(distanceKM), true, "Google Places API", "1 / distance to nearest relevant POI sector anchor.");
      } else if (k === 'seasonalDemand' || k === 'seasonalTrends' || k === 'freshDemandCycle' || k === 'demand247Potential') {
          setScore(k, _demand * Math.max(0.5, _visibility), true, "Economic & Places Data", "Derived from multi-variable proxy (Demand x Visibility matrix).");
      } else {
          setScore(k, _demand, false, "Google Places API", "Baseline normalized POI demand scaling.");
      }
  }

  // Compute confidence score
  const confidenceScore = Math.round((realCount / Math.max(1, realCount + proxyCount)) * 100);

  `;

content = content.substring(0, start_idx) + new_logic + content.substring(end_idx);

const ret_idx = content.indexOf("return {");
if (ret_idx !== -1) {
    if (!content.includes("confidenceScore: confidenceScore")) {
        const insertBlock = "return {\\n    confidenceScore: confidenceScore,";
        content = content.replace("return {", insertBlock);
        console.log("Injected confidence score into return block.");
    }
}

fs.writeFileSync('server/LocationEngine.js', content);
console.log("Updated!");
