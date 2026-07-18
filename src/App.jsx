import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapViewer from './components/MapViewer';
import AnalysisPanel from './components/AnalysisPanel';
import { analyzeLocation, fetchAreaInsights, predictOptimalLocations, isLatLngInViewport } from './services/api';
import { Loader2 } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState('ev');
  const [retailCategory, setRetailCategory] = useState('retail store');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const detailsRef = useRef(null);

  useEffect(() => {
    if (!isAnalyzing && analysisData) {
      setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isAnalyzing, analysisData]);
  
  const [analyzedArea, setAnalyzedArea] = useState(null);
  const [bestSector, setBestSector] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapTheme, setMapTheme] = useState('dark');
  const [multiSectorSpots, setMultiSectorSpots] = useState([]);
  const [engineRadius, setEngineRadius] = useState(15);
  /** Geocode viewport for the last area search — predictions stay inside this box. */
  const [cityViewport, setCityViewport] = useState(null);
  
  const [customWeights, setCustomWeights] = useState(null);

  const buildEngineSpots = (predictions) => {
    const sorted = [...(predictions || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    return sorted.map((p, idx) => ({
      name: p.reason ? `Optimal Node #${idx + 1} [Prediction]` : `Predicted Node ${idx + 1}`,
      lat: p.lat,
      lng: p.lng,
      score: p.score,
      sector: p.sector,
      isEngineResult: true,
      rankIndex: idx
    }));
  };

  const handleLocationSelect = async (latLng) => {
    setSelectedLocation(latLng);
    setIsAnalyzing(true);
    setAnalysisData(null);
    setMapCenter({ lat: latLng.lat, lng: latLng.lng });

    try {
      const data = await analyzeLocation(latLng.lat, latLng.lng, selectedTarget, customWeights, retailCategory);

      if (data.locationName && !latLng.name) {
        setSelectedLocation({ ...latLng, name: data.locationName });
      }
      setAnalysisData(data);

      // Update the real score for this engine spot and re-rank all spots by real scores
      if (data.score != null) {
        setMultiSectorSpots(prev => {
          const updated = prev.map(spot => {
            const sameLatLng =
              Math.abs(spot.lat - latLng.lat) < 0.0001 &&
              Math.abs(spot.lng - latLng.lng) < 0.0001;
            return sameLatLng ? { ...spot, score: data.score } : spot;
          });

          // Re-rank engine spots descending by score; non-engine spots keep their position
          const engineSpots = updated
            .filter(s => s.isEngineResult)
            .sort((a, b) => (b.score || 0) - (a.score || 0));
          const others = updated.filter(s => !s.isEngineResult);

          const reRanked = engineSpots.map((s, i) => ({ ...s, rankIndex: i }));
          return [...others, ...reRanked];
        });
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAreaSearch = async (searchParams) => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setSelectedLocation(null);
    try {
      const { state, city, area, radius } = searchParams;
      const formattedArea = [area, city, state].filter(Boolean).join(', ');

      if (radius) {
        setEngineRadius(Number(radius) || 15);
        // AI Location Intelligence Engine Workflow + Standard Workflow
        const insights = await fetchAreaInsights(searchParams);
        const areaViewport = insights.viewport || null;
        setCityViewport(areaViewport);
        let bestRadius = radius;
        let predictions = [];

        // Dynamic Engine Radius Expansion Loop
        while (bestRadius <= 60) {
          predictions = await predictOptimalLocations(
            selectedTarget,
            formattedArea,
            bestRadius,
            null,
            areaViewport,
            customWeights,
            retailCategory
          );

          // Consider a location "valid" if the engine gave it a decently passing score (>45)
          const validLocations = (predictions || []).filter((p) => p.score > 45);

          if (validLocations.length > 0) {
            predictions = validLocations; // Output the validated spots
            break;
          }
          console.warn(`[Engine] No highly viable locations at ${bestRadius}km. Expanding boundary...`);
          bestRadius += 10;
        }

        // If even a 60km span yielded nothing >60 score, default to the best available at 60km.
        if (!predictions || predictions.length === 0) {
          predictions = await predictOptimalLocations(
            selectedTarget,
            formattedArea,
            60,
            null,
            areaViewport,
            customWeights,
            retailCategory
          );
        }

        predictions = (predictions || []).filter((p) =>
          areaViewport ? isLatLngInViewport(p.lat, p.lng, areaViewport) : true
        );
        
        setAnalyzedArea(formattedArea + ` (Engine Expanded Map: ${bestRadius}km)`);
        setBestSector(selectedTarget);
        
        if (predictions && predictions.length > 0) {
          setMapCenter({ lat: predictions[0].lat, lng: predictions[0].lng });
        } else if (insights && insights.center) {
          setMapCenter(insights.center);
        }
        
        const engineSpots = buildEngineSpots(predictions);
        
        // Combine real-world existing spots and predicted optimal spots
        const combinedSpots = [...(insights.allSpots || []), ...engineSpots];
        setMultiSectorSpots(combinedSpots);
        
      } else {
        // Standard Workflow
        const insights = await fetchAreaInsights(searchParams);
        setCityViewport(insights.viewport || null);
        setAnalyzedArea(formattedArea);
        setBestSector(insights.bestSector);
        setMapCenter(insights.center);
        setMultiSectorSpots(insights.allSpots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpotSelect = (spot) => {
    handleLocationSelect({ lat: spot.lat, lng: spot.lng, name: spot.name });
  };

  return (
    <>
      {showWelcome && <WelcomeScreen onEnter={() => setShowWelcome(false)} />}
      <div className="w-screen h-screen flex overflow-hidden bg-dark-900 text-slate-200">
        <Sidebar 
          selectedTarget={selectedTarget} 
          setSelectedTarget={setSelectedTarget}
          retailCategory={retailCategory}
          setRetailCategory={setRetailCategory}
          onAreaSearch={handleAreaSearch}
          analyzedArea={analyzedArea}
          bestSector={bestSector}
          multiSectorSpots={multiSectorSpots}
          onSpotSelect={handleSpotSelect}
          mapTheme={mapTheme}
          setMapTheme={setMapTheme}
          onShowWelcome={() => setShowWelcome(true)}
          customWeights={customWeights}
          setCustomWeights={setCustomWeights}
        />
      
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto hidden-scrollbar relative bg-dark-900 flex flex-col">
        {/* Map Section */}
        <div className={`w-full shrink-0 relative border-b border-white/5 transition-all duration-700 ease-in-out ${
          (!isAnalyzing && analysisData) ? 'h-[65vh]' : 'h-screen'
        }`}>
          <MapViewer 
            onLocationSelect={handleLocationSelect} 
            selectedTarget={selectedTarget}
            dynamicCenter={mapCenter}
            multiSectorSpots={multiSectorSpots}
            mapTheme={mapTheme}
            selectedLocation={selectedLocation}
          />
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-dark-900/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-20 transition-all duration-300">
              <div className="glass-card px-8 py-5 flex items-center gap-5 text-neon-blue border-neon-blue/20 shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                <Loader2 className="animate-spin" size={28} />
                <span className="font-semibold tracking-widest text-sm uppercase">AI Processing Location Data...</span>
              </div>
            </div>
          )}
        </div>

        {/* Details Section directly beneath map */}
        <div ref={detailsRef} className="w-full flex flex-col shrink-0">
          {!isAnalyzing && analysisData && (
            <AnalysisPanel 
              data={analysisData} 
              location={selectedLocation} 
              sector={selectedTarget}
              onClose={() => {
                setAnalysisData(null);
                setSelectedLocation(null);
              }} 
            />
          )}

          
          {/* Bottom Padding */}
          <div className="h-12 w-full shrink-0 bg-dark-900"></div>
        </div>
      </div>
    </div>
    </>
  );
}
