import { getDataSource } from "./dataSource";
import { getDb } from "@/lib/mock/store";
import type { User } from "@/lib/types";
import * as firebaseAuth from "./firebase/authService.firebase";

const STORAGE_KEY = "thesisflow_mock_uid";

export function getStoredUserId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setStoredUserId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) sessionStorage.setItem(STORAGE_KEY, id);
  else sessionStorage.removeItem(STORAGE_KEY);
}

export async function signIn(email: string, _password: string): Promise<User | null> {
  if (getDataSource() === "firebase") {
    return firebaseAuth.signIn(email, _password);
  }
  const user = getDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  setStoredUserId(user.id);
  return user;
}

export async function signOut() {
  if (getDataSource() === "firebase") {
    return firebaseAuth.signOut();
  }
  setStoredUserId(null);
}

export async function getCurrentUser(): Promise<User | null> {
  if (getDataSource() === "firebase") {
    return firebaseAuth.getCurrentUser();
  }
  const id = getStoredUserId();
  if (!id) return null;
  return getDb().users.find((u) => u.id === id) ?? null;
}
