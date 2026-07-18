import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, Navigation, MapPin, Info, Star, Users, Zap } from 'lucide-react';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

// ── helpers ──────────────────────────────────────────────────────────────────

function getScoreColor(score) {
  if (score >= 80) return 'text-neon-green drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]';
  if (score >= 55) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
  return 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]';
}

function getBarColor(key, val, isCompetition) {
  if (isCompetition) return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'; // always red — high = bad
  if (val >= 75) return 'bg-neon-green shadow-[0_0_8px_rgba(57,255,20,0.5)]';
  if (val >= 45) return 'bg-neon-blue shadow-[0_0_8px_rgba(0,240,255,0.5)]';
  return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]';
}

// Format raw breakdown into readable chips
function getRawChips(key, raw) {
  if (!raw) return [];
  return Object.entries(raw).map(([k, v]) => {
     let icon = "📊";
     if (k.includes('apt') || k.includes('house') || k.includes('pop')) icon = "🏠";
     if (k.includes('office') || k.includes('corp')) icon = "🏢";
     if (k.includes('mall') || k.includes('retail')) icon = "🛍️";
     if (k.includes('comp') || k.includes('rival')) icon = "⚔️";
     if (k.includes('rating')) icon = "⭐";
     if (k.includes('review')) icon = "💬";
     if (k.includes('restaurant') || k.includes('cafe')) icon = "🍽️";
     if (k.includes('transit') || k.includes('bus') || k.includes('train')) icon = "🚉";
     if (k.includes('fuel')) icon = "⛽";
     if (k.includes('road') || k.includes('highway') || k.includes('traffic') || k.includes('connect')) icon = "🛣️";
     if (k.includes('power') || k.includes('grid') || k.includes('energy')) icon = "⚡";
     if (k.includes('terrain') || k.includes('elevation') || k.includes('land')) icon = "⛰️";
     if (k.includes('cost') || k.includes('price') || k.includes('power')) icon = "💰";
     if (k.includes('zone') || k.includes('regulat') || k.includes('gov')) icon = "📜";
     if (k.includes('env') || k.includes('eco')) icon = "🌱";
     
     if (typeof v === 'boolean') {
       return v ? `${icon} Yes` : `🚧 No`;
     }
     
     const label = k.replace(/_/g, ' ');
     return `${icon} ${v} ${label}`;
  }).filter(Boolean);
}

// ── component ─────────────────────────────────────────────────────────────────

export default function AnalysisPanel({ data, onClose, location, sector }) {
  const [llmSummary, setLlmSummary] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);

  useEffect(() => {
    if (data && data.score) {
      const fetchLlmSummary = async () => {
         setLlmLoading(true);
         try {
            const payload = {
                sector: sector || 'retail',
                score: data.score,
                confidenceScore: data.confidenceScore,
                scores: data.scores,
                poi_breakdown: data.poi_breakdown
            };
            const response = await fetch('http://localhost:3001/location-intelligence-summary', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
            });
            const result = await response.json();
            setLlmSummary(result);
         } catch (e) {
            console.error(e);
         } finally {
            setLlmLoading(false);
         }
      };
      // Short delay to avoid race map loading lag
      setTimeout(() => fetchLlmSummary(), 400);
    }
  }, [data?.score, location]);

  if (!data || !data.scores) return null;

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
    environmentalConstraints: "Env. Constraints"
  };

  const chartData = Object.entries(data.scores).map(([key, metric]) => ({
    subject: METRIC_LABELS[key] ? METRIC_LABELS[key].split(' ')[0] : key.substring(0, 8),
    A: metric.value || 0,
    fullMark: 100
  }));

  return (
    <div className="w-full bg-dark-900 border-t border-white/10 flex flex-col animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="p-5 border-b border-white/10 flex justify-between items-center bg-dark-800/40">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            AI Site Readiness Analysis
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <MapPin size={18} className="text-neon-blue" />
            <p className="text-xl font-display text-white font-semibold">
              {location
                ? (location.name || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
                : 'Selected Area'}
            </p>
            {location && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold uppercase tracking-wider text-neon-blue hover:text-white
                           transition-colors ml-4 bg-neon-blue/10 px-3 py-1.5 rounded-full"
              >
                View Map ↗
              </a>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-2.5 bg-white/5 rounded-full
                     hover:bg-white/10 border border-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-12">

        {/* Left: score + radar + recommendation */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Overall Score</p>
              <div className={`text-7xl font-display font-black tracking-tighter ${getScoreColor(data.score)}`}>
                {data.score}
              </div>

            </div>
            <div className="w-32 h-32 opacity-90 drop-shadow-[0_0_10px_rgba(0,240,255,0.2)] ml-auto">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="Site" dataKey="A" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-xl p-5 flex-1 relative
                          overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue" />
            <div className="flex gap-3 text-neon-blue mb-3">
              <TrendingUp size={20} />
              <span className="font-semibold text-sm tracking-widest uppercase">Recommendation</span>
            </div>
            <p className="text-[13px] md:text-sm text-slate-200 leading-relaxed font-medium">
              {data.recommendation}
            </p>
          </div>

          {data.flags && data.flags.length > 0 && (
            <div className={`border rounded-xl p-5 relative overflow-hidden flex flex-col justify-center ${data.reject ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${data.reject ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className={`flex gap-3 mb-3 ${data.reject ? 'text-red-400' : 'text-yellow-400'}`}>
                <AlertTriangle size={20} />
                <span className="font-semibold text-sm tracking-widest uppercase">Policy & Zoning Restrictions</span>
              </div>
              <ul className="text-[13px] md:text-sm text-slate-200 leading-relaxed font-medium space-y-1.5">
                {data.flags.map((flag, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="shrink-0">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Middle: metric bars + raw breakdown */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-5">
              Metric Analysis
            </h4>
            <div className="space-y-5">
              {Object.entries(data.scores).map(([key, metric]) => {
                const chips = getRawChips(key, metric.raw);
                return (
                  <div key={key} className="relative group z-10 hover:z-50">
                    {/* Label row */}
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase
                                       flex items-center gap-1.5">
                        {METRIC_LABELS[key] || key}
                        <Info
                          size={10}
                          className="text-slate-500 group-hover:text-neon-blue transition-colors cursor-help"
                        />
                      </span>
                       <span className="text-xs font-black text-white flex items-center gap-1.5">
                          {metric.value}/100
                        </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full bg-dark-800 rounded-full h-2 border border-white/5">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${getBarColor(key, metric.value, metric.isCompetition)}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>

                    {/* Raw data chips — always visible */}
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {chips.map((chip, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-slate-400 bg-white/5 border border-white/8
                                       px-2 py-0.5 rounded-full font-mono"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Hover reason tooltip */}
                    <div className="absolute z-[100] left-0 top-full mt-2 w-full hidden group-hover:block shadow-2xl">
                      <div className="bg-slate-900 border border-neon-blue/40 shadow-[0_4px_20px_rgba(0,0,0,0.8)] 
                                      p-3 rounded-xl text-[11px] leading-relaxed text-slate-300 relative">
                        <div className="absolute -top-1.5 left-4 w-3 h-3 bg-slate-900 border-t border-l border-neon-blue/40 rotate-45" />
                        <div className="flex flex-col gap-2 relative z-10">
                          <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                            <span className="font-bold text-slate-200">Mathematical Justification</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${metric.isProxy ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-neon-green/20 text-neon-green border border-neon-green/30'}`}>
                              {metric.isProxy ? 'PROXY CALC' : 'REAL DATA'}
                            </span>
                          </div>
                          <p className="text-slate-300">{metric.reason}</p>
                          <div className="bg-dark-900/50 -mx-3 -mb-3 p-2.5 rounded-b-xl border-t border-white/5 mt-1 flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 flex gap-1.5"><Zap size={10} className="text-neon-blue"/> SOURCE</span>
                            <span className="text-[9px] font-medium text-slate-400 font-mono tracking-tighter truncate max-w-[150px]" title={metric.dataSource}>{metric.dataSource || 'Google Places API'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* POI density + rivals cards */}
          <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="glass-card p-4 bg-dark-800/80 border-white/5 rounded-xl border">
              <h5 className="text-[10px] uppercase text-slate-400 font-bold mb-3 flex items-center
                             gap-1.5 tracking-wider">
                <Navigation size={12} className="text-neon-blue" /> POI Density
              </h5>
              <div className="space-y-2 h-[110px] overflow-y-auto hidden-scrollbar">
                {Object.values(data.poi_breakdown).reduce((a, b) => a + b, 0) === 0 ? (
                  <p className="text-[11px] text-slate-500 font-medium mt-1">No POIs detected (check radius)</p>
                ) : (
                  Object.entries(data.poi_breakdown).map(([poiType, count], idx) =>
                    count > 0 && (
                      <div key={idx}
                           className="flex justify-between items-center text-xs border-b border-white/5
                                      pb-1.5 mb-1.5 last:border-0 last:pb-0 last:mb-0">
                        <span className="text-slate-300 pr-2 font-medium capitalize flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-blue/50" />
                          {poiType.replace('_', ' ')}
                        </span>
                        <span className="text-white font-mono font-bold bg-white/5 px-2 py-0.5 rounded-md">
                          {count}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <div className="glass-card p-4 bg-dark-800/80 border-white/5 rounded-xl border">
              <h5 className="text-[10px] uppercase text-slate-400 font-bold mb-3 flex items-center
                             gap-1.5 tracking-wider">
                <AlertTriangle size={12} className="text-rose-400" /> Local Rivals
              </h5>
              <div className="space-y-2 h-[110px] overflow-y-auto hidden-scrollbar">
                {data.competitors && data.competitors.length > 0
                  ? data.competitors.map((comp, idx) => (
                    <div key={idx}
                         className="flex flex-col text-xs border-b border-white/5 pb-2 mb-1.5
                                    last:border-0 last:pb-0 last:mb-0">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 truncate pr-2 font-medium" title={comp.name}>
                          {comp.name}
                        </span>
                        <span className="text-rose-400 font-mono font-medium bg-rose-500/10
                                         px-2 py-0.5 rounded-md shrink-0">
                          {comp.distance}
                        </span>
                      </div>
                      {comp.rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 text-yellow-400/70">
                          <Star size={9} />
                          <span className="text-[10px]">{comp.rating}</span>
                          {comp.reviews > 0 && (
                            <span className="text-slate-500 text-[10px]">({comp.reviews})</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                  : <p className="text-[11px] text-slate-500 font-medium">No competitors within 1.5 km.</p>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right: Street View */}
        <div className="flex flex-col h-[300px] xl:h-auto">
          <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-5">
            Street View 360°
          </h4>
          <div className="w-full flex-1 rounded-xl overflow-hidden border border-white/10 bg-dark-800
                          relative shadow-2xl">
            {location && import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <iframe
                title="Street View"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/streetview?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&location=${location.lat},${location.lng}&heading=210&pitch=10&fov=35&source=OUTDOOR`}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm font-medium">
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Street View Unavailable' : 'Google Maps API key is missing. Please check .env and restart the dev server.'}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LLM Recommendation Engine */}
      <div className="w-full mt-6 bg-dark-900 border-t border-neon-blue/30 p-6 flex flex-col gap-4 relative overflow-hidden">
         {/* Decorative styling */}
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />
         
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center border border-neon-blue/40">
                 <Zap size={16} className="text-neon-blue" />
             </div>
             <div>
                 <h4 className="text-sm font-bold text-slate-200 tracking-wide uppercase">AI Location Intelligence</h4>
                 <p className="text-[10px] text-slate-400 font-mono tracking-widest">Ollama Cloud · gpt-oss:120b</p>
             </div>
         </div>

         {llmLoading ? (
             <div className="flex flex-col items-center justify-center py-6 gap-3">
                 <div className="w-6 h-6 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                 <p className="text-xs font-mono text-neon-blue animate-pulse">Running advanced spatial analysis via Ollama Cloud...</p>
             </div>
         ) : llmSummary ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
                <div className="bg-dark-800/80 border border-neon-green/20 rounded-xl p-4 shadow-[0_0_15px_rgba(57,255,20,0.05)]">
                    <h5 className="text-[11px] uppercase tracking-widest font-black text-neon-green mb-3 flex items-center gap-2">
                        <TrendingUp size={12}/> Competitive Advantages
                    </h5>
                    <ul className="space-y-2">
                        {llmSummary.pros && llmSummary.pros.map((p, i) => (
                           <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-neon-green shrink-0 mt-1" />
                              {p}
                           </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-dark-800/80 border border-rose-500/20 rounded-xl p-4 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
                    <h5 className="text-[11px] uppercase tracking-widest font-black text-rose-500 mb-3 flex items-center gap-2">
                        <AlertTriangle size={12}/> Risk Factors
                    </h5>
                    <ul className="space-y-2">
                        {llmSummary.cons && llmSummary.cons.map((c, i) => (
                           <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                              {c}
                           </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-dark-800/80 border border-white/10 rounded-xl p-4 md:col-span-2 lg:col-span-1 shadow-2xl relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20" />
                    <h5 className="text-[11px] uppercase tracking-widest font-black text-slate-200 mb-3 flex items-center gap-2">
                        <Info size={12}/> Executive Verdict
                    </h5>
                    <p className="text-sm text-slate-300 italic leading-relaxed font-serif">
                       "{llmSummary.conclusion}"
                    </p>
                </div>
             </div>
         ) : null}
      </div>
    </div>
  );
}
