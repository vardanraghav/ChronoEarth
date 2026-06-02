# ChronoEarth — Immersive Earth 2050 Exploration Website

ChronoEarth is a premium, highly responsive, futuristic sci-fi telemetry dashboard built with Next.js and Tailwind CSS v4. Inspired by the interactive mechanics of [2050.earth](https://2050.earth), it lets users explore predictions, environmental statistics, and technical monitoring telemetry for our planet across several decades leading up to 2050.

---

## 🌠 Visual & Interactive Highlights

- **Dynamic Planetary Digital Twin (HUD)**: A central rotating holographic orb representing Earth. Glow gradients and concentric ring speeds dynamically shift based on the chosen year and ecological category.
- **Unified Chrono-Telemetry**: Selecting different years (2025 – 2050) on the bottom slider immediately adjusts the global temperature, sea levels, and population statistics on the left panel, and updates the center telemetry read-out.
- **Holographic Projections Panel**: A central console that dynamically prints (with an animated telemetry typewriter effect) decade predictions depending on both the chosen year and the selected sector.
- **Responsive Layout**:
  - Desktop: Sidebar metrics on the left, interactive category selection on the right, digital twin in the center, and timeline at the bottom.
  - Mobile: Category buttons transform into a sleek horizontal-scrolling navigation header at the top, statistics adapt for viewport size, and the Earth orb scales gracefully.
- **Rich Futuristic Aesthetics**: Dark deep blue backgrounds (`#060918`), glowing neon cyan borders (`#00f0ff`), purple highlights (`#8b5cf6`), CSS-animated twinkling starfields, glowing aurora waves, and scanning grid overlays.

---

## 🛠️ Architecture & Components

All components are built using **React 19**, **Next.js 16 (App Router)**, and **Tailwind CSS v4** with CSS-in-JS properties for performance-optimized inline animations.

1. **[page.tsx](src/app/page.tsx)**: The main entry point (Client Component) that maintains the shared states (`activeYear`, `activeCategory`) and coordinates visual updates across child panels.
2. **[BackgroundEffects.tsx](src/components/BackgroundEffects.tsx)**: Implements the ambient atmosphere, generating random coordinate-based stars with individual twinkling loops, and moving background auroras.
3. **[Navbar.tsx](src/components/Navbar.tsx)**: Top status navigation bar with active pulsing indicators and custom underlines.
4. **[DataPanel.tsx](src/components/DataPanel.tsx)**: Displays planetary indices (Global Temp, Sea Level, Population) with custom arrow thresholds that dynamically recalculate depending on the timeline.
5. **[EarthPlaceholder.tsx](src/components/EarthPlaceholder.tsx)**: The planetary mockup orb. Implements concentric dashed orbit rings that spin faster during high-instability decades (e.g., 2025) and slow down as global stabilization is reached (e.g., 2050).
6. **[CategoryCards.tsx](src/components/CategoryCards.tsx)**: Displays options for *Ocean Monitoring*, *Biodiversity*, *Clean Energy*, and *Satellite Networks*, turning into a swipeable menu on mobile devices.
7. **[ProjectionPanel.tsx](src/components/ProjectionPanel.tsx)**: A high-tech details console featuring simulated typing feedback, status severity tags, and a glowing planetary stability bar.
8. **[Timeline.tsx](src/components/Timeline.tsx)**: Bottom interactive progress track with pulsing active rings and tooltips.

---

## 🚀 Getting Started

First, install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Build for production:
```bash
npm run build
```
