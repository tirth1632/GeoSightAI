// src/components/MapViewer.jsx
import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, InfoWindow } from '@vis.gl/react-google-maps';
import { ChevronDown } from 'lucide-react';
import { fetchPlaceDetailsByLatLng } from '../services/googleMapsService';
import { BatteryCharging, Store, Database, Wifi, Wind, Info, Star } from 'lucide-react';

const MAP_ID = 'e93bfdfcfcf9ec6a';

// India coordinates as default (Center of India)
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const MAP_THEMES = {
  dark: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ],
  mid: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9b2a6" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#b9d3c2" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#92998d" }] }
  ],
  light: []
};

function MapController({ dynamicCenter }) {
  const map = useMap();
  useEffect(() => {
    if (map && dynamicCenter) {
      map.panTo(dynamicCenter);
      map.setZoom(11);
    }
  }, [map, dynamicCenter]);
  return null;
}

export default function MapViewer({ onLocationSelect, selectedTarget, dynamicCenter, multiSectorSpots, mapTheme = 'dark', selectedLocation }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-900/80 text-neon-red">
        <p className="text-center">
          Google Maps API key is missing. Please check the .env file and restart the dev server.
        </p>
      </div>
    );
  }
  const displayData = multiSectorSpots || [];
  const filteredData = displayData.filter(pt => pt.sector === selectedTarget);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [infoPos, setInfoPos] = useState(null);
  const [mapType, setMapType] = useState('roadmap');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [geoNames, setGeoNames] = useState({}); // lat,lng -> area name

  // Reverse geocode engine prediction nodes to show neighbourhood names
  useEffect(() => {
    const enginePts = filteredData.filter(pt => pt.isEngineResult);
    if (enginePts.length === 0 || !apiKey) return;

    enginePts.forEach(async (pt) => {
      const key = `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`;
      if (geoNames[key]) return; // already fetched
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${pt.lat},${pt.lng}&result_type=sublocality|neighborhood|locality&key=${apiKey}`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Pick the most local component: sublocality_level_1 > sublocality > locality
          const result = data.results[0];
          const comp = result.address_components || [];
          const sub = comp.find(c => c.types.includes('sublocality_level_1'))
            || comp.find(c => c.types.includes('sublocality'))
            || comp.find(c => c.types.includes('neighborhood'))
            || comp.find(c => c.types.includes('locality'));
          const name = sub ? sub.long_name : result.formatted_address.split(',')[0];
          setGeoNames(prev => ({ ...prev, [key]: name }));
        }
      } catch (_) {}
    });
  }, [filteredData.length, selectedTarget]);


  const fetchPlaceInfo = async (lat, lng) => {
    setInfoPos({ lat, lng });
    setPlaceInfo(null);
    setLoadingInfo(true);
    const data = await fetchPlaceDetailsByLatLng(lat, lng);
    setPlaceInfo(data || { error: true });
    setLoadingInfo(false);
  };

  const getSectorColorHex = (sector) => {
    const effectiveSector = sector || selectedTarget;
    switch(effectiveSector) {
      case 'ev': return '#00f0ff';
      case 'retail': return '#ff007f';
      case 'warehouse': return '#ff5e00';
      case 'telecom': return '#b026ff';
      case 'energy': return '#39ff14';
      default: return '#00f0ff';
    }
  };

  const getEngineColorHex = (sector) => {
    const effectiveSector = sector || selectedTarget;
    switch(effectiveSector) {
      case 'ev': return '#73f7ff';
      case 'retail': return '#ff66ad';
      case 'warehouse': return '#ff9c5a';
      case 'telecom': return '#ce73ff';
      case 'energy': return '#80ff66';
      default: return '#73f7ff';
    }
  };




  return (
    <div className="absolute inset-0 bg-dark-900 border-l border-white/5">
      <APIProvider apiKey={apiKey}>
        <Map
          key={mapTheme}
          defaultCenter={defaultCenter}
          defaultZoom={5}
          mapId={MAP_ID}
          disableDefaultUI={true}
          mapTypeId={mapType}
          styles={MAP_THEMES[mapTheme] || MAP_THEMES.dark}
          colorScheme={mapTheme === 'light' ? 'LIGHT' : 'DARK'}
          onClick={(e) => {
              // Clear any open popup
              setPlaceInfo(null);
              setInfoPos(null);
              if (e.detail?.latLng) {
                onLocationSelect(e.detail.latLng);
              }
            }}
        >
          <MapController dynamicCenter={dynamicCenter} />
          {/* Render markers only for the selected sector using the standard Map Pin */}
           {filteredData.map((pt, i) => {
             const baseHexColor = getSectorColorHex(pt.sector);
             const engineColorHex = getEngineColorHex(pt.sector);
             const isEngineResult = pt.isEngineResult;
             const isTop5Engine = isEngineResult && pt.rankIndex < 5;
             const hexColor = isEngineResult ? engineColorHex : baseHexColor;
             const isSelected = selectedLocation?.lat === pt.lat && selectedLocation?.lng === pt.lng;
             const pinScale =
               isSelected ? 1.6 : isEngineResult && isTop5Engine ? 1.35 : isEngineResult ? 1.15 : 1.2;

             return (
               <AdvancedMarker
                 key={`${pt.lat}-${pt.lng}-${i}-${pt.isEngineResult ? 'e' : 'r'}`}
                 position={{ lat: pt.lat, lng: pt.lng }}
                 onClick={() => onLocationSelect({ lat: pt.lat, lng: pt.lng, name: pt.name })}
                 zIndex={isSelected ? 2000 : (isTop5Engine ? 1000 : 1)}
               >
                 <div
                   className={`relative flex items-center justify-center transition-transform hover:scale-110 ${isEngineResult ? 'hover:scale-125' : ''} drop-shadow-[0_0_8px_currentColor] ${isSelected ? 'drop-shadow-[0_0_15px_currentColor]' : ''}`}
                   style={{ color: hexColor }}
                 >
                   {isSelected && (
                     <div
                       className="absolute -inset-2 rounded-full animate-ping opacity-60 z-[-1]"
                       style={{ backgroundColor: hexColor }}
                     />
                   )}
                   <Pin
                      background={hexColor}
                      borderColor={isEngineResult ? '#0a1628' : 'white'}
                      glyphColor={isEngineResult ? '#0a1628' : 'white'}
                      scale={pinScale}
                    />
                    <ChevronDown
                      size={12}
                      className="absolute bottom-0 right-0 text-white cursor-pointer opacity-80 hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); fetchPlaceInfo(pt.lat, pt.lng); }}
                    />
                   {isEngineResult && isTop5Engine && (
                     <div
                       className="absolute -top-2 -right-2 min-w-[1rem] h-4 px-0.5 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white/90 shadow-md"
                       style={{ backgroundColor: baseHexColor }}
                     >
                       {pt.rankIndex + 1}
                     </div>
                   )}
                 </div>
               </AdvancedMarker>
             );
          })}

           {infoPos && (
             <InfoWindow
               position={infoPos}
               onCloseClick={() => {
                 setInfoPos(null);
                 setPlaceInfo(null);
               }}
               pixelOffset={[0, -40]}
             >
               <div className="p-3 text-slate-800 max-w-[250px] font-sans">
                 {loadingInfo ? (
                   <div className="flex items-center justify-center p-4">
                     <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full"></div>
                   </div>
                 ) : placeInfo?.error ? (
                   <p className="text-sm text-red-500 font-medium">Details not available.</p>
                 ) : placeInfo ? (
                   <div className="flex flex-col gap-2">
                     <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5">{placeInfo.name}</h3>
                     <p className="text-xs text-slate-600 leading-relaxed break-words">{placeInfo.address}</p>
                     {placeInfo.rating && (
                       <p className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                         ⭐ {placeInfo.rating} / 5
                       </p>
                     )}
                     {placeInfo.phoneNumber && (
                       <p className="text-xs text-slate-700 font-medium">📞 {placeInfo.phoneNumber}</p>
                     )}
                     {placeInfo.googleMapsUrl && (
                       <a
                         href={placeInfo.googleMapsUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="mt-1.5 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
                       >
                         View on Google Maps
                       </a>
                     )}
                   </div>
                 ) : null}
               </div>
             </InfoWindow>
           )}
        </Map>

      </APIProvider>
      
      {/* Overlay controls - top left of map area */}
      <div className="absolute top-6 left-6 z-10 glass-card px-4 py-3 flex gap-4 flex-wrap max-w-2xl bg-dark-800/80">
        <div className="flex items-center gap-2">
           <BatteryCharging size={16} className="text-neon-blue drop-shadow-[0_0_8px_#00f0ff]" />
           <span className="text-xs text-slate-300 font-medium">EV Charging</span>
        </div>
        <div className="flex items-center gap-2">
           <Store size={16} className="text-[#ff007f] drop-shadow-[0_0_8px_#ff007f]" />
           <span className="text-xs text-slate-300 font-medium">Retail</span>
        </div>
        <div className="flex items-center gap-2">
           <Database size={16} className="text-[#ff5e00] drop-shadow-[0_0_8px_#ff5e00]" />
           <span className="text-xs text-slate-300 font-medium">Warehouses</span>
        </div>
        <div className="flex items-center gap-2">
           <Wifi size={16} className="text-[#b026ff] drop-shadow-[0_0_8px_#b026ff]" />
           <span className="text-xs text-slate-300 font-medium">Telecom</span>
        </div>
        <div className="flex items-center gap-2">
           <Wind size={16} className="text-neon-green drop-shadow-[0_0_8px_#39ff14]" />
           <span className="text-xs text-slate-300 font-medium">Renewable</span>
        </div>
        
        {/* Separate Info block for Symbol Meanings */}
        {displayData.length > 0 && (
          <>
            <div className="flex items-center ml-2 border-l border-white/10 pl-4 relative group cursor-help">
              <Info size={16} className="text-slate-400 hover:text-neon-blue transition-colors" />
              <span className="text-xs text-slate-400 ml-1.5 hidden md:block">Meaning</span>
              
              <div className="absolute top-full mt-3 left-0 md:left-full md:mt-0 md:ml-3 md:top-1/2 md:-translate-y-1/2 w-[280px] bg-dark-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Map Marker Meanings</h4>
                {selectedTarget ? (
                  <div className="text-[11px] text-slate-400 space-y-3">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-3 h-4 shrink-0 mt-0.5 rounded-b-full border border-white/80"
                        style={{ backgroundColor: getEngineColorHex(selectedTarget) }}
                      />
                      <p><strong className="text-white font-semibold">Top 5 predictions</strong> <br/>Pins with a rank badge (1–5): highest-scoring AI candidates for the selected sector.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2.5 h-3.5 shrink-0 mt-0.5 rounded-b-full border border-[#0a1628]"
                        style={{ backgroundColor: getEngineColorHex(selectedTarget) }}
                      />
                      <p><strong className="text-white font-semibold">Other predicted sites</strong> <br/>Lighter pins with a dark border — model suggestions that ranked below the top five.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div
                        className="w-2.5 h-3.5 shrink-0 mt-0.5 rounded-b-full border border-white"
                        style={{ backgroundColor: getSectorColorHex(selectedTarget) }}
                      />
                      <p><strong className="text-white font-semibold">Existing locations</strong> <br/>Places returned from maps search for this area (not model-generated).</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Please select an industry sector from the sidebar first to view its specific map marker legend.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Map Type Controls - top right */}
      <div className="absolute top-6 right-6 z-10 glass-card p-1.5 flex gap-1 bg-dark-800/80 rounded-lg border border-white/10 shadow-lg backdrop-blur-md">
        <button 
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mapType === 'roadmap' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          Normal
        </button>
        <button 
          onClick={() => setMapType('hybrid')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${mapType === 'hybrid' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
        >
          Satellite
        </button>
      </div>

      {/* Prediction Leaderboard - Top Right below map tools */}
      {filteredData.some(pt => pt.isEngineResult) && (
        <div className="absolute top-20 right-6 z-10 w-64 glass-card bg-dark-800/90 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden">
             <div className="bg-dark-900/50 p-3 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={12} className="text-neon-blue" /> Prediction Rank
                </h4>
             </div>
             <div className="max-h-[350px] overflow-y-auto hidden-scrollbar p-2 flex flex-col gap-1">
             {filteredData.filter(pt => pt.isEngineResult)
               .sort((a,b) => (a.rankIndex || 99) - (b.rankIndex || 99))
               .slice(0, 10)
               .map((pt, i) => {
                 const geoKey = `${pt.lat.toFixed(5)},${pt.lng.toFixed(5)}`;
                 const areaName = geoNames[geoKey] || null;
                 return (
                   <div
                     key={`${pt.lat}-${pt.lng}`}
                     onClick={() => onLocationSelect({ lat: pt.lat, lng: pt.lng, name: areaName || pt.name })}
                     className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedLocation?.lat === pt.lat ? 'bg-neon-blue/10 border border-neon-blue/30' : 'hover:bg-white/5 border border-transparent'}`}
                   >
                     <div className="w-5 h-5 shrink-0 rounded-full bg-dark-900 border border-white/20 flex items-center justify-center text-[9px] font-bold text-slate-300 shadow-inner">
                       {i + 1}
                     </div>
                     <div className="flex flex-col overflow-hidden">
                       <span className="text-xs text-slate-200 font-medium truncate">
                         {areaName || `Node ${i + 1}`}
                       </span>
                       <span className="text-[9px] text-slate-500 font-mono truncate">{pt.lat.toFixed(4)}, {pt.lng.toFixed(4)}</span>
                     </div>
                   </div>
                 );
               })}
             </div>
        </div>
      )}

    </div>
  );
}
