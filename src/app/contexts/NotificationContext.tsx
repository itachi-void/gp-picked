"use client";

import React, { createContext, useContext } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  severity: "info" | "warning" | "success";
  icon: string;
  link: string;
}

interface NotificationContextValue {
  addNotification: (n: { title: string; body: string; severity?: "info" | "warning" | "success"; icon?: string; link?: string }) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const addNotification = (n: { title: string; body: string; severity?: "info" | "warning" | "success"; icon?: string; link?: string }) => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("dashboard_notifications");
    let list: NotificationItem[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored);
      } catch (e) {
        list = [];
      }
    }
    const newNote: NotificationItem = {
      id: Date.now().toString(),
      title: n.title,
      desc: n.body,
      time: "Just now",
      read: false,
      severity: n.severity || "info",
      icon: n.icon || "Bell",
      link: n.link || "#",
    };
    list.unshift(newNote);
    localStorage.setItem("dashboard_notifications", JSON.stringify(list));
    window.dispatchEvent(new Event("notifications_updated"));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      addNotification: (n: { title: string; body: string; severity?: "info" | "warning" | "success"; icon?: string; link?: string }) => {
        if (typeof window === "undefined") return;
        const stored = localStorage.getItem("dashboard_notifications");
        let list: NotificationItem[] = [];
        if (stored) {
          try {
            list = JSON.parse(stored);
          } catch (e) {
            list = [];
          }
        }
        const newNote: NotificationItem = {
          id: Date.now().toString(),
          title: n.title,
          desc: n.body,
          time: "Just now",
          read: false,
          severity: n.severity || "info",
          icon: n.icon || "Bell",
          link: n.link || "#",
        };
        list.unshift(newNote);
        localStorage.setItem("dashboard_notifications", JSON.stringify(list));
        window.dispatchEvent(new Event("notifications_updated"));
      }
    };
  }
  return ctx;
}
