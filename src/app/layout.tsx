import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AosInitializer from "@/components/AosInitializer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EcoSnap - Smart Systems",
  description: "EcoSnap - Recycle today, save tomorrow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AosInitializer />
            <Providers>
              {children}
            </Providers>
            <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}


