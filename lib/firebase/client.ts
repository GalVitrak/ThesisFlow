import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

export type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
};

function readConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

export function isFirebaseConfigured(): boolean {
  const c = readConfig();
  return Boolean(c.apiKey && c.projectId);
}

let cached: FirebaseClients | null = null;

export function getFirebase(): FirebaseClients | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (cached) return cached;
  const config = readConfig() as Required<ReturnType<typeof readConfig>>;
  const app = getApps().length ? getApps()[0]! : initializeApp(config);
  cached = {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
  return cached;
}
