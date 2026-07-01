"use client";

import { create } from "zustand";
import axios from "axios";

export interface User {
  id?: number;
  name?: string;
  email: string;
  role: "User" | "Driver" | "Admin" | "Recycler" | "Employee" | string;
}

export type Role = "User" | "Driver" | "Admin" | "Recycler" | "Employee";

interface AuthStore {
  user: User | null;
  selectedRole: Role;
  setSelectedRole: (role: Role) => void;
  demoLoginTrigger: { username: string; password: string; role: Role } | null;
  login: (email: string, password?: string, role?: Role) => Promise<User>;
  signup: (signupData: {
    fullName: string;
    email: string;
    passwordHash: string;
    address: string;
    role: Role;
    phone?: string | null;
  }) => Promise<User>;
  logout: () => void;
}

const normalizeRole = (role: string): "User" | "Driver" | "Admin" | "Recycler" | "Employee" | string => {
  const r = String(role || "").toLowerCase().trim();
  if (r === "admin") return "Admin";
  if (r === "driver" || r === "recycler") return "Driver"; // Recycler is Driver in backend
  if (r === "employee" || r === "hubstaff") return "Employee";
  return "User";
};

const isBrowser = typeof window !== "undefined";

const getInitialUser = (): User | null => {
  if (!isBrowser) return null;
  const savedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  if (savedUser && token) {
    try {
      return JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
  return null;
};

// ========== الرابط الأساسي للـ API ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const useAuth = create<AuthStore>((set) => ({
  user: getInitialUser(),
  selectedRole: "User",
  setSelectedRole: (role) => set({ selectedRole: role }),
  demoLoginTrigger: null,

  // تسجيل الدخول
  login: async (email, password, role) => {
    let finalRole: Role = role || "User";
    if (!role) {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.startsWith("admin")) finalRole = "Admin";
      else if (lowerEmail.startsWith("driver")) finalRole = "Driver";
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/Account/Login`,
        {
          name: email,
          password: password || "",
          role: finalRole,
        },
        {
          headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const token = data.token || "";
      const realRole = data.role || finalRole;
      const realName = data.user || email.split("@")[0];
      const userId = data.userId || 0;

      const loggedInUser: User = {
        id: userId,
        name: realName,
        email,
        role: normalizeRole(realRole),
      };

      if (isBrowser) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      }

      set({ user: loggedInUser });
      return loggedInUser;

    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("الإيميل أو الباسورد غلط");
      }
      throw new Error(error.response?.data?.message || "حصلت مشكلة في تسجيل الدخول");
    }
  },

  // إنشاء حساب جديد
  signup: async (signupData) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/Account/Register`,
        {
          fullName: signupData.fullName,
          email: signupData.email,
          passwordHash: signupData.passwordHash,
          address: signupData.address,
          role: signupData.role,
          phone: signupData.phone || null,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const userId = data.userId || data.id || 0;

      const newUser: User = {
        id: userId,
        name: signupData.fullName,
        email: signupData.email,
        role: normalizeRole(data.role || signupData.role),
      };

      const returnedToken = data.token || data || "";

      if (isBrowser) {
        localStorage.setItem("token", returnedToken);
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      set({ user: newUser });
      return newUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Signup failed");
    }
  },

  // تسجيل الخروج
  logout: () => {
    if (isBrowser) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    set({ user: null });
  },
}));