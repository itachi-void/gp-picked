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
    profilePicture?: File | null;
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://smartwaste.runasp.net";


export const useAuth = create<AuthStore>((set, get) => ({
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
        throw new Error("Incorrect email or password");
      }
      throw new Error(error.response?.data?.message || "An error occurred during login");
    }
  },

  // إنشاء حساب جديد
  signup: async (signupData) => {
    try {
      const formData = new FormData();
      formData.append("FullName", signupData.fullName);
      formData.append("Email", signupData.email);
      formData.append("PasswordHash", signupData.passwordHash);
      formData.append("Address", signupData.address);
      formData.append("Role", signupData.role);
      if (signupData.phone) {
        formData.append("Phone", signupData.phone);
      }
      if (signupData.profilePicture) {
        formData.append("ProfilePictureUrl", signupData.profilePicture);
      }

      await axios.post(
        `${API_BASE_URL}/api/Account/Register`,
        formData
      );

      // تسجيل الدخول التلقائي بعد التسجيل بنجاح للحصول على التوكن الصحيح وبيانات المستخدم
      const loggedInUser = await get().login(
        signupData.email,
        signupData.passwordHash,
        signupData.role
      );

      return loggedInUser;
    } catch (error: any) {
      const errorMsg = typeof error.response?.data === 'string'
        ? error.response.data
        : (error.response?.data?.message || error.message || "Signup failed");
      throw new Error(errorMsg);
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