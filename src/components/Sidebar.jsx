// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Settings2, Map, Zap, Database, SlidersHorizontal, BatteryCharging, Store, Wifi, Wind, Search, MapPin, ChevronDown, ChevronUp, Sun, Moon } from 'lucide-react';
import { fetchPlaceDetailsByLatLng } from '../services/googleMapsService';

const targets = [
  { id: 'ev', label: 'EV Charging', icon: BatteryCharging, active: true },
  { id: 'retail', label: 'Retail Stores', icon: Store, active: false },
  { id: 'warehouse', label: 'Warehouses', icon: Database, active: false },
  { id: 'telecom', label: 'Telecom Towers', icon: Wifi, active: false },
  { id: 'energy', label: 'Renewable', icon: Wind, active: false },
];

import { State, City } from 'country-state-city';

const indianStates = State.getStatesOfCountry('IN');

const retailSubcategories = [
  "retail store",
  "ice-cream shop",
  "grocery shop",
  "apparel shop",
  "toys shop",
  "sports shop",
  "electronic shop",
  "medical shop",
  "stationary shop",
  "footwear store",
  "bakery store", 
  "jewellery store"
];

const SECTOR_WEIGHTS = {
  ev: { 
    demandProximity: 30, 
    accessibility: 25, 
    infrastructure: 25, 
    competition: 20 
  },
  retail: { 
    footfallDensity: 30, 
    purchasingPower: 20, 
    visibilityFrontage: 20, 
    competitionDensity: 20, 
    rentalCost: 10 
  },
  warehouse: { 
    logisticsConnectivity: 30, 
    infrastructureQuality: 25, 
    landCost: 20, 
    zoningRegulations: 15, 
    distanceToSuppliers: 10 
  },
  telecom: { 
    populationCoverage: 30, 
    elevationTerrain: 25, 
    networkGap: 20, 
    powerAvailability: 15, 
    regulatoryApproval: 10 
  },
  energy: { 
    resourceAvailability: 35, 
    landAvailability: 20, 
    gridConnectivity: 20, 
    governmentPolicy: 15, 
    environmentalConstraints: 10 
  }
};

const RETAIL_SUBCATEGORY_WEIGHTS = {
  "retail store": { footfallDensity: 30, purchasingPower: 20, visibilityFrontage: 20, competitionDensity: 20, rentalCost: 10 },
  "ice-cream shop": { footfallDensity: 35, visibilityWalkability: 25, competitionDensity: 15, seasonalDemand: 15, rentalCost: 10 },
  "grocery shop": { residentialDensity: 35, accessibility: 20, competitionDensity: 20, purchasingPower: 15, parkingAvailability: 10 },
  "apparel shop": { purchasingPower: 30, footfallDensity: 25, visibility: 20, competitionDensity: 15, rentalCost: 10 },
  "toys shop": { familyDensity: 30, footfall: 25, visibility: 20, competition: 15, seasonalTrends: 10 },
  "sports shop": { youthPopulation: 25, incomeLevel: 20, accessibility: 20, competition: 20, visibility: 15 },
  "electronic shop": { purchasingPower: 30, accessibility: 20, competitionDensity: 20, visibility: 15, afterSalesServiceReach: 15 },
  "medical shop": { proximityToHospitalsClinics: 40, accessibility: 20, residentialDensity: 15, competition: 15, demand247Potential: 10 },
  "stationary shop": { studentDensity: 35, proximityToSchoolsColleges: 25, footfall: 15, competition: 15, rentalCost: 10 },
  "footwear store": { footfallDensity: 30, purchasingPower: 25, visibility: 20, competition: 15, rentalCost: 10 },
  "bakery store": { footfallDensity: 30, residentialDensity: 25, visibility: 20, competition: 15, freshDemandCycle: 10 },
  "jewellery store": { purchasingPower: 40, security: 20, visibility: 15, brandPositioningArea: 15, competition: 10 }
};

const METRIC_COLORS = {
  // EV
  demandProximity: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]",
  accessibility: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  infrastructure: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  competition: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  // Retail
  footfallDensity: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  purchasingPower: "bg-cyan-500 drop-shadow-[0_0_8px_#22d3ee]",
  visibilityFrontage: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  competitionDensity: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  rentalCost: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  // Warehouse
  logisticsConnectivity: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]",
  infrastructureQuality: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  landCost: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  zoningRegulations: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  distanceToSuppliers: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  // Telecom
  populationCoverage: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]",
  elevationTerrain: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  networkGap: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  powerAvailability: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  regulatoryApproval: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  // Energy
  resourceAvailability: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  landAvailability: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  gridConnectivity: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]",
  governmentPolicy: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  environmentalConstraints: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  visibilityWalkability: "bg-cyan-500 drop-shadow-[0_0_8px_#22d3ee]",
  seasonalDemand: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  residentialDensity: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  parkingAvailability: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  familyDensity: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  footfall: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  visibility: "bg-cyan-500 drop-shadow-[0_0_8px_#22d3ee]",
  seasonalTrends: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  youthPopulation: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]",
  incomeLevel: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  afterSalesServiceReach: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  proximityToHospitalsClinics: "bg-neon-green drop-shadow-[0_0_8px_#39ff14]",
  demand247Potential: "bg-cyan-500 drop-shadow-[0_0_8px_#22d3ee]",
  studentDensity: "bg-rose-500 drop-shadow-[0_0_8px_#f43f5e]",
  proximityToSchoolsColleges: "bg-yellow-400 drop-shadow-[0_0_8px_#facc15]",
  freshDemandCycle: "bg-orange-500 drop-shadow-[0_0_8px_#f97316]",
  security: "bg-purple-500 drop-shadow-[0_0_8px_#a855f7]",
  brandPositioningArea: "bg-neon-blue drop-shadow-[0_0_8px_#00f0ff]"
};

const METRIC_LABELS = {
  demandProximity: "Demand Proximity",
  accessibility: "Accessibility",
  infrastructure: "Infrastructure",
  competition: "Competition",
  footfallDensity: "Footfall Density",
  purchasingPower: "Purchasing Power",
  visibilityFrontage: "Visibility & Frontage",
  competitionDensity: "Competition Density",
  rentalCost: "Rental Cost",
  logisticsConnectivity: "Logistics Connectivity",
  infrastructureQuality: "Infrastructure Quality",
  landCost: "Land Cost",
  zoningRegulations: "Zoning & Regulations",
  distanceToSuppliers: "Dist. to Suppliers",
  populationCoverage: "Population Coverage",
  elevationTerrain: "Elevation & Terrain",
  networkGap: "Network Gap",
  powerAvailability: "Power Availability",
  regulatoryApproval: "Regulatory Approval",
  resourceAvailability: "Resource (Solar/Wind)",
  landAvailability: "Land Availability",
  gridConnectivity: "Grid Connectivity",
  governmentPolicy: "Policy & Incentives",
  environmentalConstraints: "Env. Constraints",
  visibilityWalkability: "Visibility & Walkability",
  seasonalDemand: "Seasonal Demand",
  residentialDensity: "Residential Density",
  parkingAvailability: "Parking Availability",
  familyDensity: "Family Density",
  footfall: "Footfall",
  visibility: "Visibility",
  seasonalTrends: "Seasonal Trends",
  youthPopulation: "Youth Population",
  incomeLevel: "Income Level",
  afterSalesServiceReach: "After-Sales Service",
  proximityToHospitalsClinics: "Proximity to Medical",
  demand247Potential: "24/7 Demand Potential",
  studentDensity: "Student Density",
  proximityToSchoolsColleges: "Proximity to Schools",
  freshDemandCycle: "Fresh Demand Cycle",
  security: "Security",
  brandPositioningArea: "Brand Positioning"
};

export default function Sidebar({ selectedTarget, setSelectedTarget, retailCategory, setRetailCategory, onAreaSearch, analyzedArea, bestSector, multiSectorSpots, onSpotSelect, mapTheme, setMapTheme, onShowWelcome, customWeights, setCustomWeights }) {
  const [stateInput, setStateInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [expandedSpot, setExpandedSpot] = useState(null);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditingWeights, setIsEditingWeights] = useState(false);

  React.useEffect(() => {
    setCustomWeights(null);
    setIsEditingWeights(false);
  }, [selectedTarget, setCustomWeights]);

  const handleWeightChange = (key, rawNewValue) => {
    const baseWeights = selectedTarget === 'retail' ? RETAIL_SUBCATEGORY_WEIGHTS[retailCategory] : SECTOR_WEIGHTS[selectedTarget];
    let sourceWeights = customWeights || Object.fromEntries(Object.entries(baseWeights).map(([k,v]) => [k, v/100]));
    
    const oldVal = sourceWeights[key];
    const newVal = rawNewValue / 100;
    const diff = newVal - oldVal;
    
    const otherKeys = Object.keys(sourceWeights).filter(k => k !== key);
    let totalOther = otherKeys.reduce((sum, k) => sum + sourceWeights[k], 0);
    
    const newWeights = { ...sourceWeights };
    newWeights[key] = newVal;
    
    if (totalOther > 0) {
      otherKeys.forEach(k => {
        let oldOther = sourceWeights[k];
        let change = diff * (oldOther / totalOther);
        let updated = Math.max(0, oldOther - change);
        newWeights[k] = updated;
      });
    } else if (diff < 0) {
      let split = Math.abs(diff) / otherKeys.length;
      otherKeys.forEach(k => newWeights[k] = split);
    }
    
    // Normalize to exactly 1.0 to avoid float drift
    const total = Object.values(newWeights).reduce((sum, v) => sum + v, 0);
    if (total > 0) {
      Object.keys(newWeights).forEach(k => newWeights[k] = newWeights[k] / total);
    }
    
    setCustomWeights(newWeights);
  };

  const handleExpand = async (e, spot) => {
    e.stopPropagation();
    const spotId = `${spot.lat}-${spot.lng}`;
    if (expandedSpot === spotId) {
      setExpandedSpot(null);
      return;
    }
    setExpandedSpot(spotId);
    setLoadingDetails(true);
    setPlaceDetails(null);
    const data = await fetchPlaceDetailsByLatLng(spot.lat, spot.lng, spot.placeId);
    setPlaceDetails(data || { error: true });
    setLoadingDetails(false);
  };

  const selectedStateObj = indianStates.find(s => s.name === stateInput);
  const citiesForState = selectedStateObj ? City.getCitiesOfState('IN', selectedStateObj.isoCode) : [];

  const nearestSpots = [...(multiSectorSpots || [])]
    .filter(s => s.sector === selectedTarget && !s.isEngineResult)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleSearch = (customRetailCategory = retailCategory) => {
    if (stateInput.trim() || cityInput.trim() || areaInput.trim()) {
      onAreaSearch({ state: stateInput, city: cityInput, area: areaInput, radius: 10, retailCategory: customRetailCategory });
    }
  };

  return (
    <div className="w-[400px] h-full glass-panel flex flex-col p-6 z-10 relative overflow-y-auto">
      <div className="flex items-center justify-between mb-8 shrink-0 relative">
        <div 
          className="flex items-center gap-3 text-neon-blue cursor-pointer group"
          onClick={onShowWelcome}
          title="Return to Welcome Screen"
        >
          <Map size={28} className="animate-pulse-slow drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] group-hover:scale-110 transition-transform" />
          <h1 className="font-display font-bold text-2xl tracking-wide neon-text-blue group-hover:drop-shadow-[0_0_15px_rgba(0,240,255,1)] transition-all">
            GeoXalyze
          </h1>
        </div>
        
        {/* Modern 2-State Theme Toggle (Dark/Light Map) */}
        <div 
          className={`relative w-[84px] h-7 shrink-0 rounded-full cursor-pointer flex items-center p-1 transition-all duration-300 ${
            mapTheme === 'light' 
              ? 'bg-[#e2e6eb] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]' 
              : 'bg-[#292c3a] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
          }`}
          onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
        >
          {/* Text Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
            <div className={`transition-opacity duration-300 flex flex-col items-center ${mapTheme !== 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-[8px] font-black text-[#5e657a] tracking-widest leading-none mb-0.5">DARK</span>
              <span className="text-[5px] font-bold text-[#5e657a] tracking-widest leading-none">MODE</span>
            </div>
            <div className={`transition-opacity duration-300 flex flex-col items-center ${mapTheme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-[8px] font-black text-[#8a91a3] tracking-widest leading-none mb-0.5">LIGHT</span>
              <span className="text-[5px] font-bold text-[#8a91a3] tracking-widest leading-none">MODE</span>
            </div>
          </div>
          
          {/* Thumb */}
          <div 
            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              mapTheme === 'light' 
                ? 'bg-[#f0f3f6] translate-x-0 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-1px_-1px_3px_rgba(255,255,255,0.8)]' 
                : 'bg-[#333748] translate-x-[54px] shadow-[2px_2px_3px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(255,255,255,0.05)]'
            }`}
          >
            {mapTheme === 'light' ? (
              <Sun size={12} className="text-[#8a91a3]" />
            ) : (
              <Moon size={12} className="text-[#a0a6b8]" strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <select 
              className="w-full bg-dark-700/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-neon-blue/50 text-white transition-colors appearance-none cursor-pointer"
              value={stateInput}
              onChange={(e) => {
                setStateInput(e.target.value);
                setCityInput('');
              }}
            >
              <option value="" disabled>Select State</option>
              {indianStates.map(state => (
                <option key={state.isoCode} value={state.name} className="bg-dark-800 text-white">{state.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select 
              className={`w-full bg-dark-700/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-neon-blue/50 text-white transition-colors appearance-none ${!stateInput ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              disabled={!stateInput}
            >
              <option value="" disabled>Select City</option>
              {citiesForState.map((city, idx) => (
                <option key={`${city.name}-${idx}`} value={city.name} className="bg-dark-800 text-white">{city.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Area (Optional, e.g. Viman Nagar)"
              className="w-full bg-dark-700/50 border border-white/10 rounded-xl py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-neon-blue/50 text-white placeholder-slate-500 transition-colors"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={() => handleSearch()} className="absolute right-3 top-2.5 text-[#ffd700] hover:text-white drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] transition-colors" title="Run Intelligence Location Engine">
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 shrink-0">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          {analyzedArea ? `Analysis for ${analyzedArea}` : 'Target Site Type'}
        </h2>
        <div className="space-y-2">
          {targets.map((t) => {
            const Icon = t.icon;
            const isActive = t.id === selectedTarget;
            return (
              <div key={t.id} className="w-full">
                <button
                  onClick={() => setSelectedTarget(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-dark-600/80 neon-border-blue border text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'hover:bg-dark-700/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-neon-blue' : ''} />
                  <span className="font-medium">{t.label}</span>
                  {analyzedArea && bestSector === t.id && (
                    <span className="ml-auto text-[10px] bg-neon-blue/20 text-neon-blue px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Best Fit</span>
                  )}
                </button>
                
                {isActive && t.id === 'retail' && (
                  <div className="mt-2 relative animate-in slide-in-from-top-2 fade-in duration-200">
                    <select 
                      className="w-full bg-dark-800/80 border border-white/5 rounded-xl py-2.5 pl-4 pr-8 text-sm focus:outline-none focus:border-neon-blue/30 text-slate-300 appearance-none cursor-pointer"
                      value={retailCategory}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setRetailCategory(newCat);
                        setCustomWeights(null); // Reset weights so new default renders
                      }}
                    >
                      {retailSubcategories.map(rt => (
                        <option key={rt} value={rt} className="bg-dark-900 capitalize">{rt}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-6 shrink-0">
        <button 
          onClick={() => handleSearch()} 
          className="w-full bg-neon-blue text-dark-900 font-bold py-3 rounded-xl tracking-wide uppercase text-sm shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all flex justify-center items-center gap-2"
        >
          <Search size={18} />
          Analyse Region
        </button>
      </div>

      {/* Show Nearby Spots if Searched */}
      {nearestSpots.length > 0 && (
        <div className="mb-6 shrink-0">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Detected Existing Location</h2>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 pb-2">
            {nearestSpots.map((spot, idx) => {
              const spotId = `${spot.lat}-${spot.lng}`;
              const isExpanded = expandedSpot === spotId;

              return (
              <div 
                key={idx} 
                className="glass-card flex flex-col p-3 transition-colors border-white/5 hover:border-white/20"
              >
                <div 
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => onSpotSelect(spot)}
                >
                  <div className="flex items-center gap-2 text-slate-200 flex-1 pr-2">
                    <MapPin size={14} className="text-neon-blue shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-tight">{spot.name}</span>
                  </div>
                  <div 
                    className="p-1 cursor-pointer hover:bg-white/10 rounded shrink-0 ml-1" 
                    title="View Google Maps details"
                    onClick={(e) => handleExpand(e, spot)}
                  >
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400 hover:text-white" /> : <ChevronDown size={16} className="text-slate-400 hover:text-white" />}
                  </div>
                </div>

                <div className="flex justify-between items-center pl-6 mt-1.5 cursor-pointer" onClick={() => onSpotSelect(spot)}>
                  <span className="text-[11px] text-slate-400">Google Rating Score</span>
                  <span className="text-xs font-bold text-[#ffd700]">★ {spot.rating ? spot.rating : 'N/A'}{spot.rating ? ' / 5' : ''}</span>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                   <div className="mt-3 pl-6 border-t border-white/10 pt-3">
                     {loadingDetails ? (
                       <div className="flex justify-center p-2">
                         <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-neon-blue rounded-full"></div>
                       </div>
                     ) : placeDetails?.error ? (
                       <p className="text-xs text-red-400 py-1">Details not available.</p>
                     ) : placeDetails ? (
                        <div className="flex flex-col gap-2 align-left">
                          <p className="text-xs text-slate-300 leading-snug">{placeDetails.address}</p>
                          
                          {placeDetails.rating && (
                            <div className="flex items-center gap-3">
                              <p className="text-xs font-medium text-amber-500 flex items-center gap-1">
                                ⭐ {placeDetails.rating} <span className="text-slate-500 font-normal">/ 5</span>
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3 mt-2">
                            {placeDetails.googleMapsUrl && (
                              <a
                                href={placeDetails.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-wider font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-3 py-1.5 rounded-lg hover:bg-neon-blue/20 hover:scale-105 transition-all w-fit flex items-center gap-1"
                              >
                                MAP LINK ↗
                              </a>
                            )}
                            {placeDetails.phoneNumber && (
                              <a
                                href={`tel:${placeDetails.phoneNumber.replace(/[^\d+]/g, '')}`}
                                className="text-[10px] uppercase tracking-wider font-bold text-neon-green bg-neon-green/10 border border-neon-green/30 px-3 py-1.5 rounded-lg hover:bg-neon-green/20 hover:scale-105 transition-all w-fit flex items-center gap-1"
                              >
                                📞 PHONE
                              </a>
                            )}
                          </div>
                        </div>
                      ) : null}
                   </div>
                )}
              </div>
            )})}
          </div>
        </div>
      )}

      {nearestSpots.length === 0 && (
        <div className="mb-6 shrink-0 relative flex flex-col group mt-auto min-h-[220px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Score Weights</h2>
            <button 
              onClick={() => setIsEditingWeights(!isEditingWeights)}
              className={`p-1.5 rounded transition-all ${isEditingWeights ? 'bg-neon-blue/20 text-neon-blue' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              title="Manually Adjust AI Priority Weights"
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
          
          <div className="space-y-5">
            {Object.entries(customWeights ? Object.fromEntries(Object.entries(customWeights).map(([k,v])=>[k, v*100])) : (selectedTarget === 'retail' ? RETAIL_SUBCATEGORY_WEIGHTS[retailCategory] : SECTOR_WEIGHTS[selectedTarget])).map(([key, value], _, array) => {
               const totalWeight = array.reduce((sum, [_, v]) => sum + v, 0);
               const normalizedPercentage = totalWeight > 0 ? Math.round((value / totalWeight) * 100) : 0;
               return <WeightSlider key={key} id={key} label={METRIC_LABELS[key] || key} value={normalizedPercentage} color={METRIC_COLORS[key]} isEditing={isEditingWeights} onChange={handleWeightChange} />
            })}
          </div>
          
          <div className="mt-4 text-[10px] text-slate-500 italic px-2">
            * Scoring mathematically optimized for {targets.find(t=>t.id===selectedTarget)?.label} framework.
          </div>
        </div>
      )}
    </div>
  );
}

function WeightSlider({ id, label, value, color, isEditing, onChange }) {
  const percentage = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm text-slate-400 tabular-nums">{percentage}%</span>
      </div>
      {isEditing ? (
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={percentage} 
          onChange={(e) => onChange && onChange(id, parseInt(e.target.value, 10))}
          className={`w-full h-1.5 bg-dark-900 rounded-lg appearance-none cursor-ew-resize accent-[${color.split(' ')[0].replace('bg-', '')}]`}
          style={{
             background: `linear-gradient(to right, ${color.includes('blue') ? '#00f0ff' : color.includes('purple') ? '#a855f7' : color.includes('rose') ? '#f43f5e' : color.includes('green') ? '#39ff14' : color.includes('yellow') ? '#facc15' : color.includes('cyan') ? '#22d3ee' : '#f97316'} ${percentage}%, #1a1d2d ${percentage}%)`
          }}
        />
      ) : (
        <div className="w-full bg-dark-900 rounded-full h-1.5 border border-white/5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${color} shadow-[0_0_8px_currentColor] transition-all duration-700 ease-out`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}
