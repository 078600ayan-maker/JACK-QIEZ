import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Jack Quiz: Royal 3D Study Ecosystem | JAC Class 10",
  description: "Ultra-premium, lag-free 60fps Royal Obsidian 3D study ecosystem for JAC Class 10 scholars",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jack Quiz"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#090D16",
  viewportFit: "cover"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${notoSansDevanagari.variable} dark`}
    >
      <body className="bg-[#090D16] text-white min-h-[100dvh] antialiased selection:bg-[#F59E0B] selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
