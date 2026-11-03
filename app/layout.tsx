import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
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

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MicDrop AI — Podcast Studio",
  description:
    "Turn a topic or document into an editable, multilingual, multi-speaker podcast with real Sarvam AI voices.",
  applicationName: "MicDrop AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="app-canvas min-h-screen font-sans antialiased">
        <StudioProvider>
          <Sidebar />
          <main className="min-h-screen pb-36 lg:pl-[236px]">{children}</main>
          <AudioPlayer />
          <Toast />
        </StudioProvider>
      </body>
    </html>
  );
}
