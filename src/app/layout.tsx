import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import FloatingActions from "@/components/FloatingActions";
import OnboardingTour from "@/components/OnboardingTour";

// Use standard system font variables to avoid build-time Google Font network request failures
const geistSans = {
  variable: "--font-geist-sans",
};

const geistMono = {
  variable: "--font-geist-mono",
};

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
        <script
          dangerouslySetInnerHTML={{
            __html: `console.log("[EXEC_TRACE] A = website JavaScript starts at " + performance.now().toFixed(1) + "ms");`,
          }}
        />
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
      <body className="h-full bg-[#060918] text-[#e8ecf4]">
        <Script src="/cesium/Cesium.js" strategy="beforeInteractive" />
        {children}
        <FloatingActions />
        <OnboardingTour />
      </body>
    </html>
  );
}
