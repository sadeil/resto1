# k2nobeit — كأنه بيت

منصة قائمة طعام عربية أولاً لمطعم بيتي فلسطيني. المشروع monorepo يضم واجهة Next.js 15 (App Router) وواجهة API مستقلة بـ Express وPrisma/PostgreSQL. القائمة العامة تقرأ المحتوى المنشور فقط؛ تعديلات الإدارة تبقى مسودات حتى تنفيذ النشر.

## البنية

```text
apps/web   Next.js, Tailwind, TanStack Query, RTL public menu and admin UI
apps/api   Express, Prisma, JWT-cookie authentication, Cloudinary integration
```

طبقة API تطبق الاستجابة الموحدة، Zod validation، Helmet، CORS، ضغط الاستجابات، تحديد محاولات الدخول، وسجل التدقيق. الأسعار `DECIMAL(10,2)`، والحذف افتراضياً soft-delete. أدوار `OWNER / MANAGER / EDITOR` ممثلة في قاعدة البيانات، والمالك هو الدور المدعوم في الإصدار الحالي.

## التشغيل المحلي

المتطلبات: Node.js 22، npm 11، PostgreSQL 16.

1. انسخ `.env.example` إلى `.env` وغيّر الأسرار. يجب أن يكون `JWT_SECRET` عشوائياً بطول 32 حرفاً على الأقل.
2. شغّل `docker compose up -d db`.
3. ثبّت الحزم: `npm install`.
4. أنشئ Prisma client والترحيل: `npm run db:generate` ثم `npm run db:migrate -- --name init`.
5. للتطوير فقط، عيّن `SEED_ADMIN_PASSWORD` إلى كلمة قوية بطول 12+ حرفاً ثم شغّل `npm run db:seed`. لا تستخدم بيانات التطوير في الإنتاج.
6. شغّل `npm run dev`. الواجهة على `http://localhost:3000/menu` وAPI على `http://localhost:4000/api`.

الحساب الأول هو قيمة `SEED_ADMIN_EMAIL` (افتراضياً `owner@k2nobeit.local`) وكلمة المرور التي وضعتها أنت في `SEED_ADMIN_PASSWORD`؛ لا توجد كلمة مرور ثابتة في المستودع. الحساب ملزم بتغييرها بعد أول دخول عبر `POST /api/auth/change-password`.

## متغيرات البيئة

- `DATABASE_URL`: اتصال PostgreSQL.
- `JWT_SECRET`: مفتاح توقيع الجلسة.
- `WEB_ORIGIN`: أصل الواجهة المسموح في CORS.
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`: عناوين النشر العامة.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: رفع الصور.
- `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`: للـ seed التطويري فقط.

في Cloudinary أنشئ حساباً، انسخ القيم الثلاث، واستخدم upload preset مقيّداً عند تشديد بيئة الإنتاج. API يقبل JPG/PNG/WebP حتى 5MB ويطبّق تحسيناً تلقائياً.

## أوامر التشغيل والنشر

- `npm run dev` — الخادمان معاً.
- `npm run build` — فحص وبناء الإنتاج.
- `npm test` — اختبارات API.
- `docker compose up --build` — الحاويات محلياً.
- `npx prisma migrate deploy -w apps/api` — تطبيق ترحيلات الإنتاج قبل بدء API.

## النشر المجاني: Cloudflare Workers + Render + Neon + Cloudinary

هذه البنية تبقي Next.js App Router وSSR وReact Server Components ولوحة الإدارة وAPI وقاعدة البيانات فعّالة. لا تستخدم Cloudflare Pages أو static export. جميع أوامر npm التالية تُشغّل من جذر المستودع حتى يستخدم الـmonorepo ملف `package-lock.json` الواحد.

### 1. Neon PostgreSQL

1. أنشئ مشروعًا مجانيًا وقاعدة بيانات في [Neon](https://console.neon.tech/).
2. من **Connect** انسخ رابط الاتصال pooled إلى `DATABASE_URL`، وانسخ الرابط direct/non-pooled إلى `DIRECT_URL`. أبقِ `sslmode=require` في الرابطين.
3. لا تضع أي رابط اتصال في GitHub أو في ملفات `.env` المتتبعة.

يستخدم Prisma الرابط pooled لتشغيل التطبيق، ويستخدم `directUrl` للترحيلات التي تحتاج اتصالًا مباشرًا.

### 2. Cloudinary

1. أنشئ حسابًا مجانيًا في [Cloudinary](https://cloudinary.com/).
2. من API Keys انسخ `CLOUDINARY_CLOUD_NAME` و`CLOUDINARY_API_KEY` و`CLOUDINARY_API_SECRET`.
3. ضع القيم في Render فقط. القيمة `CLOUDINARY_API_SECRET` سر ولا يجوز إضافتها إلى GitHub أو إلى متغيرات الواجهة.

### 3. Render API

1. في [Render](https://dashboard.render.com/) اختر **New > Blueprint** واربط GitHub repository `sadeil/resto1`.
2. اختر ملف `render.yaml`. سينشئ خدمة Web Service باسم `k2nobeit-api` من جذر المستودع مع auto-deploy وhealth check على `/api/health`.
3. تأكد أن الخطة **Free**، ثم أدخل القيم السرية المطلوبة في Render:

   - `DATABASE_URL`: رابط Neon pooled.
   - `DIRECT_URL`: رابط Neon direct.
   - `JWT_SECRET`: قيمة عشوائية قوية بطول 64 حرفًا على الأقل. يمكن توليد واحدة محليًا بـ `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `NODE_ENV`: `production`.
   - `WEB_ORIGIN`: رابط Cloudflare النهائي كاملًا ومن دون `/` في النهاية، مثل `https://k2nobeit.<account-subdomain>.workers.dev`.
   - `SEED_ADMIN_EMAIL`: بريد مدير المطعم.
   - `SEED_ADMIN_PASSWORD`: كلمة أولية قوية بطول 12 حرفًا على الأقل.
   - `CLOUDINARY_CLOUD_NAME`.
   - `CLOUDINARY_API_KEY`.
   - `CLOUDINARY_API_SECRET`.

أمر البناء المضبوط في `render.yaml` هو:

```bash
npm ci && npm run db:generate -w apps/api && npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma && npm run db:seed -w apps/api && npm run build -w apps/api
```

وأمر البدء هو `npm run start -w apps/api`. بعد النشر، تحقق من `https://k2nobeit-api.onrender.com/api/health`. عملية seed قابلة لإعادة التشغيل، وتنشئ المدير فقط إن لم يكن موجودًا؛ الحقل `update` فارغ لذلك لا تستبدل كلمة مرور مدير موجود.

### 4. Cloudflare Workers frontend

1. في Cloudflare افتح **Workers & Pages > Create > Import a repository**، واختر `sadeil/resto1`. أنشئ **Worker** وليس Pages static site.
2. اترك جذر المستودع هو `/` حتى يعمل `npm ci` من الجذر ويكتشف npm workspaces.
3. عيّن أمر التثبيت إلى `npm ci` وأمر النشر إلى:

   ```bash
   npm run deploy -w apps/web
   ```

4. أضف Build Variables التالية قبل أول build:

   - `NEXT_PUBLIC_API_URL=https://k2nobeit-api.onrender.com/api`
   - `NEXT_PUBLIC_SITE_URL=https://k2nobeit.<account-subdomain>.workers.dev`

5. اسم Worker في `apps/web/wrangler.jsonc` هو `k2nobeit`. بعد معرفة رابط `workers.dev` الحقيقي، استبدل `<account-subdomain>` في `NEXT_PUBLIC_SITE_URL`، وضع الأصل نفسه تمامًا في `WEB_ORIGIN` على Render، ثم أعد نشر الخدمتين.
6. ربط GitHub في Cloudflare و`autoDeploy: true` في Render يجعلان كل push إلى فرع الإنتاج يعيد نشر الخدمتين تلقائيًا.

للمعاينة محليًا في runtime قريب من Cloudflare:

```bash
npm run preview -w apps/web
```

وللنشر اليدوي بعد تسجيل الدخول بـWrangler:

```bash
npm run deploy -w apps/web
```

### 5. فحص ما بعد النشر

1. افتح `/api/health` ثم `/menu`. تظهر حالة تحميل عربية وتعيد الواجهة محاولة طلب المنيو أثناء استيقاظ Render Free؛ API يرسل cache عامًا قصيرًا للمنيو فقط.
2. افتح `/admin/login` وسجّل الدخول، ثم اختبر الإضافة والتعديل والأرشفة والاستعادة والنشر.
3. اختبر رفع JPG/PNG/WebP وتأكد من ظهور الصورة في Cloudinary والمنيو المنشور.
4. من أدوات المتصفح تأكد أن كوكي `session` تحمل `HttpOnly`, `Secure`, `SameSite=None`, و`Path=/`. في التطوير تستخدم `SameSite=Lax` ولا تستخدم Secure على HTTP المحلي.
5. تأكد أن ردود `/api/admin/*` و`/api/auth/*` تحمل `Cache-Control: private, no-store`، وأن CORS يعيد أصل `WEB_ORIGIN` المحدد مع credentials ولا يعيد `*`.

ملاحظة متعلقة بالكوكيز: `workers.dev` و`onrender.com` نطاقان مختلفان، ولذلك تعتبر بعض المتصفحات كوكي Render طرفًا ثالثًا. الإعداد الحالي هو الإعداد الصحيح للطلب عبر النطاقات، لكن المتصفح أو سياسة المستخدم قد تحظر third-party cookies بالكامل. للحصول على مصادقة موثوقة في كل المتصفحات استخدم لاحقًا نطاقًا مخصصًا مشتركًا (مثل `menu.example.com` و`api.example.com`) أو proxy للـAPI تحت أصل الواجهة نفسه.

عند النشر، استخدم HTTPS، عيّن `NODE_ENV=production`، خزّن الأسرار في مدير أسرار المنصة، وشغّل PostgreSQL مُداراً ونسخاً احتياطية. افصل عنوان API العام عن عنوانه داخل Docker عند الحاجة.

## API المختصر

- `GET /api/health`, `GET /api/menu`
- `POST /api/auth/login|logout|change-password`, `GET /api/auth/me`
- `GET|POST /api/admin/categories`, `PATCH|DELETE /api/admin/categories/:id`
- `GET|POST /api/admin/items`, `PATCH|DELETE /api/admin/items/:id`, `POST /api/admin/items/:id/restore`
- `GET|PATCH /api/admin/settings`, `GET /api/admin/activity`
- `POST /api/admin/upload`, `POST /api/admin/publish`

## حدود الإصدار الحالي

واجهة الإدارة الحالية تغطي الدخول، الاستعراض، إنشاء التصنيفات، ومعاينة/نشر القائمة. بقية عمليات CRUD متاحة ومؤمّنة في API، لكن تحتاج شاشات تحرير كاملة قبل الإطلاق التجاري. صفحة QR، drag-and-drop، حذف صور Cloudinary القديمة، مجموعة الاختبارات المطلوبة، وواجهة تغيير كلمة المرور لم تُستكمل بعد. لا تعتبر هذا الإصدار جاهزاً للإطلاق قبل إكمالها وإجراء مراجعة أمنية واختبارات وصول ومتصفح.

تحسينات لاحقة: صلاحيات Manager/Editor الدقيقة، تاريخ المسودات والرجوع لإصدار سابق، تحليلات مشاهدة مجهولة، وتعدد الفروع واللغات.

## بيانات قائمة برغراتنا

ملف seed يستخدم قائمة المطعم المقدمة كمصدر حقيقة وحيد لقسم البرغر. ينشئ عشرة أصناف بالترتيب المعتمد، وسبعة أصناف بحجمي `150 غم` و`200 غم`، وصنف البرغر المميز الثابت، وبرغر الدجاج الثابت، والبرغر النباتي الثابت، واثنتي عشرة إضافة مدفوعة قابلة لإعادة الاستخدام. البطاطا العادية ممثلة بالحقل `includesRegularFries` وليست إضافة مدفوعة؛ أما `بطاطا ويدجز` فتبقى إضافة مستقلة بسعرها.

إعادة تشغيل seed متكررة وآمنة، كما تحذف بيانات العينات القديمة المعروفة حتى لا تختلط بالقائمة الحقيقية. لم تُرفق صور حقيقية مع بيانات المصدر، لذلك لا ينشئ seed روابط صور أو صور أطعمة بديلة من الإنترنت. يمكن رفع الصور الأصلية من خلال Cloudinary بعد إعداد متغيراته.

قسم الساندويشات يستخدم كذلك البيانات الأصلية المقدمة: سبعة ساندويشات بالترتيب والأسعار والأوزان والمكونات المحددة، وخمس إضافات خاصة بالقسم. الإضافات مرتبطة بالقسم، ولذلك يمكن أن تحمل `بطاطا ويدجز` سعراً مختلفاً في الساندويشات عن سعرها في البرغر دون تعارض أو تسريب بين الأصناف.

بيانات الفطور والمقبلات والسلطات مطابقة للمصدر كذلك. الفطور مقسّم في قاعدة البيانات إلى `صحون` ثم `ساندويشات`، واختيار تحضير البيض واختيار صوص الأجنحة مخزنان كمجموعتي اختيار إلزاميتين منفصلتين عن المكونات. الأصناف التي لم يقدّم المصدر مكوناتها تحتفظ بقائمة مكونات فارغة، ولا تعرض الواجهة لها قسماً فارغاً أو وصفاً بديلاً.
