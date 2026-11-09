'use client';
import { useState } from 'react';
import {
  ArrowRight,
  ArrowsClockwise,
  CheckCircle,
  Lightning,
  LinkSimple,
  Play,
  SpeakerHigh,
  Sparkle,
  Stack,
  TrendUp,
  Waveform,
} from '@phosphor-icons/react';

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
    }, 1000);
  };

  const handlePresetClick = (url: string) => {
    setUrlInput(url);
    onSelectPreset(url);
  };

  return (
    <section className="oddity-hero-root">
      {/* Background ambient lighting */}
      <div className="ambient-glow cyan" />
      <div className="ambient-glow blue" />
      <div className="ambient-glow purple" />

      <div className="oddity-hero-container">
        {/* Top Status & Lens Toggle Pill */}
        <div className="oddity-top-status-row">
          <div className="oddity-status-left">
            <div className="status-pill glass">
              <span className="dot-pulse" />
              <span className="status-pill-text-cyan">
                ODDITY ENGINE // RUNTIME ACTIVE
              </span>
            </div>
            <div className="status-pill subtle desktop-only">
              <span className="status-pill-text-muted">
                NODE: TASHKENT-UZ-VIRAL-CLUSTER
              </span>
            </div>
          </div>

          {/* Interactive Lens Switch */}
          <div className="oddity-lens-switch-box">
            <span className="lens-label-text">interactive lens</span>
            <button
              type="button"
              onClick={onToggleLens}
              className={`lens-toggle-pill ${lensActive ? 'on' : 'off'}`}
              aria-label="Toggle interactive liquid lens"
            >
              <span className="lens-dot" />
              <span className="lens-status-code">{lensActive ? '[on]' : '[off]'}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Split: Headline & URL Console (Left) + Specimen Cards (Right) */}
        <div className="oddity-main-grid">
          {/* Left Column */}
          <div className="oddity-left-column">
            {/* Tagline */}
            <div className="oddity-tagline">
              <Sparkle size={16} weight="duotone" />
              <span>SYNTHETIC COMMERCE ACCELERATOR</span>
            </div>

            {/* Master Headline */}
            <h1 className="hero-master-title">
              turn any product into{' '}
              <span className="liquid-gradient-text">viral video ads.</span>
            </h1>

            {/* Sub-copy */}
            <p className="hero-sub-text">
              Mahsulot havolasini joylang. Suyuq sun'iy intellekt dvigateli soniyalar
              ichida yuqori konversiyali ssenariy, tabiiy ovoz va Reels reklamalarni tayyorlaydi.
            </p>

            {/* Interactive URL Console Box */}
            <div className="url-console-box glass">
              <div className="url-console-top-row">
                <div className="oddity-url-input-wrap">
                  <LinkSimple size={18} weight="bold" className="url-input-icon" />
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
                      <ArrowsClockwise className="spin" size={16} weight="bold" />
                      <span>Ajratilmoqda...</span>
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle size={16} weight="fill" />
                      <span>Tayyor!</span>
                    </>
                  ) : (
                    <>
                      <Lightning size={17} weight="fill" />
                      <span>20 Video Ad Yaratish</span>
                    </>
                  )}
                </button>
              </div>

              {/* Fast Test Chips */}
              <div className="oddity-fast-chips-row">
                <span className="fast-chip-label">Tezkor Sinov:</span>
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
            <div className="oddity-metrics-row">
              <div className="metric-card glass">
                <span className="metric-val text-white">42M+</span>
                <span className="metric-lbl">Ad Impressions</span>
              </div>
              <div className="metric-card glass">
                <div className="metric-val-flex">
                  <span className="metric-val text-cyan">4.8x</span>
                  <TrendUp size={16} weight="bold" className="text-cyan" />
                </div>
                <span className="metric-lbl">Avg ROAS Lift</span>
              </div>
              <div className="metric-card glass">
                <span className="metric-val text-purple">74%</span>
                <span className="metric-lbl">3s Hook Retention</span>
              </div>
            </div>

            {/* Quick Open Studio Button */}
            <div className="oddity-open-studio-wrap">
              <button
                type="button"
                onClick={onOpenStudio}
                className="open-studio-action-btn"
              >
                <span>To'g'ridan-to'g'ri Studiyo Muharririni Ochish</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Right Column: Specimen Cards Matrix (Oddity Drawer Grid) */}
          <div className="oddity-right-column">
            <div className="oddity-specimen-grid">
              {/* Specimen 01: Hook Audio Waveform */}
              <div className="specimen-card glass">
                <div className="specimen-header">
                  <span className="specimen-id">SPECIMEN // 01</span>
                  <span className="specimen-tag virality">98.2% VIRALITY</span>
                </div>
                <div className="specimen-inner-box">
                  <div className="specimen-audio-title">
                    <span>HOOK_MAGNET_V1.wav</span>
                    <SpeakerHigh size={14} weight="duotone" />
                  </div>
                  {/* Simulated Audio Waveform Bars */}
                  <div className="waveform-track">
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
                  <div className="specimen-audio-meta">
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
                <div className="specimen-inner-box offer-box">
                  <div className="offer-price-row">
                    <span className="old-price">$39.00</span>
                    <span className="new-price">$19.99</span>
                    <span className="discount-pill">50% OFF</span>
                  </div>
                  <div className="sku-tag">
                    <span className="sku-dot" />
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
                <div className="specimen-inner-box voice-box">
                  <Waveform size={32} weight="duotone" className="voice-icon" />
                  <div className="voice-meta">
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
                <div className="specimen-inner-box reel-box">
                  <div className="reel-stat-row">
                    <span className="reel-views">
                      <Play size={10} weight="fill" /> 3.8M
                    </span>
                    <span className="reel-format">9:16 REEL</span>
                  </div>
                  <p className="reel-quote">
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
                <div className="specimen-inner-box dopamine-box">
                  <div className="dopamine-chips">
                    <span className="dopamine-chip purple">CTR 6.8%</span>
                    <span className="dopamine-chip blue">CPA $1.10</span>
                    <span className="dopamine-chip cyan">ROAS 5.2x</span>
                  </div>
                  <div className="dopamine-sub">DOPAMINE INFUSION 200mg</div>
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
                <div className="specimen-inner-box protocol-box">
                  <span className="protocol-sub">PINNED PROTOCOL ⚡</span>
                  <div className="protocol-title">"Make ads that sell."</div>
                  <span className="protocol-note">Zero fluff, 100% conversion</span>
                </div>
                <h3 className="specimen-title">Direct-Response DNA</h3>
                <p className="specimen-desc">
                  Faqat ko'rish uchun emas, balki to'g'ridan-to'g'ri buyurtma keltirish uchun yaratilgan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Banner: Oddity Engine Performance */}
        <div className="oddity-bottom-banner glass">
          <div className="banner-left">
            <div className="banner-icon-box">
              <Stack size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="banner-title">AdClone Liquid Generation Engine v4.8</h2>
              <p className="banner-subtitle">
                Mahalliy va xalqaro marketplacelar uchun avtomatlashtirilgan video reklama konveyeri.
              </p>
            </div>
          </div>

          <div className="banner-right">
            <span className="banner-stats">
              ⚡ 1,490+ sotuvchi va brendlar foydalanmoqda
            </span>
            <button
              type="button"
              onClick={onOpenStudio}
              className="primary-cta-button"
            >
              <span>Studiyoga Kirish</span>
              <ArrowRight size={15} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
