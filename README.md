# The Monarch Guild

The Monarch Guild is a React, TypeScript, and Vite single-page application. Firebase
Authentication and Cloud Firestore provide its backend services.

## Deploy to Vercel from GitHub

1. Push this repository to GitHub.
2. In Vercel, choose **Add New… → Project**, import the GitHub repository, and keep
   the project root set to the repository root.
3. Vercel uses the included `vercel.json` build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm ci`
4. In the Vercel project settings, add the Firebase variables below for each
   environment you deploy (Production, Preview, and Development as appropriate).
   Their names and blank placeholders are in `.env.example`.
5. Deploy the project. Add the deployed Vercel domain to **Firebase Console →
   Authentication → Settings → Authorized domains**.

| Variable | Firebase value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Web app auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Web app storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Web app messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Web app app ID |

These `VITE_` values are included in browser code; use only the Firebase **web app**
configuration. Never add service-account credentials or other server secrets to
client-side environment variables. Firestore access is controlled by Firebase
Security Rules, not by Vercel. Deploy rule changes separately with
`firebase deploy --only firestore:rules` after configuring the Firebase CLI for
the intended project.

## Run locally

```bash
npm ci
```

Copy `.env.example` to `.env.local`, fill in the Firebase web app values, and run:

```bash
npm run dev
```

To verify a production build locally:

```bash
npm run build
npm run preview
```
