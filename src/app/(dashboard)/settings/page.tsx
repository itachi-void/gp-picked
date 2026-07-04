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
  MapPin,
  Upload,
  Save,
  Lock,
  Download,
  Trash2,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Monitor,
  Loader2,
  UserPlus,
  AlertCircle,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Tab = "profile" | "notifications" | "security" | "appearance" | "data";

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface UserDetails {
  userId: number;
  fullName: string;
  email: string;
  walletPoints?: number | null;
  phone?: string | null;
  address?: string | null;
  profilePictureUrl?: string | null;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
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
  const [savingPassword, setSavingPassword] = useState(false);

  const role = String(user?.role ?? "").toLowerCase();
  const isAdmin = role === "admin";
  const isDriver = role === "driver" || role === "recycler";
  const userId = user?.id ?? 0;

  // ── Profile from API ──────────────────────────────────────────────────────
  const { data: apiProfile, isLoading: profileLoading } = useQuery<UserDetails>({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await api.get<UserDetails>(`/User/GetUserByIdWithDetails/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Local edit state (only editable fields)
  const [editName, setEditName] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");

  // Initialise edit fields when data arrives (only once)
  const [initialised, setInitialised] = useState(false);
  if (apiProfile && !initialised) {
    setEditName(apiProfile.fullName ?? "");
    setEditAddress(apiProfile.address ?? "");
    setInitialised(true);
  }

  // ── Admin create-user form ────────────────────────────────────────────────
  const emptyCreate = {
    fullName: "", email: "", password: "", address: "", phone: "", role: "User",
  };
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [showCreate, setShowCreate] = useState(false);

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const fd = new FormData();
      fd.append("ProfilePicture", file);
      await api.put(`/User/UpdateProfilePicture/${userId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile picture updated");
      addNotification({
        title: "Profile photo updated",
        body: "Your profile picture was changed.",
        severity: "success",
        icon: "User",
        link: "/settings",
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload photo");
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (isDriver) {
        await api.put(`/Recycler/update/${userId}`, {
          fullName: editName,
          phone: "",        // phone update not in User schema; recycler has phone field
          vehicleInfo: "Truck",
        });
      } else {
        const paddedAddress = editAddress.length < 30
          ? editAddress.padEnd(30, " ")
          : editAddress;
        await api.put(`/User/UpdateUser/${userId}`, {
          id: userId,
          fullName: editName,
          address: paddedAddress,
        });
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      addNotification({
        title: "Profile updated",
        body: "Your profile details were saved.",
        severity: "success",
        icon: "User",
        link: "/settings",
      });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  // ── Update password ───────────────────────────────────────────────────────
  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setSavingPassword(true);
    try {
      const paddedAddress = (apiProfile?.address ?? "").length < 30
        ? (apiProfile?.address ?? "").padEnd(30, " ")
        : (apiProfile?.address ?? "");
      await api.put(`/User/UpdateUser/${userId}`, {
        id: userId,
        fullName: apiProfile?.fullName ?? editName,
        address: paddedAddress,
        passwordHash: newPassword,
        confirmPassword,
      });
      toast.success("Password updated");
      addNotification({
        title: "Password updated",
        body: "Your account password was changed.",
        severity: "success",
        icon: "Shield",
        link: "/settings",
      });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Download data ─────────────────────────────────────────────────────────
  const handleDownloadData = () => {
    const row = {
      name: apiProfile?.fullName ?? user?.name ?? "",
      email: apiProfile?.email ?? user?.email ?? "",
      phone: apiProfile?.phone ?? "Not yet from api",
      address: apiProfile?.address ?? "Not yet from api",
      walletPoints: apiProfile?.walletPoints ?? 0,
      emailNotifications: notifications.email,
      pushNotifications: notifications.push,
      smsNotifications: notifications.sms,
      avatarUploaded: !!avatar,
    };
    exportToCsv("ecovoid-user-data", [row], [
      { key: "name", label: "Name", accessor: (r: any) => r.name },
      { key: "email", label: "Email", accessor: (r: any) => r.email },
      { key: "phone", label: "Phone", accessor: (r: any) => r.phone },
      { key: "address", label: "Address", accessor: (r: any) => r.address },
      { key: "walletPoints", label: "Wallet Points", accessor: (r: any) => r.walletPoints },
      { key: "emailNotifications", label: "Email Notifications", accessor: (r: any) => r.emailNotifications },
      { key: "pushNotifications", label: "Push Notifications", accessor: (r: any) => r.pushNotifications },
      { key: "smsNotifications", label: "SMS Notifications", accessor: (r: any) => r.smsNotifications },
      { key: "avatarUploaded", label: "Avatar Uploaded", accessor: (r: any) => r.avatarUploaded },
    ]);
    toast.success("Data exported");
  };

  // ── Admin: create user ────────────────────────────────────────────────────
  const createUserMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("FullName", createForm.fullName);
      fd.append("Email", createForm.email);
      fd.append("Password", createForm.password);
      fd.append("Address", createForm.address.length < 30
        ? createForm.address.padEnd(30, " ")
        : createForm.address);
      fd.append("Phone", createForm.phone);
      await api.post("/admin/create-user", fd);
    },
    onSuccess: () => {
      toast.success("User created successfully");
      setCreateForm(emptyCreate);
      setShowCreate(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create user");
    },
  });

  // ── Admin: delete account ─────────────────────────────────────────────────
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/admin/delete-user", { params: { userId } });
    },
    onSuccess: () => {
      toast.success("Account deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete account");
    },
  });

  const tabs: { id: Tab; name: string; icon: any; accent: string }[] = [
    { id: "profile", name: "Profile", icon: User, accent: "emerald" },
    { id: "notifications", name: "Notifications", icon: Bell, accent: "sky" },
    { id: "security", name: "Security", icon: Shield, accent: "rose" },
    { id: "appearance", name: "Appearance", icon: Palette, accent: "violet" },
    { id: "data", name: "Data", icon: Database, accent: "amber" },
  ];

  const inputClass =
    "w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 dark:focus:ring-emerald-400/70";

  const readonlyClass =
    "w-full px-4 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed";

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-6">
      <div className="mc-fade-in-down flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
          <SettingsIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl tracking-tight text-slate-900 dark:text-white font-bold">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your preferences and account
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar tabs */}
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

        {/* Content */}
        <GlassCard className="p-6">

          {/* ──── PROFILE TAB ──── */}
          {activeTab === "profile" && (
            <div className="mc-fade-in space-y-6">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Profile Information
              </h2>

              {profileLoading ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading profile from API…
                </div>
              ) : (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                    ) : apiProfile?.profilePictureUrl ? (
                      <img src={apiProfile.profilePictureUrl} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                    ) : (
                      <div
                        className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg"
                        style={{ fontWeight: 600 }}
                      >
                        {(apiProfile?.fullName?.[0] ?? user?.name?.[0] ?? "A").toUpperCase()}
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
                    {/* Full Name – editable */}
                    <div>
                      <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 600 }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {/* Email – read-only from API */}
                    <div>
                      <label className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                        <Mail className="w-3 h-3" /> Email
                        <span className="text-xs text-slate-400 font-normal">(read-only)</span>
                      </label>
                      <input
                        type="email"
                        value={apiProfile?.email ?? user?.email ?? ""}
                        readOnly
                        className={readonlyClass}
                      />
                    </div>

                    {/* Address – editable (not for drivers) */}
                    {!isDriver && (
                      <div className="md:col-span-2">
                        <label className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                          <MapPin className="w-3 h-3" /> Address
                          <span className="text-xs text-slate-400 font-normal">(min 30 chars required)</span>
                        </label>
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          placeholder="Enter your full address (at least 30 characters)…"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* Phone – read-only, not in UpdateUser schema */}
                    <div>
                      <label className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                        Phone
                        <span className="text-xs text-slate-400 font-normal">(not yet from api)</span>
                      </label>
                      <input
                        type="tel"
                        value={apiProfile?.phone ?? "Not yet from api"}
                        readOnly
                        className={readonlyClass}
                      />
                    </div>

                    {/* Wallet Points – read-only */}
                    <div>
                      <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1.5" style={{ fontWeight: 600 }}>
                        Wallet Points
                      </label>
                      <input
                        type="text"
                        value={
                          apiProfile?.walletPoints != null
                            ? `${apiProfile.walletPoints.toLocaleString()} pts`
                            : "Not yet from api"
                        }
                        readOnly
                        className={readonlyClass}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveProfileMutation.mutate()}
                      disabled={saveProfileMutation.isPending}
                      className="flex items-center gap-2 px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {saveProfileMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ──── NOTIFICATIONS TAB ──── */}
          {activeTab === "notifications" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Notification Preferences
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                These are local preferences only — not yet synced to the API.
              </p>
              {[
                { key: "email", label: "Email Notifications", desc: "Receive notifications via email" },
                { key: "push", label: "Push Notifications", desc: "Browser push notifications" },
                { key: "sms", label: "SMS Notifications", desc: "Text message notifications" },
              ].map((item) => {
                const enabled = notifications[item.key as keyof NotificationSettings];
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
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

          {/* ──── SECURITY TAB ──── */}
          {activeTab === "security" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Security Settings
              </h2>
              <p className="text-xs text-slate-400">
                Password is updated via <code className="bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300">PUT /User/UpdateUser</code>
              </p>
              <div>
                <label className="text-sm text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                  <Lock className="w-3 h-3" /> Current Password
                  <span className="text-xs text-slate-400 font-normal">(not yet validated by api)</span>
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
                  placeholder="Min 8 chars, upper/lower/digit/special"
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
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={handleUpdatePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 h-10 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Update Password
              </button>
            </div>
          )}

          {/* ──── APPEARANCE TAB ──── */}
          {activeTab === "appearance" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Appearance
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Choose the theme that suits you.</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", Icon: Sun },
                  { id: "dark",  label: "Dark",  Icon: Moon },
                  { id: "system", label: "System", Icon: Monitor },
                ].map(({ id, label, Icon }) => {
                  const isSelected = theme === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setTheme(id); toast.success(`Theme: ${label}`); }}
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

          {/* ──── DATA TAB ──── */}
          {activeTab === "data" && (
            <div className="mc-fade-in space-y-4">
              <h2 className="text-xl tracking-tight text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                Data & Privacy
              </h2>

              {/* Download data – available for all */}
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
                      Download My Data
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Export a CSV copy of your account data
                    </p>
                  </div>
                </div>
              </button>

              {/* ── Admin-only section ── */}
              {isAdmin && (
                <>
                  <hr className="border-slate-200 dark:border-white/10" />
                  <h3 className="text-sm text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    Admin Actions
                  </h3>

                  {/* Create User */}
                  <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm text-slate-900 dark:text-white" style={{ fontWeight: 600 }}>
                          Create New User
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          POST /admin/create-user
                        </p>
                      </div>
                    </div>
                  </button>

                  {showCreate && (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                      {[
                        { key: "fullName", label: "Full Name", type: "text" },
                        { key: "email", label: "Email", type: "email" },
                        { key: "password", label: "Password", type: "password" },
                        { key: "address", label: "Address (min 30 chars)", type: "text" },
                        { key: "phone", label: "Phone (01XXXXXXXXX)", type: "tel" },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                            {label}
                          </label>
                          <input
                            type={type}
                            value={(createForm as any)[key]}
                            onChange={(e) => setCreateForm({ ...createForm, [key]: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1 font-semibold">
                          Role
                        </label>
                        <select
                          value={createForm.role}
                          onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                          className="w-full px-4 h-10 rounded-full bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/20 text-sm text-slate-700 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="User">User / Citizen</option>
                          <option value="Driver">Driver / Recycler</option>
                          <option value="Employee">Employee (HubStaff)</option>
                        </select>
                      </div>
                      <button
                        onClick={() => createUserMutation.mutate()}
                        disabled={createUserMutation.isPending}
                        className="flex items-center gap-2 px-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {createUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        Create User
                      </button>
                    </div>
                  )}

                  {/* Delete Account */}
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this account? This cannot be undone.")) {
                        deleteAccountMutation.mutate();
                      }
                    }}
                    disabled={deleteAccountMutation.isPending}
                    className="w-full flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                        {deleteAccountMutation.isPending ? (
                          <Loader2 className="w-5 h-5 text-rose-600 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm text-rose-600 dark:text-rose-400" style={{ fontWeight: 600 }}>
                          Delete My Account
                        </h4>
                        <p className="text-xs text-rose-500/80 mt-0.5">
                          DELETE /admin/delete-user — admin only
                        </p>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
