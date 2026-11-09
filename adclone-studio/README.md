# AdClone Studio

O‘zbekcha URL → ssenariy → jonli video muharriri → haqiqiy MP4 MVP. Next.js 16, React, Remotion; production uchun Supabase Auth/Postgres/Storage va alohida render worker.

**Holat:** ishlaydigan mahalliy MVP va Vercel/Supabase deploy konfiguratsiyasi. Cloud hisoblari hali ulanmagan; bu repository o‘z-o‘zidan production’da ishga tushgan degani emas.

## Tez ishga tushirish

Node.js **24 LTS** tavsiya qilinadi (22.13+ kerak).

```bash
cd adclone-studio
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell’da nusxalash: `Copy-Item .env.example .env.local`.
`http://127.0.0.1:3000` ni oching. Hech qanday API kaliti shart emas. Dev buyrug‘i web server va render worker’ni birga ishga tushiradi. Chrome/Edge o‘rnatilgan bo‘lsin yoki `CHROME_EXECUTABLE` belgilang. Boshqa tizimda Remotion brauzerni yuklashi mumkin.

Ushbu mashinada PATH’dagi npm launcher buzilgan bo‘lsa, `& 'C:\Program Files\nodejs\npm.cmd' run dev` ishlaydi. Bu repository tizimning global npm sozlamalarini o‘zgartirmaydi.

Kalitsiz demo loopback bilan cheklangan. `.data/studio.sqlite` loyihalar, navbat va 10 ta **test** kreditini saqlaydi; `.data/assets/` yuklangan media va eksportlarni saqlaydi. Bu fayllar git’ga kirmaydi. Local ma’lumotlar boshqa odam bilan umumiy hisob sifatida ishlatilmasin.

## Hozir ishlaydigan imkoniyatlar

- HTTPS sahifadan Product JSON-LD yoki OpenGraph importi; rasm serverga ko‘chiriladi. Firecrawl kaliti bo‘lsa JavaScript sahifalarini olish adapteri ishlatiladi. Himoyalangan Uzum/Wildberries/Amazon sahifalari har doim ochilishi kafolatlanmaydi; bloklanganda aniq xabar va qo‘lda kiritish mavjud.
- Rasm yuklash, mahsulot nomi/narxi/tavsifi, 5 tilda Hook → Muammo → Yechim → CTA shablonlari. Gemini yoqilsa faktlarga tayangan AI ssenariy.
- Remotion Player: 15/30 soniya, 3 uslub, dinamik subtitr, urg‘u rangi, original instrumental musiqa, sahnaga sakrash. Ovoz bo‘lmasa subtitr vaqtlarining taxminiyligi ko‘rsatiladi.
- ElevenLabs adapteri: audio + character alignment → word alignment. Ovoz uzunroq bo‘lsa video davomiyligi kengayadi. Matn tahrirlanganda eskirgan audio olib tashlanadi. Tanlangan model/voice har bir kerakli til uchun haqiqiy hisobda tekshirilishi kerak.
- remove.bg adapteri (API kaliti kerak).
- Loyiha saqlash/ochish/o‘chirish, eksport tarixi, progress va yuklab olish.
- Haqiqiy H.264/AAC MP4: 1080×1920, 30fps. Preview va eksport bitta `AdComposition` komponentidan foydalanadi.
- Kreditni tranzaksiya ichida rezervlash, takroran bosilgan faol eksportni birlashtirish, xatoda bir marta refund. Ishlatilayotganlar **test kreditlari**, pul emas.
- Supabase email/parol login, signup/email confirmation, parol tiklash, RLS, private Storage, muddati cheklangan signed URL, kunlik API kvotalari. Cloud bilan end-to-end sinov hisob sozlanmaguncha bajarilmaydi.

## Vercel + Supabase deploy

1. Supabase loyihasida SQL Editor orqali `supabase/migrations/001_studio.sql` ni bir marta bajaring. Migratsiya profiles/projects/renders/credit_ledger, RLS, private `studio-assets` bucket va worker RPC’larini yaratadi. Production ma’lumotlari bor muhitda avval backup va staging tekshiruvi qiling.
2. Auth → URL Configuration’da saytingiz HTTPS URL’ini Site URL va ruxsat berilgan redirect sifatida kiriting. Email confirmation’ni yoqing; mijozlarga email yetkazish uchun o‘zingizning SMTP’ingizni sozlang. Signup abuse’dan himoya uchun Supabase Auth rate limits/CAPTCHA’ni ehtiyojga mos sozlang.
3. Repository’ni o‘z Git hosting hisobingizga push qiling va Vercel’da import qiling. **Root Directory: `adclone-studio`**. Framework: Next.js. Node: 24.x. `vercel.json` mavjud.
4. Vercel Environment Variables:

   | Nomi | Qiymati |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (RLS bilan himoyalangan public key) |
   | `APP_URL` | Saytning to‘liq HTTPS origin’i, oxirida `/` bo‘lmasin |
   | `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `FIRECRAWL_API_KEY`, `REMOVE_BG_API_KEY` | Ixtiyoriy server secret’lari |

   **`SUPABASE_SERVICE_ROLE_KEY` faqat worker’da turadi, Vercel yoki brauzer uchun kerak emas.** `ALLOW_LOCAL_DEMO` ni production’da yoqmang. Public env qiymatlari build vaqtida olinadi; o‘zgarsa redeploy qiling.
5. Quyidagi render worker’ni ishga tushiring. Ulanish holati Settings’da ko‘rinadi. Web/API Vercel’da MP4 render qilmaydi.
6. Ikki alohida test hisob bilan signup, email confirmation, login, private fayl/loyiha ajratilishi va eksportni tekshiring. Haqiqiy AI kalitlari bilan besh tildagi sifat/latency/costni o‘lchang.

### Render worker: VPS, Render yoki Railway

Worker Node/Chromium ishlata oladigan doimiy container/VM’da turadi. Supabase navbatidan `FOR UPDATE SKIP LOCKED` orqali ish oladi; Redis shart emas. Snapshot va lease token orqali boshqa worker ayni natijani yakunlay olmaydi. Yo‘qolgan worker lease’i 10 daqiqadan keyin yangi claim paytida xatoga o‘tkaziladi va kredit qaytariladi.

Worker muhitiga `NEXT_PUBLIC_SUPABASE_URL` va **`SUPABASE_SERVICE_ROLE_KEY`** kiriting. Service role’ni Git yoki browser kodiga qo‘ymang. Local `.env.local` bilan:

```bash
docker compose -f compose.worker.yml up --build -d
```

Yoki VM’da `npm ci` va `npm run worker`. Bir `.data` katalogida bitta worker ishlaydi; bir nechta replica uchun har birining alohida local cache’i bo‘lsin. Supabase queued ishlarini bir nechta worker xavfsiz olishi mumkin. Chromium uchun kamida 2 GB RAM bilan boshlang, yuklamani o‘lchang. Worker cache/video fayllari uchun disk monitoring/retention qo‘shing.

Vercel upload cheklovlariga mos rasm yuklash limiti 3.5 MB. Import orqali olingan rasmlar 10 MB gacha bo‘lishi mumkin. `api/studio` maksimal 120 soniya, hosting planingiz limitlari bilan solishtiring. API kalitlarini frontend orqali kiritish/saqlash yo‘q.

## Arxitektura

```text
Browser / Remotion Player
  ├─ Supabase Auth (access token)
  └─ Next API (token validated; payload + quotas checked)
       ├─ Product HTML / optional Firecrawl → private image
       ├─ Template / optional Gemini → storyboard
       ├─ optional ElevenLabs → audio + word timestamps
       ├─ optional remove.bg → cleaned image
       └─ Supabase RLS: project + atomic render/credit RPC
            └─ Dedicated worker → shared Remotion composition
                 → Chromium + FFmpeg → private MP4 → signed download
```

Remote fetches require HTTPS, reject internal IPs, pin the approved DNS address, revalidate redirects, and limit bytes/time. Model inputs are treated as untrusted reference data; no extracted content is executed. Secrets stay server-side. Supabase direct table writes cannot mutate customer credit balances or render status. Anonymous production access has no project/file access. There is no local fallback in a public production deployment.

Key source paths: `src/components/Studio.tsx`, `src/video/AdComposition.tsx`, `src/lib/model.ts`, `src/lib/providers.ts`, `src/lib/repository.ts`, `src/lib/worker-store.ts`, `scripts/worker.ts`, and `supabase/migrations/001_studio.sql`.

## Tekshirish

```bash
npm run typecheck
npm test
npm run build
```

Tests cover SSRF boundaries, JSON-LD parsing, content validation, 5-language timing, alignment conversion, local reserve/refund/recovery, and the actual Supabase SQL migration in embedded PostgreSQL (PGlite), including two-tenant RLS, worker permissions, lease checks, storage isolation and quotas. Cloud Auth/SMTP/Storage network behavior is a separate staging check.

Browser smoke test: sample → mint style → music on → save/export. Validated output: 15.019 seconds, H.264 1080×1920 @30fps + AAC, 1,975,832 bytes. The generated local file is `.data/assets/9f5e8a99-3a95-46b0-936e-0f47c9dd31e0.mp4`. Desktop/mobile UI screenshots are in `.impeccable/review/` (not committed).

Final production-worker smoke test also produced `.data/assets/3f88aa97-0db0-4bf7-96c2-3f55e1ed353c.mp4`: exactly 15 seconds, 1080×1920 @30fps H.264, 1,346,690 bytes, intentionally silent. Verified mobile drawer hiding/Escape/focus return, Russian→Uzbek script switching, explicit URL focus ring, and canceling an import without losing the edited text. Destructive draft changes use a nonblocking HTML dialog. Production build passed without warnings.

## Hali kerak bo‘ladigan ishlar

- **Product-in-hand UGC:** HeyGen/fal/Kling provider tanlovi, consented avatars, asynchronous provider job/poll/callback and real quality tests. Hozir bunday generatsiya ishlaydi deb ko‘rsatilmaydi.
- **Billing:** Stripe/Payme/Click merchant hisoblari, narxlar, webhook signature verification, idempotent purchased-credit ledger va refunds. Checkout yoki soxta to‘lov tugmasi qo‘shilmagan.
- **Launch operations:** verified domain/SMTP, error monitoring, backup/retention, cost alerts, provider rate limits, privacy/terms and customer support. Bular konfiguratsiya/tashkiliy qarorlar talab qiladi.
- Source-page scraping, AI voice and AI script integration code exists, but paid live-provider calls were not tested without user keys. Latency and cost estimates from the brief are not guarantees.
- Remotion commercial use terms depend on company/team size; review the [official license](https://www.remotion.dev/license) before commercial launch. `acknowledgeRemotionLicense` only hides the Player notice; it does not buy a license.

## Assets

Sample photo: [Unsplash source](https://images.unsplash.com/photo-1546435770-a3e426bf472b). Product name/price/features are labelled fictional demonstration data and are not claims about the photographed item. Font: Manrope via `@fontsource/manrope` (OFL). Icons: Lucide. Instrumental loop: original local synthesis in `scripts/prepare-assets.mjs`.
