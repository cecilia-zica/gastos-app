import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseEnabled, getFbAuth } from "../model/firebase";

/**
 * Controller (MVC) de autenticacao. Se o Firebase nao estiver configurado
 * (.env ausente), fica sempre "loading: false, user: null" e o app segue
 * 100% local — nenhuma tela de login aparece.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);

  useEffect(() => {
    if (!firebaseEnabled) return;
    const unsub = onAuthStateChanged(getFbAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn() {
    await signInWithPopup(getFbAuth(), new GoogleAuthProvider());
  }

  async function signOutUser() {
    await signOut(getFbAuth());
  }

  return { user, loading, signIn, signOut: signOutUser };
}
