import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StudioProvider } from "@/components/studio-provider";
import { Sidebar } from "@/components/shell/sidebar";
import { AudioPlayer } from "@/components/shell/audio-player";
import { Toast } from "@/components/shell/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MicDrop AI — Podcast Studio",
  description:
    "Turn a topic or document into an elegant, multilingual, multi-speaker podcast with real Sarvam AI voices.",
  applicationName: "MicDrop AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <StudioProvider>
          <Sidebar />
          <main className="min-h-screen lg:pl-72">{children}</main>
          <AudioPlayer />
          <Toast />
        </StudioProvider>
      </body>
    </html>
  );
}
