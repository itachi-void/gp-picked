import TopBar from "@/app/components/navigation/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Light mode background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 dark:opacity-0 opacity-100 -z-10"
        style={{ backgroundImage: "url('/dashboard-bg-light.jpg')" }}
      />
      {/* Dark mode background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 dark:opacity-100 opacity-0 -z-10"
        style={{ backgroundImage: "url('/dashboard-bg-dark.jpg')" }}
      />
      {/* Overlay for readability */}
      <div className="fixed inset-0 bg-white/40 dark:bg-black/50 -z-10 transition-colors duration-500" />
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
