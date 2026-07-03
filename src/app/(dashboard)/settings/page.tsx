"use client";

import { useRef, useState } from "react";
import "@/app/components/motion/motion-components.css";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Phone,
  MapPin,
  Upload,
  Save,
  RefreshCw,
  Lock,
  Download,
  Trash2,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useAuth } from "@/store/authStore";
import { useNotifications } from "@/app/contexts/NotificationContext";
import { exportToCsv } from "@/app/utils/exportCsv";
import { GlassCard } from "@/app/components/GlassCard";
import { accentMap } from "@/app/utils/accent";
import api from "@/lib/axios";

type Tab = "profile" | "notifications" | "security" | "appearance" | "data";

interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function SettingsPage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useLocalStorage<ProfileSettings>("ecovoid_settings_profile", {
    name: user?.name ?? "Admin User",
    email: user?.email ?? "admin@ecovoid.io",
    phone: "-",
    location: "-",
  });
  const [notifications, setNotifications] = useLocalStorage<NotificationSettings>(
    "ecovoid_settings_notifications",
    { email: true, push: true, sms: false }
  );
  const [avatar, setAvatar] = useLocalStorage<string>("ecovoid.settings.avatar", "");
  const fileRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview first
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Call API
    const userId = user?.id || 1;
    const formData = new FormData();
    formData.append("ProfilePicture", file);

    try {
      await api.put(`/User/UpdateProfilePicture/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile picture updated successfully");
      addNotification({
        title: "Profile photo updated",
        body: "Your profile picture was changed.",
        severity: "success",
        icon: "User",
        link: "/settings",
      });
    } catch (err: any) {
      console.error("Failed to upload profile picture:", err);
      toast.error(err.response?.data?.message || "Failed to upload photo");
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error("User session not found");
      return;
    }
    const userId = user.id || 1;
    const isRecycler = String(user.role).toLowerCase() === "driver" || String(user.role).toLowerCase() === "recycler";

    try {
      if (isRecycler) {
        const payload = {
          fullName: profile.name,
          phone: profile.phone.replace(/\s+/g, ""),
          vehicleInfo: "Truck ID 1", // Vehicle info fallback
        };
        await api.put(`/Recycler/update/${userId}`, payload);
      } else {
        const payload = {
          id: userId,
          fullName: profile.name,
          address: profile.location.length >= 30 ? profile.location : profile.location.padEnd(30, " "),
        };
        await api.put(`/User/UpdateUser/${userId}`, payload);
      }
      
      // Save local storage
      setProfile(profile);

      toast.success("Profile updated successfully");
      addNotification({
        title: "Profile updated",
        body: "Your profile details were updated.",
        severity: "success",
        icon: "User",
        link: "/settings",
      });
    } catch (err: any) {
      console.error("Failed to update profile details:", err);
      toast.error(err.response?.data?.message || "Failed to update profile details");
    }
  };

  const handleUpdatePassword = () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password updated");
    addNotification({
      title: "Password updated",
      body: "Your account password was changed.",
      severity: "success",
      icon: "Shield",
      link: "/settings",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDownloadData = () => {
    const row = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      emailNotifications: notifications.email,
      pushNotifications: notifications.push,
      smsNotifications: notifications.sms,
      avatarUploaded: !!avatar,
    };
    exportToCsv("ecovoid-user-data", [row], [
      { key: "name", label: "Name", accessor: (r) => r.name },
      { key: "email", label: "Email", accessor: (r) => r.email },
      { key: "phone", label: "Phone", accessor: (r) => r.phone },
      { key: "location", label: "Location", accessor: (r) => r.location },
      { key: "emailNotifications", label: "Email Notifications", accessor: (r) => r.emailNotifications },
      { key: "pushNotifications", label: "Push Notifications", accessor: (r) => r.pushNotifications },
      { key: "smsNotifications", label: "SMS Notifications", accessor: (r) => r.smsNotifications },
      { key: "avatarUploaded", label: "Avatar Uploaded", accessor: (r) => r.avatarUploaded },
    ]);
    toast.success("Data exported");
  };

  const tabs: { id: Tab; name: string; icon: any; accent: string }[] = [
    { id: "profile", name: "Profile", icon: User, accent: "emerald" },
    { id: "notifications", name: "Notifications", icon: Bell, accent: "sky" },
    { id: "security", name: "Security", icon: Shield, accent: "rose" },
    { id: "appearance", name: "Appearance", icon: Palette, accent: "violet" },
    { id: "data", name: "Data", icon: Database, accent: "amber" },
  ];

  const inputClass =
    "w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 dark:focus:ring-emerald-400/70";

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold" style={{ fontWeight: 700 }}>
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage your preferences and account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <GlassCard className="p-3 h-fit">
          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const a = accentMap[tab.accent];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all text-sm cursor-pointer ${
                    isActive
                      ? `${a?.bg} ${a?.fg}`
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                  style={{ fontWeight: isActive ? 600 : 500 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          {activeTab === "profile" && (
            <div className="mc-fade-in space-y-6">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Profile Information
              </h2>

              <div className="flex items-center gap-4">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                ) : (
                  <div
                    className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"
                    style={{ fontWeight: 600 }}
                  >
                    {(profile?.name?.[0] ?? "A").toUpperCase()}
                  </div>
                )}
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Change Photo
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 600 }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile?.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1"
                    style={{ fontWeight: 600 }}
                  >
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1"
                    style={{ fontWeight: 600 }}
                  >
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={profile?.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1"
                    style={{ fontWeight: 600 }}
                  >
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <input
                    type="text"
                    value={profile?.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  onClick={() => {
                    setProfile({
                      name: user?.name ?? "Admin User",
                      email: user?.email ?? "admin@ecovoid.io",
                      phone: "-",
                      location: "-",
                    });
                    toast.info("Reset to defaults");
                  }}
                  className="flex items-center gap-2 px-5 h-10 bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-full text-sm hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Notification Preferences
              </h2>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "sms", label: "SMS Notifications", desc: "Text message notifications" },
              ].map((item) => {
                const enabled = notifications[item.key as keyof NotificationSettings];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl"
                  >
                    <div>
                      <h4 className="text-slate-900 dark:text-white text-sm" style={{ fontWeight: 600 }}>
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = { ...notifications, [item.key]: !enabled };
                        setNotifications(next);
                        toast.success(`${item.label} ${!enabled ? "enabled" : "disabled"}`);
                      }}
                      className={`w-12 h-7 rounded-full transition-all cursor-pointer ${
                        enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                          enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "security" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Security Settings
              </h2>
              <div>
                <label
                  className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1"
                  style={{ fontWeight: 600 }}
                >
                  <Lock className="w-3 h-3" /> Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 600 }}>
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 600 }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleUpdatePassword}
                className="flex items-center gap-2 px-5 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-full text-sm transition-colors cursor-pointer"
              >
                <Shield className="w-4 h-4" /> Update Password
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Appearance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose the theme that suits you.</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", Icon: Sun },
                  { id: "dark", label: "Dark", Icon: Moon },
                  { id: "system", label: "System", Icon: Monitor },
                ].map(({ id, label, Icon }) => {
                  const isSelected = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setTheme(id);
                        toast.success(`Theme: ${label}`);
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all text-center cursor-pointer ${
                        isSelected
                          ? "bg-violet-500/10 border-violet-500/40"
                          : "bg-slate-50 dark:bg-white/5 border-transparent hover:border-violet-300/40"
                      }`}
                    >
                      <Icon className="w-7 h-7 text-violet-600 dark:text-violet-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                        {label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Data & Privacy
              </h2>
              <button
                onClick={handleDownloadData}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500/10 rounded-2xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                      Download Data
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Get a copy of your data</p>
                  </div>
                </div>
              </button>

              {user?.role?.toLowerCase() === "admin" && (
                <button
                  onClick={() => toast.error("Account deletion needs admin approval")}
                  className="w-full flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm text-rose-600 dark:text-rose-400" style={{ fontWeight: 600 }}>
                        Delete Account
                      </h4>
                      <p className="text-xs text-rose-500/80 mt-0.5">Permanently delete this account</p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
