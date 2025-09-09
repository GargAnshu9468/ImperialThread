// src/context/AuthContext.tsx
import React, { createContext, useContext } from "react";

export type AuthContextShape = {
  loading: boolean;
  isFirstLaunch: boolean | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  finishOnboarding: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextShape>({
  loading: true,
  isFirstLaunch: null,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  finishOnboarding: async () => {},
});

/**
 * Small hook wrapper for ease of use:
 * import { useAuth } from 'src/context/AuthContext'
 */
export const useAuth = () => useContext(AuthContext);
