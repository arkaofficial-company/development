import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arcadiamond Lab Connect",
  description: "実験データ管理・自動分析システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.className} min-h-screen flex bg-[#f0f4f8] text-slate-900 relative overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* ── Floating animated blobs (background) ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-blue-300/40 animate-blob blur-[120px]" />
          <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-300/30 animate-blob-slow delay-2s blur-[120px]" />
          <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-emerald-200/25 animate-blob delay-4s blur-[140px]" />
          <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-200/20 animate-blob-slow delay-6s blur-[100px]" />
        </div>

        <Sidebar />

        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          <Header />
          <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto pb-20">
            {children}
          </main>
        </div>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
