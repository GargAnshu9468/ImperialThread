import React, { createContext, useContext } from "react";
import { AuthContextShapeProps } from "../utils/types";

export const AuthContext = createContext<AuthContextShapeProps>({
  loading: true,
  isFirstLaunch: null,
  isLoggedIn: false,
  login: async () => {},
  logout: async () => {},
  finishOnboarding: async () => {},
});

export const useAuth = () => useContext(AuthContext);
