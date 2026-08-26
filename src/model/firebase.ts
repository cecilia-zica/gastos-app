import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

/**
 * Conexão com o Firebase. Lê a config das variáveis VITE_FIREBASE_* (.env).
 * Enquanto o .env não existir, `firebaseEnabled` = false e o app segue no
 * armazenamento local — nada quebra. Quando a config chegar, o app passa a
 * usar a nuvem (Firestore: offline + sync cel/note) sem mexer nas telas.
 */
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.projectId);

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

function ensureApp(): FirebaseApp {
  if (!app) app = initializeApp(cfg as Record<string, string>);
  return app;
}

/** Firestore com cache offline persistente (funciona sem internet). */
export function getDb(): Firestore {
  if (!_db) {
    _db = initializeFirestore(ensureApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  }
  return _db;
}

export function getFbAuth(): Auth {
  if (!_auth) _auth = getAuth(ensureApp());
  return _auth;
}
