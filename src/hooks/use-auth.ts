"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://www.softrha.com.br",
  basePath: "/api/auth",
  fetchOptions: {
    credentials: "include",
  },
});

export const {
  useSession,
  signIn,
  signOut,
  signUp,
  getSession,
} = authClient;
