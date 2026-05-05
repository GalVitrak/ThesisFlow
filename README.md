# ThesisFlow (MVP)

מערכת הדגמה לניהול פרויקטי גמר ותזות — **עברית כברירת מחדל** + מתג **EN**. לוחות בקרה נפרדים לפי תפקיד.

## Tech

- Next.js 15 (App Router), React 19, TypeScript
- CSS Modules + `app/globals.css` (ללא Tailwind)
- Firebase Auth + Firestore (אופציונלי) — שכבת שירותים עם מצב **mock** ללא מפתחות
- תפקידים: `student` | `supervisor` | `examiner` | `admin`

## הרצה מקומית

```bash
npm install
npm run dev
```

פתיחת `http://localhost:3000` מפנה ל־`/he/...`. אחרי התחברות: `/he/dashboard` מפנה ל־`/he/dashboard/student` (או supervisor / examiner / admin).

**Windows / Turbopack:** אם `next dev --turbopack` נכשל עם שגיאות מסוג `_buildManifest` / `ENOENT` בתיקיית `.next`, עצרו את כל שרתי הפיתוח, הריצו `npm run clean`, והפעילו שוב `npm run dev`. אם הבעיה חוזרת, השתמשו ב־`npm run dev:webpack` (ללא Turbopack).

**ניקוי cache של Next:** `npm run clean` מריץ `scripts/clean-next.mjs` ומוחק את `.next` (מתאים אחרי עדכוני Next או כשהבילד נתקע).

**מיתוג HIT:** לוגו לתפריט הצד נמצא ב־`public/branding/hit-logo-50.jpg` (רכיב `HitLogo`).

## חשבונות הדגמה (mock)

כל סיסמה תקפה במצב mock:

| תפקיד   | דוא"ל |
|--------|--------|
| מנהל   | admin@test.com |
| מנחה   | supervisor@test.com |
| בוחן   | examiner@test.com |
| סטודנט | student@test.com |

(קיימים גם משתמשים נוספים עם כתובות `@hit.ac.il` ב־mock seed.)

## מבנה עיקרי

- `app/[locale]/dashboard/` — פניית `/dashboard` + לוחות: `student`, `supervisor`, `examiner`, `admin`
- `lib/services/` — `authService`, `userService`, `projectService`, `applicationService`, `milestoneService`, `reviewService`, `notificationService`, `adminSettingsService`
- `lib/services/firebase/` — מימוש Firestore + `notificationHelper.firebase.ts`
- `lib/mock/` — נתוני דמו וזיכרון מקומי
- `scripts/seed-firestore.mjs` — זריעת Auth + Firestore (אופציונלי)

## Firebase (ייצור / דמו מול ענן)

**מה חייב לקרות בקונסול (אי־אפשר לבצע בשבילכם מרחוק):** יצירת פרויקט ב־Google, הפעלת שירותים, והעתקת מפתחות — דורש התחברות לחשבון Google שלכם.

**מה כבר מוכן בריפו:** `firestore.rules`, `firebase.json`, `apphosting.yaml` (תבנית ל־App Hosting), `.firebaserc.example`, וסקריפטים ב־`package.json` (`firebase:deploy:rules`, וכו.) אחרי `npm install`.

1. [Firebase Console](https://console.firebase.google.com/) → צרו פרויקט והפעילו **Authentication** (Email/Password) ו־**Firestore**.
2. העתיקו `.env.example` ל־`.env.local` ומלאו `NEXT_PUBLIC_FIREBASE_*` מהגדרות אפליקציית ה־Web.
3. `NEXT_PUBLIC_USE_FIREBASE=true`
4. ב־Firestore: מסמכי `users` חייבים להשתמש ב־**אותו id כמו `uid` מ־Auth**, עם שדות `email`, `displayName`, `role` (`student` | `supervisor` | `examiner` | `admin`), ואופציונלי `facultyId`. (`npm run seed:firestore` עושה זאת.)
5. פרסמו כללי אבטחה: הקובץ [`firestore.rules`](firestore.rules) — `npm run firebase:login` (פעם אחת), העתיקו `.firebaserc.example` ל־`.firebaserc` והחליפו ב־Project ID, ואז `npm run firebase:deploy:rules`.

**אוספים (Firestore):** `users`, `faculties`, `projectProposals`, `applications`, `activeProjects`, `milestones`, `submissions`, `reviews`, `defenseExams`, `gradingWeights`, `notifications`, וכן `milestoneTemplates`, `settings` (מסמך `global`), `emailLog`.

### זריעה (Auth + דוגמאות)

דורש **מפתח שירות** (JSON) עם הרשאות מתאימות:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccount.json"
npm run seed:firestore
```

סיסמת ברירת מחדל למשתמשי הדמו: `DemoPass123!` (ניתן לשנות עם `SEED_USER_PASSWORD`).

לאחר הזריעה התחברו עם `student@test.com` / `supervisor@test.com` / וכו.

**אינדקסים:** אם Firestore מבקש אינדקס מורכב (למשל שאילתות עם מספר `where`), הוסיפו לפי הקישור בקונסול.

## פריסה

### Vercel (מומלץ ל־Next.js SSR)

1. חברו את הריפו ל־Vercel.
2. הגדירו משתני סביבה (אותם `NEXT_PUBLIC_FIREBASE_*` ו־`NEXT_PUBLIC_USE_FIREBASE`).
3. `npm run build` רץ ב־CI של Vercel; הנתיבים תחת `[locale]` נתמכים.

### Firebase Hosting / App Hosting

- **מומלץ לפרויקט הזה (Next.js 15 + `[locale]`):** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting/get-started) — בקונסול: חיבור GitHub, בחירת ריפו/ענף, והגדרת משתני סביבה (`NEXT_PUBLIC_*` כמו ב־`.env.local`). אין צורך ב־`out`; Google מריץ `next build` בשבילכם. Blaze נדרש. ראו גם [`apphosting.yaml`](apphosting.yaml).
- **Firebase Hosting קלאסי (`firebase deploy --only hosting`):** משרת תיקייה סטטית (`firebase.json` → `public: "out"`). כרגע **אין** `output: 'export'` ב־`next.config.ts` — הוספת export דורשת בין היתר `generateStaticParams()` לכל מסלול דינמי, ואז `npm run build` יוצר `out` ואפשר `npm run firebase:deploy:hosting`.

קובץ [`firebase.json`](firebase.json) כולל גם `firestore.rules` לפריסת כללים.

## סקריפטים

- `npm run dev` — פיתוח (Turbopack)
- `npm run dev:webpack` — פיתוח עם bundler הקלאסי של Next (אם Turbopack מפריע)
- `npm run clean` — מחיקת `.next` לפני `dev` / `build` נקי
- `npm run build` / `npm run start` — ייצור
- `npm run lint` — ESLint
- `npm run seed:firestore` — זריעת Firestore + Auth (דורש `firebase-admin` ומפתח שירות)
- `npm run firebase:login` / `npm run firebase:use` — התחברות ובחירת פרויקט (Firebase CLI)
- `npm run firebase:deploy:rules` — פריסת `firestore.rules`
- `npm run firebase:deploy:hosting` — פריסת תיקיית `out` (אחרי build סטטי)
