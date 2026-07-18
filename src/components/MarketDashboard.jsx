import React from 'react';
import { Store, Star, Coffee, Briefcase, ShoppingBag, Train } from 'lucide-react';

export default function MarketDashboard({ marketData }) {
  if (!marketData) return null;

  const { competitors, footfall_score, poi_counts, insight, competitor_count, avg_rating } = marketData;

  const getFootfallColor = (score) => {
    if (score >= 70) return 'bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.6)]';
    if (score >= 40) return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]';
    return 'bg-slate-500';
  };

  const getCompetitorHighlight = () => {
    if (competitor_count > 5) return 'text-rose-500 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)] bg-rose-500/10';
    if (competitor_count > 0) return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
    return 'text-neon-green border-neon-green/50 shadow-[0_0_10px_rgba(57,255,20,0.2)] bg-neon-green/10';
  };

  return (
    <div className="w-full h-full bg-dark-900 p-4 md:p-6 flex flex-col xl:flex-row gap-6 animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto hidden-scrollbar">
      
      {/* 1. Insight Panel */}
      <div className="xl:w-1/3 flex flex-col justify-center">
        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Store size={14} className="text-neon-blue" /> Market Intelligence
        </h3>
        <p className="text-[13px] md:text-sm text-slate-200 leading-relaxed font-medium bg-dark-800/50 p-4 rounded-xl border border-white/5 relative">
          <span className="absolute left-0 top-0 h-full w-1bg-neon-blue rounded-l-xl"></span>
          {insight}
        </p>
        <div className="flex gap-4 mt-4">
          <div className={`px-4 py-2 rounded-lg border flex flex-col items-center gap-0.5 justify-center flex-1 ${getCompetitorHighlight()}`}>
            <span className="text-lg font-black">{competitor_count}</span>
            <span className="text-[9px] uppercase tracking-wider font-bold">Threat level</span>
          </div>
          {avg_rating > 0 && (
            <div className="px-4 py-2 rounded-lg border border-white/10 bg-dark-800 flex flex-col gap-0.5 items-center justify-center flex-1 text-yellow-400">
              <span className="text-lg font-black flex items-center gap-1"><Star size={14} fill="currentColor" /> {avg_rating}</span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Avg Rating</span>
            </div>
          )}
        </div>
      </div>

      <div className="hidden xl:block w-px bg-white/10 my-4"></div>

      {/* 2. Footfall & POIs */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-5">
          <div className="flex justify-between items-end mb-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Footfall Density
            </h4>
            <span className="text-lg font-black text-white">{footfall_score}/100</span>
          </div>
          <div className="w-full bg-dark-800 rounded-full h-3 border border-white/5 relative overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${getFootfallColor(footfall_score)}`} style={{ width: `${footfall_score}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
           <div className="bg-dark-800/80 rounded-xl p-3 flex flex-col items-center border border-white/5 hover:border-white/20 transition-colors">
              <Coffee size={18} className="text-slate-400 mb-1.5 drop-shadow-md" />
              <span className="text-xl font-display font-bold text-white">{poi_counts?.restaurants || 0}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Dining</span>
           </div>
           <div className="bg-dark-800/80 rounded-xl p-3 flex flex-col items-center border border-white/5 hover:border-white/20 transition-colors">
              <Briefcase size={18} className="text-slate-400 mb-1.5 drop-shadow-md" />
              <span className="text-xl font-display font-bold text-white">{poi_counts?.offices || 0}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Offices</span>
           </div>
           <div className="bg-dark-800/80 rounded-xl p-3 flex flex-col items-center border border-white/5 hover:border-white/20 transition-colors">
              <ShoppingBag size={18} className="text-slate-400 mb-1.5 drop-shadow-md" />
              <span className="text-xl font-display font-bold text-white">{poi_counts?.malls || 0}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Retail</span>
           </div>
           <div className="bg-dark-800/80 rounded-xl p-3 flex flex-col items-center border border-white/5 hover:border-white/20 transition-colors">
              <Train size={18} className="text-slate-400 mb-1.5 drop-shadow-md" />
              <span className="text-xl font-display font-bold text-white">{poi_counts?.transit || 0}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wide">Transit</span>
           </div>
        </div>
      </div>

      <div className="hidden xl:block w-px bg-white/10 my-4"></div>

      {/* 3. Competitors Breakdown */}
      <div className="xl:w-1/3 flex flex-col">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Top Local Competitors</h4>
        <div className="space-y-2.5 overflow-y-auto pr-2 hidden-scrollbar flex-1">
          {competitors && competitors.length > 0 ? competitors.map((comp, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-dark-800/60 border border-white/5 hover:border-white/10 transition-colors relative overflow-hidden group">
              <div className="absolute left-0 top-0 w-1 h-full bg-slate-700 group-hover:bg-rose-500 transition-colors"></div>
              <div className="w-[70%] pl-2">
                <p className="text-sm text-slate-200 font-semibold truncate" title={comp.name}>{comp.name}</p>
                <div className="flex gap-3 items-center mt-1">
                  <span className="text-[11px] text-neon-blue font-mono font-medium">{comp.distance_km}km awy</span>
                  {comp.rating > 0 && (
                    <span className="text-[11px] text-yellow-400 flex items-center gap-0.5 font-mono font-medium"><Star size={10} fill="currentColor" /> {comp.rating} ({comp.reviews})</span>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="h-full flex items-center justify-center text-[13px] font-medium text-neon-green border border-neon-green/20 bg-neon-green/10 p-6 rounded-xl text-center leading-relaxed">
              Incredible opportunity. <br/> Zero registered competitors found inside this radius!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
