import React, { useState } from 'react';
import {
  Map, Zap, Database, BrainCircuit, ScanSearch, ChevronRight,
  Globe2, ChevronDown, Target, TrendingUp, MessageSquare,
  Building2, BarChart3, ShieldCheck, Handshake, Bot, DollarSign,
  Layers, Radio, Warehouse, Car, Sun
} from 'lucide-react';

const CURRENT_FEATURES = [
  {
    icon: <BrainCircuit size={22} />,
    color: 'neon-blue',
    glow: 'rgba(0,240,255,0.5)',
    title: 'AI Site Scoring',
    desc: 'Ollama-powered engine scores every location on Demand, Accessibility, Infrastructure & Competition using real Places API data.',
  },
  {
    icon: <Map size={22} />,
    color: 'neon-green',
    glow: 'rgba(57,255,20,0.5)',
    title: 'Predictive Node Engine',
    desc: 'Generates up to 10 optimal candidate locations per region with geographic spacing constraints and automatic rank correction.',
  },
  {
    icon: <Target size={22} />,
    color: '[#ff007f]',
    glow: 'rgba(255,0,127,0.5)',
    title: '5-Sector Intelligence',
    desc: 'Sector-specific weights for EV Charging, Retail, Warehouses, Telecom Towers and Renewable Energy sites.',
  },
  {
    icon: <BarChart3 size={22} />,
    color: '[#b026ff]',
    glow: 'rgba(176,38,255,0.5)',
    title: 'Real Competitor Mapping',
    desc: 'Fetches actual competitors within a strict 5 km radius using typed Google Places searches — no estimates, only real data.',
  },
  {
    icon: <Globe2 size={22} />,
    color: '[#ff9500]',
    glow: 'rgba(255,149,0,0.5)',
    title: 'Reverse Geocoding',
    desc: 'Displays real locality names (Bopal, Satellite, Viman Nagar) instead of raw coordinates — every node is human-readable.',
  },
  {
    icon: <ShieldCheck size={22} />,
    color: 'neon-blue',
    glow: 'rgba(0,240,255,0.5)',
    title: 'Executive Verdict',
    desc: 'AI-generated pros, cons and a two-sentence investment verdict for every site — powered by large language models.',
  },
];

const ROADMAP = [
  {
    icon: '📈',
    color: 'neon-green',
    border: 'border-neon-green/20',
    hover: 'hover:border-neon-green/40',
    badge: 'text-neon-green bg-neon-green/10 border-neon-green/20',
    title: 'ROI & Payback Estimator',
    desc: 'Score-driven revenue projections, setup cost ranges, and payback period estimates for each sector — clearly labeled as approximations, never financial advice.',
    phase: 'Q3 2025',
  },
  {
    icon: '🤖',
    color: '[#b026ff]',
    border: 'border-[#b026ff]/20',
    hover: 'hover:border-[#b026ff]/40',
    badge: 'text-[#b026ff] bg-[#b026ff]/10 border-[#b026ff]/20',
    title: 'AI Location Chatbot',
    desc: 'Ask natural language questions like "Find me the best EV charging spot near a highway in South Ahmedabad with low competition" and get instant ranked results.',
    phase: 'Q4 2025',
  },
  {
    icon: '🏗️',
    color: '[#ff9500]',
    border: 'border-[#ff9500]/20',
    hover: 'hover:border-[#ff9500]/40',
    badge: 'text-[#ff9500] bg-[#ff9500]/10 border-[#ff9500]/20',
    title: 'Builder & Broker Network',
    desc: 'Partnering with real estate developers and commercial brokers to surface only actually available properties — so predictions map to real leasable or purchasable spaces.',
    phase: 'Q1 2026',
  },
  {
    icon: '💰',
    color: 'yellow-400',
    border: 'border-yellow-400/20',
    hover: 'hover:border-yellow-400/40',
    badge: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    title: 'Investment Cost Estimator',
    desc: 'Sector-specific setup cost ranges derived from location scores, infrastructure quality, and local rental market data — from EV charger installs to retail fit-outs.',
    phase: 'Q2 2026',
  },
  {
    icon: '📊',
    color: '[#ff007f]',
    border: 'border-[#ff007f]/20',
    hover: 'hover:border-[#ff007f]/40',
    badge: 'text-[#ff007f] bg-[#ff007f]/10 border-[#ff007f]/20',
    title: 'Portfolio Risk Dashboard',
    desc: 'Multi-location risk classification (Low / Medium / High) and sector diversification analysis for investors managing multiple sites simultaneously.',
    phase: 'Q2 2026',
  },
  {
    icon: '🗺️',
    color: 'neon-blue',
    border: 'border-neon-blue/20',
    hover: 'hover:border-neon-blue/40',
    badge: 'text-neon-blue bg-neon-blue/10 border-neon-blue/20',
    title: 'Pan-India Expansion',
    desc: 'Expanding the population grid and POI datasets to cover Tier-2 and Tier-3 cities with local census integration for hyperlocal demand modelling.',
    phase: 'Q3 2026',
  },
];

const SECTORS = [
  { icon: <Car size={18} />, label: 'EV Charging' },
  { icon: <Layers size={18} />, label: 'Retail Stores' },
  { icon: <Warehouse size={18} />, label: 'Warehouses' },
  { icon: <Radio size={18} />, label: 'Telecom Towers' },
  { icon: <Sun size={18} />, label: 'Renewable Energy' },
];

export default function WelcomeScreen({ onEnter }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleStart = () => {
    setIsLeaving(true);
    setTimeout(() => onEnter(), 800);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-dark-900 overflow-y-auto transition-all duration-700 ease-in-out ${
        isLeaving ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-neon-blue/8 rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute bottom-[15%] right-[10%] w-[600px] h-[600px] bg-[#b026ff]/8 rounded-full blur-[160px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] bg-[#ff007f]/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
      </div>

      {/* Floating decorative icons */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-[12%] left-[8%] animate-[float_6s_ease-in-out_infinite]"><Map size={52} className="text-slate-400" /></div>
        <div className="absolute top-[65%] left-[12%] animate-[float_8s_ease-in-out_infinite_1s]"><Database size={40} className="text-slate-500" /></div>
        <div className="absolute top-[18%] right-[10%] animate-[float_7s_ease-in-out_infinite_2s]"><BrainCircuit size={60} className="text-slate-400" /></div>
        <div className="absolute bottom-[20%] right-[15%] animate-[float_5s_ease-in-out_infinite_0.5s]"><Globe2 size={68} className="text-slate-500" /></div>
        <div className="absolute top-[40%] left-[5%] animate-[float_9s_ease-in-out_infinite_3s]"><Zap size={36} className="text-slate-500" /></div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 1 — Hero
      ═══════════════════════════════════════════ */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">

        {/* Logo & tagline */}
        <div className="flex flex-col items-center mb-10 relative">
          <div className="absolute inset-0 bg-neon-blue/15 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <ScanSearch size={52} className="text-neon-blue animate-pulse drop-shadow-[0_0_20px_rgba(0,240,255,0.8)]" />
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-white to-[#b026ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              GeoXalyze
            </h1>
          </div>
          <p className="mt-3 text-neon-blue/80 tracking-[0.35em] text-xs md:text-sm font-semibold uppercase">
            AI-Powered Geospatial Site Intelligence
          </p>
          <p className="mt-5 text-slate-400 text-sm md:text-base text-center max-w-xl leading-relaxed">
            Identify <strong className="text-white">hyper-profitable locations</strong> for your next business expansion across India — powered by real Google Places data and large language models.
          </p>
        </div>

        {/* Sector pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {SECTORS.map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
              <span className="text-neon-blue">{s.icon}</span>
              {s.label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button onClick={handleStart} className="relative group overflow-hidden rounded-full p-[2px] cursor-pointer mb-12">
          <span className="absolute inset-0 bg-gradient-to-r from-neon-blue via-[#ff007f] to-neon-blue opacity-60 group-hover:opacity-100 animate-[spin_3s_linear_infinite] rounded-full" />
          <div className="relative flex items-center gap-3 bg-dark-900 px-10 py-4 rounded-full transition-all duration-300 group-hover:bg-dark-800/50">
            <span className="text-white font-display font-bold tracking-widest uppercase text-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
              Launch Platform
            </span>
            <ChevronRight className="text-white group-hover:text-neon-blue group-hover:translate-x-1 transition-all" size={20} />
          </div>
        </button>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-1 text-slate-600 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest font-semibold">Explore Features</span>
          <ChevronDown size={16} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          SECTION 2 — Current Features
      ═══════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-20">

        {/* Section header */}
        <div className="flex items-center gap-4 mb-4 justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-blue/30 to-neon-blue/30" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-blue/25 bg-neon-blue/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-blue animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-blue/80">Live Features</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-blue/30 to-neon-blue/30" />
        </div>
        <p className="text-center text-[11px] text-slate-500 mb-8">Everything below is <span className="text-neon-blue font-semibold">live and available</span> in the current version.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {CURRENT_FEATURES.map((f, i) => (
            <div key={i} className={`relative rounded-2xl border border-white/8 bg-dark-800/50 p-5 hover:border-white/20 hover:bg-dark-800/80 transition-all duration-300 group`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `rgba(0,0,0,0.4)`, boxShadow: `0 0 16px ${f.glow}30`, border: `1px solid ${f.glow}30` }}
              >
                <span style={{ color: `var(--tw-color-${f.color}, #00f0ff)`, filter: `drop-shadow(0 0 6px ${f.glow})` }}>
                  {f.icon}
                </span>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
              <div className="absolute top-3 right-3 text-[8px] font-bold uppercase tracking-widest text-neon-green bg-neon-green/10 border border-neon-green/20 px-2 py-0.5 rounded-full">
                Live
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 3 — Future Roadmap
        ═══════════════════════════════════════════ */}
        <div className="flex items-center gap-4 mb-4 justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-yellow-400/30" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-yellow-400/25 bg-yellow-400/5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-400/80">Roadmap — Coming Soon</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-yellow-400/30 to-yellow-400/30" />
        </div>
        <p className="text-center text-[11px] text-slate-500 leading-relaxed mb-8 max-w-2xl mx-auto">
          The features below are <span className="text-yellow-400 font-semibold">planned for future versions</span>. Some require premium data APIs and real estate partnerships currently in progress.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {ROADMAP.map((r, i) => (
            <div key={i} className={`relative rounded-2xl border ${r.border} ${r.hover} bg-dark-800/40 p-5 transition-all duration-300`}>
              <div className={`absolute top-3 right-3 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${r.badge}`}>
                {r.phase}
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-xl">
                {r.icon}
              </div>
              <h4 className="text-white font-semibold text-sm mb-2">{r.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 4 — Builder/Broker Collaboration
        ═══════════════════════════════════════════ */}
        <div className="rounded-2xl border border-[#ff9500]/20 bg-gradient-to-br from-[#ff9500]/5 to-dark-800/40 p-8 mb-16">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#ff9500]/10 border border-[#ff9500]/20 flex items-center justify-center shrink-0">
              <Handshake size={24} className="text-[#ff9500]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-white font-bold text-base">Builder & Broker Collaboration Network</h3>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#ff9500] bg-[#ff9500]/10 border border-[#ff9500]/20 px-2 py-0.5 rounded-full">Vision</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Today, GeoXalyze predicts <em>statistically optimal zones</em> — but these may not correspond to actually available properties. Our next major milestone is forming a verified network of <strong className="text-white">real estate developers, commercial brokers, and property aggregators</strong> across India.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Building2 size={16} />, title: 'Verified Listings', desc: 'Only show properties that are currently leasable or purchasable — no ghost recommendations.' },
                  { icon: <DollarSign size={16} />, title: 'Live Pricing', desc: 'Real rent/purchase price data from broker partners, matched against our AI viability score.' },
                  { icon: <Bot size={16} />, title: 'Broker AI Assistant', desc: 'AI co-pilot for brokers to instantly generate site readiness reports for client pitches.' },
                ].map((item, i) => (
                  <div key={i} className="bg-dark-900/50 border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2 text-[#ff9500]">{item.icon}<span className="text-white font-semibold text-xs">{item.title}</span></div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-600 mt-4">
                Interested in partnering? The GeoXalyze team is actively reaching out to real estate networks, co-working operators, and commercial brokers across Tier-1 and Tier-2 Indian cities.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center gap-5">
          <p className="text-slate-500 text-xs text-center max-w-md">
            Start exploring the platform now. All core features are live and free to use.
          </p>
          <button onClick={handleStart} className="relative group overflow-hidden rounded-full p-[2px] cursor-pointer">
            <span className="absolute inset-0 bg-gradient-to-r from-neon-blue via-[#b026ff] to-neon-blue opacity-60 group-hover:opacity-100 animate-[spin_3s_linear_infinite] rounded-full" />
            <div className="relative flex items-center gap-3 bg-dark-900 px-8 py-3 rounded-full transition-all duration-300 group-hover:bg-dark-800/50">
              <span className="text-white font-display font-bold tracking-widest uppercase text-sm">Launch Platform</span>
              <ChevronRight className="text-neon-blue group-hover:translate-x-1 transition-all" size={18} />
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
