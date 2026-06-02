import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body className="h-full overflow-hidden bg-[#060918] text-[#e8ecf4]">
        {children}
      </body>
    </html>
  );
}
