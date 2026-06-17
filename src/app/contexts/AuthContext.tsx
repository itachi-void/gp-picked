"use client";

import React, { createContext, useContext } from "react";

export interface User {
  name?: string;
  email: string;
  role: "Citizen" | "Driver" | "Admin";
}

interface AuthContextType {
  login: (email: string, password?: string) => Promise<User>;
  signup: (name: string, email: string, password?: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const login = async (email: string, password?: string): Promise<User> => {
    let role: "Citizen" | "Driver" | "Admin" = "Citizen";
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.startsWith("admin")) role = "Admin";
    else if (lowerEmail.startsWith("driver")) role = "Driver";
    return { email, role };
  };

  const signup = async (name: string, email: string, password?: string): Promise<User> => {
    return { name, email, role: "Citizen" };
  };

  return (
    <AuthContext.Provider value={{ login, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback safe functions in case not wrapped in Provider yet
    return {
      login: async (email: string, password?: string): Promise<User> => {
        let role: "Citizen" | "Driver" | "Admin" = "Citizen";
        const lowerEmail = email.toLowerCase();
        if (lowerEmail.startsWith("admin")) role = "Admin";
        else if (lowerEmail.startsWith("driver")) role = "Driver";
        return { email, role };
      },
      signup: async (name: string, email: string, password?: string): Promise<User> => {
        return { name, email, role: "Citizen" };
      }
    };
  }
  return context;
}
