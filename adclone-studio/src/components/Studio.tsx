'use client';
import { isValidElement, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import {
  Sparkle,
  FilmSlate,
  FolderSimpleStar,
  DownloadSimple,
  Plus,
  GearSix,
  UserCircle,
  List,
  X,
  CaretRight,
  ArrowRight,
  ArrowUpRight,
  LinkSimple,
  CircleNotch,
  ImageSquare,
  Article,
  Palette,
  Waveform,
  MagicWand,
  FloppyDisk,
  Check,
  Checks,
  Scissors,
  GlobeHemisphereWest,
  SpeakerHigh,
  ShieldCheck,
  Trash,
  SignOut,
  Lightning,
} from '@phosphor-icons/react';
import { AdComposition } from '@/video/AdComposition';
import { api, authHeaders, browserAuth } from '@/lib/browser';
import {
  createDraft,
  presetProducts,
  languages,
  roleLabels,
  sceneBoundaries,
  videoDuration,
  type AppState,
  type Language,
  type Project,
  type ProjectInput,
} from '@/lib/model';
import { OddityHero } from '@/components/OddityHero';
import { VisionGlassCursor } from '@/components/VisionGlassCursor';

type View = 'hero' | 'studio' | 'projects' | 'exports' | 'settings' | 'account';
type Tab = 'product' | 'script' | 'style' | 'voice';

const initial: AppState = {
  projects: [],
  renders: [],
  credits: 0,
  user: null,
  authConfigured: false,
  assetUrls: {},
  services: { gemini: false, voice: false, scraper: false, background: false, worker: false },
};

function IconButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'on' : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const control =
    isValidElement(children) &&
    typeof children.type === 'string' &&
    ['input', 'select', 'textarea'].includes(children.type);
  return control ? (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  ) : (
    <div className="field">
      <span>{label}</span>
      {children}
    </div>
  );
}

function Confirmation({ message, onResolve }: { message: string; onResolve: (value: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onResolve(false);
      }}
      aria-labelledby="confirmation-title"
    >
      <h2 id="confirmation-title">O‘zgarishni tasdiqlang</h2>
      <p>{message}</p>
      <div className="split-actions">
        <button autoFocus className="secondary" onClick={() => onResolve(false)}>
          Bekor qilish
        </button>
        <button className="primary" onClick={() => onResolve(true)}>
          Davom etish
        </button>
      </div>
    </dialog>
  );
}

const seconds = (n: number) => `0:${Math.floor(n).toString().padStart(2, '0')}`;

export function Studio() {
  const [view, setView] = useState<View>('studio');
  const [tab, setTab] = useState<Tab>('script');
  const [lensActive, setLensActive] = useState(true);
  const [draft, setDraft] = useState<ProjectInput>(() => createDraft());
  const [projectId, setProjectId] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<AppState>(initial);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [imageSrc, setImageSrc] = useState('/demo-product.jpg');
  const [voiceSrc, setVoiceSrc] = useState<string>();
  const [activeScene, setActiveScene] = useState(0);
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [accountMode, setAccountMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState<{ message: string; resolve: (value: boolean) => void } | null>(null);

  const askConfirm = (message: string) => new Promise<boolean>((resolve) => setConfirmation({ message, resolve }));
  const player = useRef<PlayerRef>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const variant = useRef(0);
  const revision = useRef(0);
  const menuPanel = useRef<HTMLElement>(null);
  const menuToggle = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/studio', { headers: await authHeaders(), cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setState(data);
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : 'Server bilan aloqa yo‘q.', error: true });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 6000);
    const auth = browserAuth();
    const sub = auth?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAccountMode('reset');
        setView('account');
      }
      setTimeout(() => void refresh(), 0);
    });
    return () => {
      clearInterval(timer);
      sub?.data.subscription.unsubscribe();
    };
  }, [refresh]);

  useEffect(() => {
    if (!notice || notice.error) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const asset = (url: string) => state.assetUrls[url] || url;
    setImageSrc(asset(draft.product.image));
    setVoiceSrc(draft.voice ? asset(draft.voice.url) : undefined);
  }, [draft.product.image, draft.voice, state.assetUrls]);

  const update = (patch: Partial<ProjectInput>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      setNotice({ text: e instanceof Error ? e.message : 'Xatolik yuz berdi.', error: true });
    } finally {
      setBusy('');
    }
  };

  const navigate = (next: View) => {
    setMobileNav(false);
    setView(next);
  };

  const reset = async () => {
    if (dirty && !(await askConfirm('Yangi loyiha ochilsinmi? Saqlanmagan tahrirlar yo‘qoladi.'))) return;
    revision.current++;
    setDraft(createDraft());
    setProjectId(undefined);
    setDirty(false);
    setTab('script');
    navigate('studio');
  };

  const open = async (p: Project) => {
    if (dirty && !(await askConfirm('Loyiha ochilsinmi? Joriy saqlanmagan tahrirlar yo‘qoladi.'))) return;
    revision.current++;
    const { id, createdAt, updatedAt, ...rest } = p;
    setDraft(rest);
    setProjectId(id);
    setDirty(false);
    setTab('script');
    navigate('studio');
  };

  const handleSelectPreset = (presetUrl: string) => {
    const matched = presetProducts[presetUrl];
    if (matched) {
      revision.current++;
      setDraft(createDraft(matched, draft.language, draft.duration));
      setProjectId(undefined);
      setDirty(true);
      setTab('product');
      setNotice({
        text: `"${matched.title}" yuklandi. Ssenariy va ovozni tekshirishingiz mumkin.`,
        error: false,
      });
    } else {
      setUrl(presetUrl);
      void importLink();
    }
  };

  const importLink = () =>
    run('import', async () => {
      if (!url.trim()) throw new Error('Mahsulot havolasini kiriting.');
      if (dirty && !(await askConfirm('Saqlanmagan tahrirlar yangi mahsulot bilan almashtirilsinmi?'))) return;
      const started = revision.current;
      const result = await api<{ product: ProjectInput['product'] }>({
        action: 'import',
        url: url.trim(),
      });
      if (started !== revision.current)
        throw new Error('Import paytida loyihani o‘zgartirdingiz. Tahrirlaringiz saqlandi; kerak bo‘lsa importni qayta boshlang.');
      const next = createDraft(result.product, draft.language, draft.duration);
      revision.current++;
      setDraft(next);
      setProjectId(undefined);
      setDirty(true);
      setTab('product');
      setNotice({ text: 'Mahsulot yuklandi. Narx va tavsifni tekshiring, keyin ssenariy yarating.', error: false });
    });

  const changeLanguage = (language: Language) =>
    run('script', async () => {
      const started = revision.current;
      const result = await api<{ scenes: ProjectInput['scenes']; source: ProjectInput['scriptSource'] }>({
        action: 'script',
        product: draft.product,
        language,
        duration: draft.duration,
      });
      if (started !== revision.current)
        throw new Error('Ssenariy yaratilayotganda tahrir kiritildi. Tahrir saqlandi; tilni qayta tanlang.');
      update({ language, scenes: result.scenes, scriptSource: result.source, voice: null });
    });

  const regenerate = () =>
    run('script', async () => {
      const started = revision.current;
      const result = await api<{ scenes: ProjectInput['scenes']; source: ProjectInput['scriptSource'] }>({
        action: 'script',
        product: draft.product,
        language: draft.language,
        duration: draft.duration,
        variant: ++variant.current,
      });
      if (started !== revision.current)
        throw new Error('Yangi tahrirlaringiz saqlandi. Ssenariyni qayta yaratishni yana bosing.');
      update({ scenes: result.scenes, scriptSource: result.source, voice: null });
      setTab('script');
      setNotice({
        text: result.source === 'gemini' ? 'AI ssenariy tayyor.' : 'Shablon ssenariy tayyor. Gemini ulanganda AI matn yozadi.',
        error: false,
      });
    });

  const save = () =>
    run('save', async () => {
      const started = revision.current;
      const result = await api<{ project: Project }>({
        action: 'save',
        project: draft,
        id: projectId,
      });
      if (started === revision.current) {
        setProjectId(result.project.id);
        setDirty(false);
      }
      await refresh();
      setNotice({
        text: started === revision.current ? 'Loyiha saqlandi.' : 'Avvalgi holat saqlandi. Keyingi tahrirlaringizni ham saqlang.',
        error: false,
      });
    });

  const exportVideo = () =>
    run('export', async () => {
      const started = revision.current;
      const result = await api<{ project: Project }>({
        action: 'export',
        project: draft,
        id: projectId,
      });
      if (started === revision.current) {
        setProjectId(result.project.id);
        setDirty(false);
        navigate('exports');
      }
      await refresh();
      setNotice({
        text: 'Video render navbatiga qo‘shildi. Tayyor bo‘lgach Eksportlar bo‘limidan yuklab olasiz.',
        error: false,
      });
    });

  const upload = (file: File) =>
    run('upload', async () => {
      if (file.size > 3500000) throw new Error('Rasm hajmi 3.5 MB dan oshmasin.');
      const form = new FormData();
      form.set('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: await authHeaders(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      update({ product: { ...draft.product, image: data.image, demo: false }, voice: null });
    });

  const authenticate = () =>
    run('auth', async () => {
      const auth = browserAuth();
      if (!auth) throw new Error('Hisoblar uchun Supabase sozlamalarini kiriting. Mahalliy sinov hozir ishlaydi.');
      if (accountMode === 'reset') {
        const { error } = await auth.auth.updateUser({ password });
        if (error) throw error;
        setNotice({ text: 'Parol yangilandi.', error: false });
        setView('studio');
        return;
      }
      const result =
        accountMode === 'login'
          ? await auth.auth.signInWithPassword({ email, password })
          : await auth.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (result.error) throw result.error;
      if (accountMode === 'signup' && !result.data.session)
        setNotice({ text: 'Tasdiqlash havolasi emailingizga yuborildi. Emailni tasdiqlab, hisobga kiring.', error: false });
      else {
        await refresh();
        setView('studio');
      }
      setPassword('');
    });

  const duration = videoDuration(draft);
  const boundaries = sceneBoundaries(draft);
  const rendering = state.renders.filter((r) => ['queued', 'rendering'].includes(r.status)).length;

  const navItems: [View, React.ComponentType<{ size?: number; weight?: 'duotone' | 'fill' | 'bold' | 'regular' }>, string][] = [
    ['hero', Sparkle, 'Oddity Kirish'],
    ['studio', FilmSlate, 'Video studiyo'],
    ['projects', FolderSimpleStar, 'Loyihalarim'],
    ['exports', DownloadSimple, 'Eksportlar'],
  ];

  return (
    <div className="app-shell iso-grid-bg">
      <VisionGlassCursor />
      {confirmation && (
        <Confirmation
          message={confirmation.message}
          onResolve={(value) => {
            confirmation.resolve(value);
            setConfirmation(null);
          }}
        />
      )}
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Menyuni yopish"
          tabIndex={-1}
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside id="workspace-navigation" ref={menuPanel} className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <button className="nav-close icon-button" aria-label="Navigatsiyani yopish" onClick={() => setMobileNav(false)}>
          <X size={19} weight="bold" />
        </button>
        <a
          className="brand"
          href="/"
          aria-label="AdClone Studio bosh sahifa"
          onClick={(e) => {
            e.preventDefault();
            navigate('hero');
          }}
        >
          <span className="brand-mark">
            <img
              src="/brand/logo-mark-clean.png"
              alt="AdClone"
              style={{ width: 38, height: 38, objectFit: 'contain', filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.5))' }}
            />
          </span>
          <span className="brand-title">
            adclone<span className="brand-sub">STUDIO</span>
          </span>
        </a>
        <button className="new-project" onClick={() => reset()}>
          <Plus size={18} weight="bold" /> Yangi loyiha
        </button>
        <div className="nav-section">ISH MAYDONI</div>
        <nav aria-label="Asosiy navigatsiya">
          {navItems.map(([key, Icon, label]) => (
            <button
              key={key}
              className={`nav-item ${view === key ? 'active' : ''}`}
              onClick={() => navigate(key)}
            >
              <span className="nav-icon-badge">
                <Icon size={17} weight={view === key ? 'fill' : 'duotone'} />
              </span>
              <span>{label}</span>
              {key === 'projects' && state.projects.length > 0 && <b>{state.projects.length}</b>}
              {key === 'exports' && rendering > 0 && <b>{rendering}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="credit-box">
            <span className="credit-icon">
              <Lightning size={18} weight="fill" />
            </span>
            <div>
              <strong>{state.credits} ta test krediti</strong>
              <small>1 eksport = 1 kredit</small>
            </div>
            <span className="beta">BETA</span>
          </div>
          <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>
            <span className="nav-icon-badge">
              <GearSix size={17} weight={view === 'settings' ? 'fill' : 'duotone'} />
            </span>
            <span>Sozlamalar</span>
          </button>
          <button className="profile" onClick={() => navigate('account')}>
            <span className="profile-avatar">
              {state.user && state.user.id !== 'local-demo' ? state.user.email[0].toUpperCase() : 'S'}
            </span>
            <span>
              <strong>{state.authConfigured ? (state.user ? 'Mening hisobim' : 'Hisobga kirish') : 'Sinov ish maydoni'}</strong>
              <small>{state.authConfigured ? 'AdClone hisobingiz' : 'Kalitsiz demo rejimi'}</small>
            </span>
            <CaretRight size={16} weight="bold" />
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              ref={menuToggle}
              className="mobile-menu icon-button"
              aria-label="Menyuni ochish"
              aria-expanded={mobileNav}
              aria-controls="workspace-navigation"
              onClick={() => setMobileNav(!mobileNav)}
            >
              <List size={20} weight="bold" />
            </button>
            <span>Ish maydoni</span>
            <CaretRight size={14} weight="bold" />
            <strong>
              {
                {
                  hero: 'Oddity Kirish',
                  studio: 'Video studiyo',
                  projects: 'Loyihalarim',
                  exports: 'Eksportlar',
                  settings: 'Sozlamalar',
                  account: 'Hisob',
                }[view]
              }
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="workspace-status">
              <i />
              {state.authConfigured ? 'SaaS beta' : 'Mahalliy demo'}
            </span>
            <button className="help-link" onClick={() => navigate('settings')}>
              Qo‘llanma <ArrowUpRight size={14} weight="bold" />
            </button>
          </div>
        </header>

        <main>
          {notice && (
            <div className={`notice ${notice.error ? 'error' : 'success'}`} role={notice.error ? 'alert' : 'status'}>
              <span>{notice.text}</span>
              <button aria-label="Xabarni yopish" onClick={() => setNotice(null)}>
                <X size={16} weight="bold" />
              </button>
            </div>
          )}

          {view === 'hero' && (
            <OddityHero
              lensActive={lensActive}
              onToggleLens={() => setLensActive(!lensActive)}
              onOpenStudio={() => navigate('studio')}
              onSelectPreset={handleSelectPreset}
            />
          )}

          {view === 'studio' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Mahsulotingiz. Yangi hikoya.</h1>
                  <p>Bir havoladan keyingi reklamangizgacha — hammasi shu yerda.</p>
                </div>
                <span className="format-label">
                  <FilmSlate size={16} weight="duotone" /> Reels · TikTok · Shorts
                </span>
              </div>

              <section className="import-bar" aria-label="Mahsulot importi">
                <div className="import-input">
                  <LinkSimple size={20} weight="bold" />
                  <input
                    aria-label="Mahsulot havolasi"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !busy) void importLink();
                    }}
                    placeholder="Mahsulot havolasini shu yerga joylang…"
                    type="url"
                  />
                  <button className="primary" disabled={!!busy} onClick={() => void importLink()}>
                    {busy === 'import' ? (
                      <CircleNotch className="spin" size={17} weight="bold" />
                    ) : (
                      <Sparkle size={17} weight="duotone" />
                    )}
                    Mahsulotni olish <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
                <div className="import-caption">
                  <span>Uzum <i /> Wildberries <i /> Amazon <i /> Shopify</span>
                  <button
                    onClick={() => {
                      setTab('product');
                      document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    yoki qo‘lda kiriting <ArrowUpRight size={13} weight="bold" />
                  </button>
                </div>
              </section>

              <div className="studio-grid">
                <section className="editor-panel" id="editor">
                  <div className="editor-heading">
                    <div>
                      <h2>Reklamangizni yarating</h2>
                      <span>
                        {projectId ? 'Saqlangan loyiha' : 'Yangi loyiha'}
                        {dirty ? ' · o‘zgarishlar saqlanmagan' : ''}
                      </span>
                    </div>
                    <IconButton label="Loyihani saqlash" onClick={() => void save()} disabled={!!busy}>
                      <FloppyDisk size={18} weight="duotone" />
                    </IconButton>
                  </div>

                  <div className="editor-tabs" role="tablist" aria-label="Video sozlamalari">
                    {(
                      [
                        ['product', ImageSquare, 'Mahsulot'],
                        ['script', Article, 'Ssenariy'],
                        ['style', Palette, 'Ko‘rinish'],
                        ['voice', Waveform, 'Ovoz'],
                      ] as const
                    ).map(([key, Icon, label]) => (
                      <button
                        id={`tab-${key}`}
                        key={key}
                        role="tab"
                        aria-selected={tab === key}
                        aria-controls={`panel-${key}`}
                        className={tab === key ? 'selected' : ''}
                        onClick={() => setTab(key)}
                      >
                        <span className="tab-icon-badge">
                          <Icon size={16} weight={tab === key ? 'fill' : 'duotone'} />
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="tab-content" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                    {tab === 'script' && (
                      <>
                        <div className="options-row">
                          <Field label="Video tili">
                            <span className="select-wrap">
                              <GlobeHemisphereWest size={16} weight="duotone" />
                              <select
                                aria-label="Video tili"
                                disabled={!!busy}
                                value={draft.language}
                                onChange={(e) => void changeLanguage(e.target.value as Language)}
                              >
                                {Object.entries(languages).map(([code, name]) => (
                                  <option key={code} value={code}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </span>
                          </Field>
                          <Field label="Davomiylik">
                            <div className="segmented" role="group" aria-label="Davomiylik">
                              {[15, 30].map((n) => (
                                <button
                                  key={n}
                                  className={draft.duration === n ? 'selected' : ''}
                                  onClick={() => update({ duration: n as 15 | 30, voice: null })}
                                >
                                  {n} soniya
                                </button>
                              ))}
                            </div>
                          </Field>
                        </div>
                        <div className="script-toolbar">
                          <span>
                            <i className="status-dot" />
                            {draft.scriptSource === 'gemini'
                              ? 'AI ssenariy'
                              : draft.scriptSource === 'edited'
                              ? 'Tahrirlangan ssenariy'
                              : 'Shablon ssenariy'}
                          </span>
                          <button disabled={!!busy} className="text-button" onClick={() => void regenerate()}>
                            {busy === 'script' ? (
                              <CircleNotch size={14} className="spin" weight="bold" />
                            ) : (
                              <MagicWand size={15} weight="duotone" />
                            )}
                            Qayta yaratish
                          </button>
                        </div>
                        <div className="scenes">
                          {draft.scenes.map((scene, i) => (
                            <div className={`scene-row ${activeScene === i ? 'current' : ''}`} key={scene.role}>
                              <button
                                className={`scene-number scene-${i}`}
                                aria-label={`${i + 1}-sahnani ko‘rish`}
                                onClick={() => player.current?.seekTo(Math.round(boundaries[i] * 30))}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </button>
                              <div className="scene-content">
                                <div className="scene-label">
                                  <label htmlFor={`scene-${i}`}>{roleLabels[scene.role]}</label>
                                  <span>
                                    {seconds(boundaries[i])} – {seconds(boundaries[i + 1])}
                                  </span>
                                </div>
                                <textarea
                                  id={`scene-${i}`}
                                  maxLength={300}
                                  rows={i === 2 ? 3 : 2}
                                  value={scene.text}
                                  onChange={(e) =>
                                    update({
                                      scenes: draft.scenes.map((s, j) => (j === i ? { ...s, text: e.target.value } : s)),
                                      scriptSource: 'edited',
                                      voice: null,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="editor-tip">
                          <Sparkle size={15} weight="duotone" />
                          <span>Matnni o‘zgartiring — prevyuda darhol ko‘rinadi.</span>
                        </div>
                      </>
                    )}

                    {tab === 'product' && (
                      <div className="product-form">
                        <div className="product-image-row">
                          <img src={imageSrc} alt={draft.product.title} />
                          <div>
                            <strong>Mahsulot rasmi</strong>
                            <p>JPG, PNG yoki WebP · 3.5 MB gacha</p>
                            <button className="secondary small" disabled={!!busy} onClick={() => fileInput.current?.click()}>
                              <ImageSquare size={16} weight="duotone" /> Rasm yuklash
                            </button>
                            <input
                              ref={fileInput}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              hidden
                              onChange={(e) => {
                                if (e.target.files?.[0]) void upload(e.target.files[0]);
                                e.target.value = '';
                              }}
                            />
                          </div>
                        </div>
                        <Field label="Mahsulot nomi">
                          <input
                            value={draft.product.title}
                            maxLength={120}
                            onChange={(e) =>
                              update({
                                product: { ...draft.product, title: e.target.value, demo: false },
                                name: e.target.value,
                                voice: null,
                              })
                            }
                          />
                        </Field>
                        <Field label="Narx (ixtiyoriy)">
                          <input
                            value={draft.product.price}
                            maxLength={60}
                            placeholder="Masalan: 349 000 so‘m"
                            onChange={(e) =>
                              update({
                                product: { ...draft.product, price: e.target.value, demo: false },
                              })
                            }
                          />
                        </Field>
                        <Field label="Mahsulot haqida">
                          <textarea
                            rows={4}
                            value={draft.product.description}
                            maxLength={2000}
                            onChange={(e) =>
                              update({
                                product: { ...draft.product, description: e.target.value, demo: false },
                                voice: null,
                              })
                            }
                          />
                        </Field>
                        <Field label="Afzalliklar (har birini yangi qatordan yozing)">
                          <textarea
                            rows={3}
                            value={draft.product.features.join('\n')}
                            onChange={(e) =>
                              update({
                                product: {
                                  ...draft.product,
                                  features: e.target.value.split('\n').slice(0, 8).map((s) => s.slice(0, 200)),
                                  demo: false,
                                },
                                voice: null,
                              })
                            }
                          />
                        </Field>
                        <div className="split-actions">
                          <button
                            className="secondary"
                            disabled={!!busy || !state.services.background}
                            onClick={() =>
                              void run('background', async () => {
                                const result = await api<{ image: string }>({
                                  action: 'background',
                                  image: draft.product.image,
                                });
                                update({ product: { ...draft.product, image: result.image } });
                              })
                            }
                          >
                            <Scissors size={16} weight="duotone" /> Fonni olib tashlash
                          </button>
                          <button className="primary" disabled={!!busy} onClick={() => void regenerate()}>
                            <MagicWand size={16} weight="duotone" /> Ssenariy yaratish
                          </button>
                        </div>
                        {!state.services.background && (
                          <p className="muted-note">Fonni olib tashlash uchun remove.bg xizmatini Sozlamalarda ulang.</p>
                        )}
                      </div>
                    )}

                    {tab === 'style' && (
                      <div className="style-form">
                        <h3>Videoning kayfiyatini tanlang</h3>
                        <p className="muted-note">Har bir uslub mahsulotingizga va matningizga moslashadi.</p>
                        <div className="theme-options">
                          {(
                            [
                              ['lilac', 'Lavanda'],
                              ['mint', 'Tabiiy'],
                              ['dark', 'Tungi'],
                            ] as const
                          ).map(([theme, label]) => (
                            <button
                              className={`theme-choice ${draft.theme === theme ? 'chosen' : ''}`}
                              key={theme}
                              onClick={() => update({ theme })}
                              aria-pressed={draft.theme === theme}
                            >
                              <span className={`theme-swatch ${theme}`}>
                                <span>Aa</span>
                                {draft.theme === theme && <Check size={17} weight="bold" />}
                              </span>
                              <strong>{label}</strong>
                            </button>
                          ))}
                        </div>
                        <div className="setting-row">
                          <div>
                            <strong>Dinamik subtitrlar</strong>
                            <p>So‘zlar vaqt bo‘yicha ajralib turadi</p>
                          </div>
                          <Toggle label="Dinamik subtitrlar" checked={draft.captions} onChange={(captions) => update({ captions })} />
                        </div>
                        <div className="color-setting">
                          <strong>Subtitr urg‘u rangi</strong>
                          <div className="color-options">
                            {(['#d9f991', '#ffffff', '#fbbf76'] as const).map((color, i) => (
                              <button
                                key={color}
                                style={{ background: color }}
                                className={draft.captionColor === color ? 'chosen' : ''}
                                aria-label={['Laym', 'Oq', 'Shaftoli'][i]}
                                aria-pressed={draft.captionColor === color}
                                onClick={() => update({ captionColor: color })}
                              >
                                {draft.captionColor === color && <Check size={19} weight="bold" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="setting-row">
                          <div>
                            <strong>Format</strong>
                            <p>Instagram Reels, TikTok va YouTube Shorts</p>
                          </div>
                          <span className="format-chip">9:16 · 1080p</span>
                        </div>
                      </div>
                    )}

                    {tab === 'voice' && (
                      <div className="voice-form">
                        <div className="voice-illustration">
                          <Waveform size={40} weight="duotone" />
                          <h3>Hikoyangizga ovoz bering</h3>
                          <p>ElevenLabs bilan tabiiy ovoz va aniq subtitr vaqtlari.</p>
                        </div>
                        <div className="setting-row">
                          <div>
                            <strong>AI ovoz</strong>
                            <p>
                              {draft.voice
                                ? 'Ovoz yaratildi · ElevenLabs'
                                : state.services.voice
                                ? 'ElevenLabs ulangan'
                                : 'Hozircha ulanmagan'}
                            </p>
                          </div>
                          <span className={`service-status ${state.services.voice ? 'connected' : ''}`}>
                            {state.services.voice ? 'Ulangan' : 'Kalit kerak'}
                          </span>
                        </div>
                        <button
                          className="primary full"
                          disabled={!!busy || !state.services.voice}
                          onClick={() =>
                            void run('voice', async () => {
                              const result = await api<{ voice: ProjectInput['voice'] }>({
                                action: 'voice',
                                project: draft,
                              });
                              update({ voice: result.voice });
                              setNotice({ text: 'Ovoz tayyor. Subtitr vaqtlari audioga moslandi.', error: false });
                            })
                          }
                        >
                          {busy === 'voice' ? (
                            <CircleNotch size={17} className="spin" weight="bold" />
                          ) : (
                            <SpeakerHigh size={18} weight="duotone" />
                          )}
                          {draft.voice ? 'Ovozni qayta yaratish' : 'Ovoz yaratish'}
                        </button>
                        {!state.services.voice && (
                          <button className="text-button full" onClick={() => navigate('settings')}>
                            ElevenLabs’ni ulash <ArrowRight size={14} weight="bold" />
                          </button>
                        )}
                        <div className="setting-row">
                          <div>
                            <strong>Fon musiqasi</strong>
                            <p>Studio beat · original instrumental</p>
                          </div>
                          <Toggle checked={draft.music} onChange={(music) => update({ music })} label="Fon musiqasi" />
                        </div>
                        <p className="muted-note">
                          {draft.voice
                            ? 'Matn tahrirlansa, ovozni qayta yaratish kerak.'
                            : 'AI ovoz yo‘q: eksport faqat tanlangan fon musiqasi bilan yoki ovozsiz yaratiladi. Subtitr vaqtlari taxminiy.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="editor-footer">
                    <span>
                      <ShieldCheck size={16} weight="duotone" />
                      {state.authConfigured ? 'Shaxsiy ish maydoni' : 'Sinov mahsuloti bilan boshlang'}
                    </span>
                    <button className="text-button" disabled={!!busy} onClick={() => void save()}>
                      {busy === 'save' ? (
                        <CircleNotch size={14} className="spin" weight="bold" />
                      ) : (
                        <Checks size={16} weight="bold" />
                      )}
                      Saqlash
                    </button>
                  </div>
                </section>

                <aside className="preview-panel">
                  <div className="preview-heading">
                    <h2>Jonli prevyu <span /></h2>
                    <span>9:16</span>
                  </div>
                  <div className="preview-stage">
                    <div className="video-frame">
                      <Player
                        ref={player}
                        component={AdComposition}
                        inputProps={{ project: draft, imageSrc, voiceSrc }}
                        durationInFrames={duration * 30}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        controls
                        loop
                        style={{ width: '100%', height: '100%' }}
                        acknowledgeRemotionLicense
                      />
                    </div>
                  </div>
                  <div className="preview-meta">
                    <span>
                      <span className="tiny-dot" />
                      {draft.voice ? 'AI ovoz bilan' : draft.music ? 'Fon musiqasi bilan' : 'Ovozsiz prevyu'}
                    </span>
                    <span>{seconds(duration)} · 1080p</span>
                  </div>
                  <div className="timeline" aria-label="Sahnalar ketma-ketligi">
                    {draft.scenes.map((s, i) => (
                      <button
                        key={s.role}
                        aria-label={`${roleLabels[s.role]} sahnasi`}
                        className={`timeline-segment segment-${i} ${activeScene === i ? 'active' : ''}`}
                        onClick={() => player.current?.seekTo(Math.round(boundaries[i] * 30))}
                      >
                        <span>{['Hook', 'Muammo', 'Yechim', 'CTA'][i]}</span>
                      </button>
                    ))}
                  </div>
                  <button className="export-button" disabled={!!busy} onClick={() => void exportVideo()}>
                    {busy === 'export' ? (
                      <CircleNotch size={18} className="spin" weight="bold" />
                    ) : (
                      <DownloadSimple size={18} weight="bold" />
                    )}
                    MP4 eksport qilish <span>1 kredit</span>
                  </button>
                  <p className="preview-footnote">
                    {draft.product.demo ? 'Namuna mahsulot va namuna narx.' : 'Eksport — joriy sozlamalaringiz asosida.'} <br />
                    {state.services.worker ? 'Render worker tayyor.' : 'Render worker hali ulanmagan.'}
                  </p>
                </aside>
              </div>
            </>
          )}

          {view === 'projects' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Loyihalarim</h1>
                  <p>G‘oyadan tayyor reklamaga. To‘xtagan joyingizdan davom eting.</p>
                </div>
                <button className="primary" onClick={() => reset()}>
                  <Plus size={17} weight="bold" />
                  Yangi loyiha
                </button>
              </div>
              <input
                className="search"
                placeholder="Loyiha nomi bo‘yicha qidirish…"
                aria-label="Loyihalarni qidirish"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {state.projects.length === 0 ? (
                <div className="empty-state">
                  <FolderSimpleStar size={44} weight="duotone" />
                  <h2>Birinchi hikoyangizni boshlang</h2>
                  <p>Studiyoda mahsulot qo‘shing va loyihangizni saqlang.</p>
                  <button className="primary" onClick={() => navigate('studio')}>
                    Studiyoni ochish <ArrowRight size={17} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="project-list">
                  {state.projects
                    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                    .map((p) => (
                      <article className="project-row" key={p.id}>
                        <span className={`project-thumb ${p.theme}`}>
                          <FilmSlate size={28} weight="duotone" />
                        </span>
                        <button className="project-title" onClick={() => open(p)}>
                          <strong>{p.name}</strong>
                          <span>
                            {languages[p.language]} · {videoDuration(p)} soniya ·{' '}
                            {new Date(p.updatedAt).toLocaleDateString('uz-UZ')}
                          </span>
                        </button>
                        <span className="project-type">{p.product.demo ? 'Namuna' : 'Mahsulot'}</span>
                        <IconButton label={`${p.name} loyihasini ochish`} onClick={() => open(p)}>
                          <ArrowUpRight size={20} weight="bold" />
                        </IconButton>
                        <IconButton
                          label={`${p.name} loyihasini o‘chirish`}
                          onClick={async () => {
                            if (await askConfirm('Loyiha o‘chirilsinmi? Tayyor eksportlar saqlanadi.'))
                              void run('delete', async () => {
                                await api({ action: 'delete', id: p.id });
                                if (projectId === p.id) setProjectId(undefined);
                                await refresh();
                              });
                          }}
                        >
                          <Trash size={18} weight="duotone" />
                        </IconButton>
                      </article>
                    ))}
                </div>
              )}
            </>
          )}

          {view === 'exports' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Eksportlar</h1>
                  <p>Videolaringiz yig‘ilmoqda. Tayyor MP4 fayllarni shu yerdan oling.</p>
                </div>
                <span className="format-label">
                  <span className="status-dot" />
                  {rendering} ta faol render
                </span>
              </div>
              {!state.renders.length ? (
                <div className="empty-state">
                  <FilmSlate size={44} weight="duotone" />
                  <h2>Katta ekranga tayyormisiz?</h2>
                  <p>Studiyoda videongizni tekshiring va MP4 eksportini boshlang.</p>
                  <button className="primary" onClick={() => navigate('studio')}>
                    Studiyoga qaytish <ArrowRight size={17} weight="bold" />
                  </button>
                </div>
              ) : (
                <div className="export-list">
                  {state.renders.map((r) => (
                    <article className="export-row" key={r.id}>
                      <span className={`export-icon ${r.status}`}>
                        <FilmSlate size={24} weight="duotone" />
                      </span>
                      <div className="export-detail">
                        <h3>{r.projectName}</h3>
                        <p>
                          {new Date(r.createdAt).toLocaleString('uz-UZ')} · MP4 · 1080 × 1920
                        </p>
                        {r.status === 'rendering' && (
                          <div className="progress-track">
                            <span style={{ width: `${r.progress}%` }} />
                          </div>
                        )}
                        {r.error && <p className="error-text">{r.error}</p>}
                      </div>
                      <span className={`render-status ${r.status}`}>
                        {
                          {
                            queued: 'Navbatda',
                            rendering: `Yig‘ilmoqda · ${r.progress}%`,
                            completed: 'Tayyor',
                            failed: 'Xatolik',
                          }[r.status]
                        }
                      </span>
                      {r.asset && (
                        <a
                          className="secondary"
                          href={state.assetUrls[`/api/assets/${r.asset}`] || `/api/assets/${r.asset}?download=1`}
                          download={`adclone-${r.id}.mp4`}
                        >
                          <DownloadSimple size={17} weight="bold" />
                          Yuklab olish
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {view === 'settings' && (
            <>
              <div className="page-heading">
                <div>
                  <h1>Studiyo sozlamalari</h1>
                  <p>Xizmatlaringizni ulang. Har bir bosqichning holatini shu yerda ko‘ring.</p>
                </div>
                <span className="format-label">MVP · v0.1</span>
              </div>
              <section className="settings-panel">
                <h2>Integratsiyalar</h2>
                {(
                  [
                    ['Gemini', 'AI ssenariy va 5 tilda matn', 'GEMINI_API_KEY', state.services.gemini],
                    ['ElevenLabs', 'Tabiiy ovoz va so‘zma-so‘z vaqtlar', 'ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID', state.services.voice],
                    ['Firecrawl', 'JavaScript bilan ishlaydigan do‘konlardan import', 'FIRECRAWL_API_KEY', state.services.scraper],
                    ['remove.bg', 'Mahsulot rasmining fonini olib tashlash', 'REMOVE_BG_API_KEY', state.services.background],
                    ['Supabase', 'Hisoblar, shaxsiy loyihalar va fayllar', 'NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY', state.authConfigured],
                    ['Render worker', '1080p MP4 eksport va navbat', 'npm run worker', state.services.worker],
                  ] as const
                ).map(([name, desc, key, on]) => (
                  <div className="integration-row" key={name}>
                    <span className="integration-monogram">{name[0]}</span>
                    <div>
                      <h3>{name}</h3>
                      <p>{desc}</p>
                      {!state.authConfigured && <code>{key}</code>}
                    </div>
                    <span className={`service-status ${on ? 'connected' : ''}`}>
                      {on ? 'Ulangan' : 'Sozlash kerak'}
                    </span>
                  </div>
                ))}
              </section>
              {!state.authConfigured && (
                <section className="setup-note">
                  <h2>Ishga tushirish</h2>
                  <p>
                    Mahalliy rejimda <code>.env.example</code> faylini <code>.env.local</code> nomi bilan nusxalang va o‘zingizning
                    kalitlaringizni qo‘shing. Serverni qayta ishga tushiring.
                  </p>
                  <p>
                    Vercel uchun kalitlarni loyiha Environment Variables bo‘limiga kiriting. Supabase’da{' '}
                    <code>supabase/migrations/001_studio.sql</code> migratsiyasini bajaring. Render worker alohida server yoki
                    konteynerda ishlaydi. Batafsil yo‘riqnoma loyiha README faylida.
                  </p>
                  <p>
                    Kalitsiz: shablon ssenariy, rasm yuklash, jonli tahrir, musiqa va MP4 eksport. AI avatar va haqiqiy billing
                    hali ulanmagan; test kreditlari sotilmaydi.
                  </p>
                </section>
              )}
            </>
          )}

          {view === 'account' && (
            <section className="account-panel">
              <div className="account-icon">
                <UserCircle size={40} weight="duotone" />
              </div>
              <h1>
                {state.user && state.authConfigured
                  ? 'Mening hisobim'
                  : accountMode === 'signup'
                  ? 'Studiyongizni oching'
                  : accountMode === 'reset'
                  ? 'Yangi parol o‘rnating'
                  : 'Yana xush kelibsiz'}
              </h1>
              {state.user && state.authConfigured ? (
                <>
                  <p>{state.user.email}</p>
                  <p>{state.credits} ta test krediti mavjud.</p>
                  <button
                    className="secondary"
                    onClick={() =>
                      void run('logout', async () => {
                        await browserAuth()!.auth.signOut();
                        setDraft(createDraft());
                        setProjectId(undefined);
                        setDirty(false);
                        await refresh();
                      })
                    }
                  >
                    <SignOut size={17} weight="bold" />
                    Hisobdan chiqish
                  </button>
                </>
              ) : !state.authConfigured ? (
                <>
                  <p>Hozir kalitsiz mahalliy sinov rejimidasiz. Mijozlar uchun xavfsiz hisoblar Supabase ulangandan keyin ishlaydi.</p>
                  <button className="primary" onClick={() => navigate('settings')}>
                    Ulash yo‘riqnomasi <ArrowRight size={17} weight="bold" />
                  </button>
                </>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void authenticate();
                  }}
                >
                  {accountMode !== 'reset' && (
                    <Field label="Email manzili">
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                  )}
                  <Field label="Parol">
                    <input
                      type="password"
                      autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'}
                      minLength={8}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <button className="primary full" disabled={!!busy}>
                    {busy ? <CircleNotch className="spin" size={17} weight="bold" /> : <ArrowRight size={17} weight="bold" />}
                    {accountMode === 'signup' ? 'Hisob ochish' : accountMode === 'reset' ? 'Parolni saqlash' : 'Kirish'}
                  </button>
                  {accountMode !== 'reset' && (
                    <button
                      className="text-button full"
                      type="button"
                      onClick={() => setAccountMode(accountMode === 'login' ? 'signup' : 'login')}
                    >
                      {accountMode === 'login' ? 'Yangi hisob yaratish' : 'Menda hisob bor'}
                    </button>
                  )}
                  {accountMode === 'login' && (
                    <button
                      type="button"
                      className="text-button full"
                      onClick={() =>
                        void run('reset', async () => {
                          if (!email) throw new Error('Avval email manzilingizni kiriting.');
                          const { error } = await browserAuth()!.auth.resetPasswordForEmail(email, {
                            redirectTo: window.location.origin,
                          });
                          if (error) throw error;
                          setNotice({
                            text: 'Agar hisob mavjud bo‘lsa, emailga tiklash havolasi yuboriladi.',
                            error: false,
                          });
                        })
                      }
                    >
                      Parolni unutdingizmi?
                    </button>
                  )}
                </form>
              )}
            </section>
          )}
        </main>
        <footer className="app-footer">
          <span>AdClone Studio</span>
          <span>Mahsulotingiz gapirsin.</span>
        </footer>
      </div>
    </div>
  );
}
