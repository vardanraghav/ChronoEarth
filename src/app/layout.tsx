import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChronoEarth — Explore Earth 2050",
  description:
    "A futuristic visualization of Earth in 2050. Explore global climate data, biodiversity, clean energy, and satellite networks through an immersive sci-fi interface.",
  keywords: [
    "Earth 2050",
    "climate visualization",
    "futuristic",
    "global data",
    "3D Earth",
  ],
  openGraph: {
    title: "ChronoEarth — Explore Earth 2050",
    description:
      "Immersive futuristic visualization of Earth's climate, technology, and biodiversity by 2050.",
    type: "website",
  },
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
    >
      <head>
        <link rel="stylesheet" href="/cesium/Widgets/widgets.css" />
        <style>{`
          nextjs-portal {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
      </head>
      <body className="h-full overflow-hidden bg-[#02060B] text-[#e8ecf4]">
        <Script src="/cesium/Cesium.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}

