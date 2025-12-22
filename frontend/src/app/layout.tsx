import type { Metadata } from "next";
import "./globals.css";
import FutureNavbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Valorant Tactical Hub | Maps, Agents & Weapons Explorer",
  description: "Explore all Valorant maps, agents, and weapons with real-time data from the official API. Your ultimate esports companion for tactical insights.",
  keywords: ["Valorant", "Maps", "Agents", "Weapons", "Explorer", "Esports", "Gaming", "API", "Tactical"],
  authors: [{ name: "Valorant Tactical Hub" }],
  openGraph: {
    title: "Valorant Tactical Hub | Live API Dashboard",
    description: "Explore Valorant maps, agents, and weapons with real-time data",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="app-background" aria-hidden="true" />
        <div className="metallic-surface" aria-hidden="true" />
        <div className="grid-overlay" aria-hidden="true" />

        <FutureNavbar />

        {children}
      </body>
    </html>
  );
}
