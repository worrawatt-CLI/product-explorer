"use client";

import { useSyncExternalStore } from "react";
export type Role = "admin" | "user";

export type Session = {
  username: string;
  role: Role;
};

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  admin: { password: "admin", role: "admin" },
  user: { password: "user", role: "user" },
};

const STORAGE_KEY = "product-explorer:auth";

type AuthState = {
  session: Session | null;
  hydrated: boolean; 
};

const serverState: AuthState = { session: null, hydrated: false };

let state: AuthState = serverState;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (loaded) {
    return;
  }
  loaded = true;

  let session: Session | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      session = JSON.parse(raw) as Session;
    }
  } catch {
    // pass
  }

  state = { session, hydrated: true };
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function login(username: string, password: string): Session | null {
  const key = username.trim().toLowerCase();
  const cred = CREDENTIALS[key];

  if (!cred || cred.password !== password) {
    return null;
  }

  const session: Session = { username: key, role: cred.role };
  state = { session, hydrated: true };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // pass
  }

  emit();
  return session;
}

export function logout() {
  state = { session: null, hydrated: true };
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // pass
  }
  emit();
}

export const roleLabel: Record<Role, string> = {
  admin: "ผู้ดูแลระบบ",
  user: "ผู้ใช้ทั่วไป",
};

export const homePath = (role: Role) =>
  role === "admin" ? "/admin" : "/shop";

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (listener) => {
      loadOnce();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => {
      loadOnce();
      return state;
    },
    () => serverState,
  );
}
