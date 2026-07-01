import TopBar from "@/app/components/navigation/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060818]/60">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
