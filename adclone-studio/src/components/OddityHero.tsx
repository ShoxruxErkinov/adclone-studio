'use client';
import { useState } from 'react';
import {
  ArrowRight,
  AudioLines,
  Bolt,
  CheckCircle2,
  Clapperboard,
  Flame,
  Layers,
  Link2,
  Play,
  RotateCw,
  Sparkles,
  TrendingUp,
  Volume2,
  Wand2,
} from 'lucide-react';

interface OddityHeroProps {
  onSelectPreset: (url: string) => void;
  onOpenStudio: () => void;
  lensActive: boolean;
  onToggleLens: () => void;
}

export function OddityHero({
  onSelectPreset,
  onOpenStudio,
  lensActive,
  onToggleLens,
}: OddityHeroProps) {
  const [urlInput, setUrlInput] = useState(
    'https://uzum.uz/product/aura-sonic-cleanse-9902'
  );
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setSuccess(true);
      setTimeout(() => {
        onSelectPreset(urlInput);
        onOpenStudio();
      }, 700);
    }, 1100);
  };

  const handlePresetClick = (url: string) => {
    setUrlInput(url);
    onSelectPreset(url);
  };

  return (
    <div className="oddity-hero-root relative w-full overflow-hidden">
      {/* Ambient background glows */}
      <div className="ambient-glow cyan" />
      <div className="ambient-glow blue" />
      <div className="ambient-glow purple" />

      <div className="hero-content-wrapper relative z-10 w-full max-w-[1580px] mx-auto px-4 md:px-8 pt-4 pb-16 flex flex-col gap-8">
        {/* Top Status & Lens Toggle Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <div className="status-pill glass">
              <span className="dot-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider text-cyan-300">
                ODDITY ENGINE // RUNTIME ACTIVE
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 status-pill subtle">
              <span className="font-mono text-[11px] text-slate-400">
                NODE: TASHKENT-UZ-VIRAL-CLUSTER
              </span>
            </div>
          </div>

          {/* Interactive Lens Switch */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass-bar">
            <span className="font-mono text-[11px] text-slate-300">interactive lens</span>
            <button
              type="button"
              onClick={onToggleLens}
              className={`lens-toggle-btn ${lensActive ? 'active' : 'inactive'}`}
              aria-label="Toggle interactive liquid lens"
            >
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span className="font-bold font-mono text-[11px]">
                {lensActive ? '[on]' : '[off]'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Grid: Headline & URL Engine (Left) + Specimen Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Headline, Copy, URL Engine & Social Proof */}
          <div className="lg:col-span-5 flex flex-col gap-6 relative z-20">
            {/* Tagline */}
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="font-mono text-[11px] font-bold tracking-widest uppercase">
                SYNTHETIC COMMERCE ACCELERATOR
              </span>
            </div>

            {/* Master Headline */}
            <h1 className="hero-master-title">
              turn any product into{' '}
              <span className="liquid-gradient-text">
                viral video ads.
              </span>
            </h1>

            {/* Sub-copy */}
            <p className="hero-sub-text">
              Mahsulot havolasini joylang. Suyuq sun'iy intellekt dvigateli soniyalar
              ichida yuqori konversiyali ssenariy, tabiiy ovoz va Reels reklamalarni tayyorlaydi.
            </p>

            {/* Interactive URL Input Console */}
            <div className="url-console-box glass">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full flex items-center">
                  <Link2 className="absolute left-3.5 text-slate-400 text-lg pointer-events-none" size={19} />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://uzum.uz/product/... yoki amazon.com/dp/..."
                    className="url-field-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerate();
                    }}
                  />
                  <span className="auto-detect-chip">AUTO-DETECT</span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="generate-liquid-btn"
                >
                  {generating ? (
                    <>
                      <RotateCw className="spin" size={17} />
                      <span>Ajratilmoqda...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 size={17} />
                      <span>Tayyor!</span>
                    </>
                  ) : (
                    <>
                      <Bolt size={18} />
                      <span>20 Video Ad Yaratish</span>
                    </>
                  )}
                </button>
              </div>

              {/* Fast Test Chips */}
              <div className="flex flex-wrap items-center gap-2 px-1 pt-1.5">
                <span className="font-mono text-[10px] text-slate-400 uppercase">
                  Tezkor Sinov:
                </span>
                <button
                  type="button"
                  className="fast-test-chip"
                  onClick={() =>
                    handlePresetClick('https://uzum.uz/product/aura-sonic-cleanse-9902')
                  }
                >
                  Uzum Sonic Gadget ⚡
                </button>
                <button
                  type="button"
                  className="fast-test-chip"
                  onClick={() =>
                    handlePresetClick('https://amazon.com/dp/B08N5WRWNW-ceramide-serum')
                  }
                >
                  Amazon Skincare Serum
                </button>
                <button
                  type="button"
                  className="fast-test-chip"
                  onClick={() =>
                    handlePresetClick('https://shopify.com/products/glow-peptide-dew')
                  }
                >
                  Shopify Brand Reel
                </button>
              </div>
            </div>

            {/* Social Proof Metric Badges */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="metric-card glass">
                <span className="metric-val text-white">42M+</span>
                <span className="metric-lbl">Ad Impressions</span>
              </div>
              <div className="metric-card glass">
                <div className="flex items-center gap-1">
                  <span className="metric-val text-cyan-300">4.8x</span>
                  <TrendingUp size={15} className="text-cyan-300" />
                </div>
                <span className="metric-lbl">Avg ROAS Lift</span>
              </div>
              <div className="metric-card glass">
                <span className="metric-val text-purple-300">74%</span>
                <span className="metric-lbl">3s Hook Retention</span>
              </div>
            </div>

            {/* Quick Open Studio Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenStudio}
                className="open-studio-action-btn"
              >
                <span>To'g'ridan-to'g'ri Studiyo Muharririni Ochish</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Right Column: Specimen Cards Matrix (Oddity Drawer Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-20">
            {/* Specimen 01: Hook Audio Waveform */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 01</span>
                <span className="specimen-tag virality">98.2% VIRALITY</span>
              </div>
              <div className="specimen-inner-box">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300 mb-2">
                  <span>HOOK_MAGNET_V1.wav</span>
                  <Volume2 size={13} />
                </div>
                {/* Simulated Audio Waveform Bars */}
                <div className="flex items-center justify-between h-9 gap-1 py-1">
                  {[40, 75, 95, 60, 30, 85, 100, 65, 45, 90, 70, 50, 80, 60].map(
                    (height, idx) => (
                      <span
                        key={idx}
                        className="waveform-bar"
                        style={{
                          height: `${height}%`,
                          animationDelay: `${idx * 0.08}s`,
                        }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between font-mono text-[9px] text-slate-400 mt-2">
                  <span>SIDE A // 0:03 SEC</span>
                  <span>128 BPM</span>
                </div>
              </div>
              <h3 className="specimen-title">Magnetic Sensory Intro</h3>
              <p className="specimen-desc">
                Avtonom dopamin triggeri dastlabki 3 soniyada tomoshabinni to'xtatadi.
              </p>
            </div>

            {/* Specimen 02: Dynamic Offer Engine */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 02</span>
                <span className="specimen-tag cyan">INGESTED</span>
              </div>
              <div className="specimen-inner-box relative overflow-hidden flex flex-col justify-end p-3 min-h-[95px]">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-slate-900/60 to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-slate-400 text-[11px] font-mono">
                      $39.00
                    </span>
                    <span className="font-mono text-cyan-300 font-bold text-xs">
                      $19.99
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-200 text-[9px] font-mono font-bold">
                    50% OFF
                  </span>
                </div>
                <div className="relative z-10 flex items-center gap-1 font-mono text-[9px] text-slate-300 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <span>UZUM-88340-GLOW</span>
                </div>
              </div>
              <h3 className="specimen-title">Dynamic Offer Engine</h3>
              <p className="specimen-desc">
                Katalogdagi chegirmalar va zaxira holatini real vaqtda videoga integratsiya qiladi.
              </p>
            </div>

            {/* Specimen 03: Emotional Voice Cloning */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 03</span>
                <span className="specimen-tag purple">NEURAL SYNTH</span>
              </div>
              <div className="specimen-inner-box flex flex-col items-center justify-center p-3 min-h-[95px]">
                <AudioLines size={32} className="text-cyan-300 animate-pulse" />
                <div className="flex justify-between w-full font-mono text-[9px] text-slate-400 mt-2">
                  <span>ElevenLabs</span>
                  <span>48kHz / 24-bit</span>
                </div>
              </div>
              <h3 className="specimen-title">Emotional Voice Cloning</h3>
              <p className="specimen-desc">
                O'zbek, rus va ingliz tillarida jonli inson intonatsiyasidagi diktor ovozi.
              </p>
            </div>

            {/* Specimen 04: 9:16 Kinetic Reels Engine */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 04</span>
                <span className="specimen-tag virality">91% RETENTION</span>
              </div>
              <div className="specimen-inner-box relative p-3 min-h-[95px] flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Play size={10} fill="currentColor" /> 3.8M
                  </span>
                  <span className="text-[9px] text-slate-400">9:16 REEL</span>
                </div>
                <p className="font-mono text-[10px] text-white font-semibold leading-snug">
                  "Stop scrolling if you have skin in 2025 👀"
                </p>
              </div>
              <h3 className="specimen-title">9:16 Kinetic Reels Engine</h3>
              <p className="specimen-desc">
                TikTok, Instagram Reels va YouTube Shorts uchun maxsus ritmik montaj.
              </p>
            </div>

            {/* Specimen 05: Algorithmic Dopamine Pack */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 05</span>
                <span className="specimen-tag cyan">+45% CTR</span>
              </div>
              <div className="specimen-inner-box p-2.5 flex flex-col justify-center min-h-[95px] gap-1.5">
                <div className="flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 font-mono text-[9px] font-bold">
                    CTR 6.8%
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 font-mono text-[9px] font-bold">
                    CPA $1.10
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 font-mono text-[9px] font-bold">
                    ROAS 5.2x
                  </span>
                </div>
                <div className="font-mono text-[9px] text-slate-400">
                  DOPAMINE INFUSION 200mg
                </div>
              </div>
              <h3 className="specimen-title">Algorithmic Dopamine Pack</h3>
              <p className="specimen-desc">
                Xarid qilish qarorini tezlashtiruvchi vizual elementlar va aksiyalar.
              </p>
            </div>

            {/* Specimen 06: Direct-Response DNA */}
            <div className="specimen-card glass">
              <div className="specimen-header">
                <span className="specimen-id">SPECIMEN // 06</span>
                <span className="specimen-tag slate">CANONICAL</span>
              </div>
              <div className="specimen-inner-box p-3 min-h-[95px] flex flex-col justify-between">
                <span className="font-mono text-[9px] text-cyan-300">
                  PINNED PROTOCOL ⚡
                </span>
                <div className="font-bold text-white text-xs leading-tight">
                  "Make ads that sell."
                </div>
                <span className="font-mono text-[9px] text-slate-400">
                  Zero fluff, 100% conversion
                </span>
              </div>
              <h3 className="specimen-title">Direct-Response DNA</h3>
              <p className="specimen-desc">
                Faqat ko'rish uchun emas, balki to'g'ridan-to'g'ri buyurtma keltirish uchun yaratilgan.
              </p>
            </div>
          </div>
        </div>

        {/* Live Banner: Oddity Engine Performance */}
        <div className="w-full rounded-2xl p-5 md:p-6 glass-banner flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-400/20 border border-cyan-300/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Layers size={24} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-white">
                AdClone Liquid Generation Engine v4.8
              </h2>
              <p className="text-xs text-slate-400">
                Mahalliy va xalqaro marketplacelar uchun avtomatlashtirilgan video reklama konveyeri.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="font-mono text-xs text-cyan-300">
              ⚡ 1,490+ sotuvchi va brendlar foydalanmoqda
            </span>
            <button
              type="button"
              onClick={onOpenStudio}
              className="primary-cta-button"
            >
              <span>Studiyoga Kirish</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
