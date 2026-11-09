import { z } from 'zod';

export const languages = { uz: "O‘zbekcha", ru: 'Русский', en: 'English', kk: 'Қазақша', tr: 'Türkçe' } as const;
export type Language = keyof typeof languages;
export const roles = ['hook', 'problem', 'solution', 'cta'] as const;
export const roleLabels = { hook: 'Diqqatni tortish', problem: 'Muammo', solution: 'Yechim', cta: 'Harakatga chaqirish' };
export const assetUrl = z.string().regex(/^(\/demo-product\.jpg|\/api\/assets\/[a-f0-9-]+\.(jpg|png|webp|mp3|wav))$/);
export const productSchema = z.object({
  title: z.string().trim().min(2).max(120), description: z.string().max(2000),
  price: z.string().max(60), sourceUrl: z.string().max(2000), marketplace: z.string().max(40),
  image: assetUrl, features: z.array(z.string().max(200)).max(8), demo: z.boolean().default(false)
});
export const sceneSchema = z.object({ role: z.enum(roles), text: z.string().trim().min(1).max(300) });
export const projectInputSchema = z.object({
  name: z.string().trim().min(1).max(100), product: productSchema,
  language: z.enum(['uz', 'ru', 'en', 'kk', 'tr']), duration: z.union([z.literal(15), z.literal(30)]),
  scenes: z.array(sceneSchema).length(4).refine(s => s.every((v, i) => v.role === roles[i]), 'Scene order is invalid'),
  theme: z.enum(['lilac', 'mint', 'dark']), captionColor: z.enum(['#d9f991', '#ffffff', '#fbbf76']),
  captions: z.boolean(), music: z.boolean(), scriptSource: z.enum(['template', 'gemini', 'edited']),
  voice: z.object({ url: assetUrl, text: z.string().max(2000), words: z.array(z.object({ word: z.string().max(200), start: z.number().min(0).max(90), end: z.number().min(0).max(90) }).refine(w=>w.end>=w.start)).min(1).max(1000), duration: z.number().positive().max(90), provider: z.literal('elevenlabs') }).nullable()
});
export type Product = z.infer<typeof productSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type Project = ProjectInput & { id: string; createdAt: string; updatedAt: string };
export type Word = { word: string; start: number; end: number };
export type RenderJob = { id: string; projectId: string; projectName: string; status: 'queued' | 'rendering' | 'completed' | 'failed'; progress: number; error: string | null; asset: string | null; createdAt: string };
export type AppState = { projects: Project[]; renders: RenderJob[]; credits: number; user:{id:string;email:string}|null; authConfigured:boolean; assetUrls:Record<string,string>; services: { gemini: boolean; voice: boolean; scraper: boolean; background: boolean; worker: boolean } };
export type VideoProps = { project: ProjectInput; imageSrc?: string; voiceSrc?: string };

export const demoProduct: Product = {
  title: 'Studio Wireless', description: 'Simsiz quloqchin. Yumshoq quloq yostiqchalari va ixcham dizayn. Bu sinov mahsuloti, haqiqiy savdo taklifi emas.',
  price: '349 000 so‘m', sourceUrl: '', marketplace: 'Namuna', image: '/demo-product.jpg',
  features: ['Simsiz ulanish', 'Yumshoq quloq yostiqchalari', 'Ixcham dizayn'], demo: true
};
export const presetProducts: Record<string, Product> = {
  sonic: {
    title: 'Aura Sonic Cleanse', description: 'Ultrasonik yuz tozalash va mikromassaj qurilmasi. Teshiklarni chuqur tozalash va terini yoshartirish uchun.',
    price: '289 000 so‘m', sourceUrl: 'https://uzum.uz/product/aura-sonic-cleanse-9902', marketplace: 'Uzum Market', image: '/demo-product.jpg',
    features: ['Ultrasonik tebranish', 'Suv o‘tkazmaydigan IPX7 korpus', '3 xil tozalash rejimi'], demo: true
  },
  serum: {
    title: 'Hydra Glow Ceramide Serum', description: 'Chuqur namlantiruvchi seramid va peptidli yuz zardobi. Quruqlik va nozik chiziqlarni bartaraf etadi.',
    price: '$24.99', sourceUrl: 'https://amazon.com/dp/B08N5WRWNW-ceramide-serum', marketplace: 'Amazon', image: '/demo-product.jpg',
    features: ['5 xil seramid kompleksi', 'Gialuron kislotasi', 'Hidsiz va hipoallergen'], demo: true
  },
  reel: {
    title: 'Glow Peptide Dew', description: 'Kundalik tabiiy yorqinlik beruvchi peptide ekstrakti va organik botanik moylar majmuasi.',
    price: '$38.00', sourceUrl: 'https://shopify.com/products/glow-peptide-dew', marketplace: 'Shopify', image: '/demo-product.jpg',
    features: ['Botanical peptidlari', '100% vegan formula', '24 soatlik himoya'], demo: true
  }
};
export function templateScenes(product: Product, language: Language, variant = 0): ProjectInput['scenes'] {
  const n = product.title;
  const copy: Record<Language, string[]> = {
    uz: [variant % 2 ? `${n} bilan tanishing.` : `Siz izlagan ${n} shu yerda.`, 'Tanlashdan oldin, siz uchun muhim jihatlarga e’tibor bering.', `${n}. ${product.features.slice(0, 2).join('. ') || product.description.slice(0, 130)}`, 'Batafsil ma’lumot va joriy narxni mahsulot sahifasida ko‘ring.'],
    ru: [variant % 2 ? `Знакомьтесь: ${n}.` : `Ищете ${n}? Посмотрите ближе.`, 'Перед покупкой сравните то, что важно именно вам.', `${n}. Изучите характеристики и фотографии на странице товара.`, 'Узнайте актуальную цену и подробности по ссылке.'],
    en: [variant % 2 ? `Meet ${n}.` : `Looking for ${n}? Take a closer look.`, 'Before choosing, focus on what matters to you.', `${n}. Explore the product photos and specifications.`, 'Visit the product page for details and the current price.'],
    kk: [variant % 2 ? `${n} өнімімен танысыңыз.` : `${n} іздеп жүрсіз бе?`, 'Таңдау алдында сіз үшін маңызды сипаттамаларды салыстырыңыз.', `${n}. Өнімнің суреттері мен сипаттамаларын қараңыз.`, 'Толық ақпарат пен қазіргі бағаны өнім бетінен біліңіз.'],
    tr: [variant % 2 ? `${n} ile tanışın.` : `${n} mi arıyorsunuz? Yakından bakın.`, 'Seçmeden önce sizin için önemli özellikleri karşılaştırın.', `${n}. Ürün fotoğraflarını ve özelliklerini inceleyin.`, 'Güncel fiyat ve ayrıntılar için ürün sayfasını ziyaret edin.']
  };
  return roles.map((role, i) => ({ role, text: copy[language][i] }));
}
export function createDraft(product = demoProduct, language: Language = 'uz', duration: 15 | 30 = 15): ProjectInput {
  return { name: `${product.title} · ${languages[language]}`, product, language, duration,
    scenes: templateScenes(product, language), theme: 'lilac', captionColor: '#d9f991', captions: true, music: false, scriptSource: 'template', voice: null };
}
export const scriptText = (p: Pick<ProjectInput, 'scenes'>) => p.scenes.map(s => s.text).join(' ');
export const videoDuration = (p: ProjectInput) => p.voice ? Math.max(p.duration, Math.ceil(p.voice.duration + 0.5)) : p.duration;
export function estimatedWords(project: ProjectInput): Word[] {
  const duration = videoDuration(project); const spans = [0, .22, .43, .75, 1];
  return project.scenes.flatMap((s, i) => {
    const words = s.text.split(/\s+/).filter(Boolean); const start = spans[i] * duration; const part = (spans[i + 1] - spans[i]) * duration;
    return words.map((word, w) => ({ word, start: start + part * w / words.length, end: start + part * (w + 1) / words.length }));
  });
}
export function sceneBoundaries(project: ProjectInput): number[] {
  if (!project.voice) return [0, .22, .43, .75, 1].map(n => n * videoDuration(project));
  let index = 0;
  return [...project.scenes.map(s => { const start = project.voice!.words[index]?.start ?? 0; index += s.text.split(/\s+/).filter(Boolean).length; return start; }), videoDuration(project)];
}
export function alignmentToWords(alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }): Word[] {
  const words: Word[] = []; let current: Word | null = null;
  alignment.characters.forEach((char, i) => {
    if (/\s/.test(char)) { if (current) words.push(current); current = null; return; }
    if (!current) current = { word: '', start: alignment.character_start_times_seconds[i], end: 0 };
    current.word += char; current.end = alignment.character_end_times_seconds[i];
  });
  if (current) words.push(current);
  return words;
}
