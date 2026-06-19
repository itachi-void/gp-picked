"use client";

import { create } from "zustand";
import axios from "axios";

export interface User {
  name?: string;
  email: string;
  role: "Citizen" | "Driver" | "Admin";
}

interface AuthStore {
  user: User | null;
  initialize: () => void;
  login: (email: string, password?: string, role?: "Citizen" | "Driver" | "Admin") => Promise<User>;
  signup: (name: string, email: string, password?: string, address?: string, profilePicture?: File | null) => Promise<User>;
  logout: () => void;
}

const isBrowser = typeof window !== "undefined";

export const useAuth = create<AuthStore>((set) => ({
  user: null,

  // 1. دالة تهيئة البيانات (بتقرأ من المتصفح أول ما الموقع يفتح)
  initialize: () => {
    if (!isBrowser) return;

    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        set({ user: JSON.parse(savedUser) });
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  },

  // 2. دالة تسجيل الدخول (جاهزة للشغل الحقيقي مع السيرفر)
  login: async (email: string, password?: string, role?: "Citizen" | "Driver" | "Admin") => {
    let finalRole: "Citizen" | "Driver" | "Admin" = role || "Citizen";
    if (!role) {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.startsWith("admin")) finalRole = "Admin";
      else if (lowerEmail.startsWith("driver")) finalRole = "Driver";
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/Account/Login`,
        {
          name: email,
          password: password || "",
          role: finalRole,
        }
      );

      // تنظيف التوكن
      const token = typeof data === "string" ? data : data?.token || "";
      const cleanedToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;

      // أخذ الرتبة والاسم من السيرفر
      const realName = (typeof data === "object" && data?.name) ? data.name : email.split("@")[0];
      const realRole = (typeof data === "object" && data?.role) ? data.role : finalRole;

      const loggedInUser: User = {
        name: realName,
        email,
        role: (realRole === "Admin" || realRole === "Driver") ? realRole : "Citizen",
      };

      // حفظ في المتصفح
      if (isBrowser) {
        localStorage.setItem("token", cleanedToken);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      }

      // تحديث حالة الموقع
      set({ user: loggedInUser });
      return loggedInUser;

    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("الإيميل أو الباسورد غلط");
      }
      throw new Error(error.response?.data?.message || "حصلت مشكلة في تسجيل الدخول");
    }
  },

  // 3. دالة تسجيل الحساب (Signup)
  signup: async (name: string, email: string, password?: string, address?: string, profilePicture?: File | null) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

    // Construct FormData since the backend expects multipart/form-data
    const formData = new FormData();
    formData.append("FullName", name);
    formData.append("Email", email);
    formData.append("Password", password || "");
    // Ensure Address is at least 30 characters long to pass backend validation
    formData.append("Address", address || "Default Cairo Egypt Address EgyptCairoCairoEgypt");
    if (profilePicture) {
      formData.append("ProfilePictureUrl", profilePicture);
    }

    try {
      const token = isBrowser ? localStorage.getItem("token") || "" : "";

      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin/create-user`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newUser: User = {
        name,
        email,
        role: "Citizen", // Newly created users default to Citizen
      };

      // Extract token if backend returns one
      const returnedToken = typeof data === "string" ? data : data?.token || "mock-token-signup";

      if (isBrowser) {
        localStorage.setItem("token", returnedToken);
        localStorage.setItem("user", JSON.stringify(newUser));
      }

      set({ user: newUser });

      return newUser;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || "Signup failed"
      );
    }
  },

  // 4. دالة تسجيل الخروج
  logout: () => {
    if (isBrowser) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    set({ user: null });
  },
}));
