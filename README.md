# ChronoEarth

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-00A2FF?style=for-the-badge&logo=cesium&logoColor=white)](https://cesium.com/platform/cesiumjs/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

ChronoEarth is a futuristic planetary intelligence platform combining:

* Interactive Earth visualization
* Cyber 2050 Digital Twin
* Future city intelligence
* Predictions engine
* Knowledge base
* Futurologist network
* Community feedback system
* AI-generated future reports

---

## Features

### Earth Visualization

* **Realistic Earth Mode**: High-fidelity rendering of Earth with customizable dynamic layers (climate, energy, satellite, pollution) and atmospheric effects.
* **Cyber 2050 Mode**: Holographic digital twin visual overlays showing telemetry grids, active orbital communication networks, and city nodes.
* **Dynamic Atmosphere**: Realistic lighting and atmospheric scattering based on camera altitude and rotation.
* **Orbital Infrastructure**: Simulated satellite nodes and orbital corridors that visualize communications and monitoring telemetry.
* **Geodesic Data Highways**: Animated telemetry beams and pathways connecting critical geopolitical nodes.
* **Interactive City Nodes**: Clickable blinking markers for major global cities with visual focus-tracking and camera flight transitions.

### Future Intelligence Platform

* **Predictions Feed**: Chronological list of global technological, environmental, and societal milestones with upvoting, categorization, and bookmarking.
* **Knowledge Base**: Deep wiki documentation on pioneering concepts (e.g., Quantum Grids, Rejuvenation Clinics, Carbon Tariffs) with impact assessments.
* **Search Engine**: Omni-search tool to quickly find and navigate directly to predictions, futurologists, and city intelligence hubs.
* **AI Reports**: Instant generated briefs on the trajectory of global technologies and ecological states.
* **City Intelligence Pages**: Rich dynamic dossiers for major cities showing projections across multiple decades.
* **Community Voting**: Distributed upvoting mechanics representing public consensus on prediction feasibility.
* **Bookmark System**: Ability to bookmark critical predictions and articles to a saved library.

### City Intelligence

* **Dynamic City Routes**: Dedicated URL slugs for major global hubs with specialized local styling and thematic data.
* **Future Forecasts**: Real-time projection updates when switching years between 2030, 2040, and 2050.
* **Climate Metrics**: Specific metrics including climate resilience, carbon index, and water risk forecasts.
* **Population Projections**: Decadal growth and stabilization charts visualizing population trends.
* **AI Readiness Indicators**: Analytical graphs showing AI adoption, job automation risk, and compute access scores.
* **Infrastructure Analytics**: Detailed reporting on clean energy generation mix and urban transport automation.

### Community

* **Feedback Portal**: Interactive governance channel allowing bug reports, feature ideas, prediction ideas, and general comments.
* **Voting System**: Governance upvotes on features requested by the community.
* **Saved Intelligence**: Personal telemetry page to view bookmarked predictions.
* **Future Submissions**: Form interface to submit user predictions directly to the global database.

---

## Platform Pages

All platform routes are functional:

* `/` — The primary mission control center containing the interactive Earth visualization and Cyber HUD.
* `/feed` — Real-time stream of predictions, environmental alerts, and orbital telemetry updates.
* `/predictions` — Organized predictions directory grouped by category (AI, Climate, Energy, Space, Transport, etc.).
* `/predictions/[slug]` — Individual projection briefs with comprehensive policy analysis and comments sections.
* `/knowledge` — The Chrono Knowledge Base documenting technologies, careers, and systems of 2050.
* `/futurologists` — Directory profile cards listing the lead forecasters and their planetary influence scores.
* `/futurologists/[slug]` — Complete portfolios, articles, and authored predictions of individual futurologists.
* `/city/[slug]` — Dynamic intelligence pages for London, Delhi, Dubai, Singapore, Tokyo, and New York.
* `/feedback` — Platform governance portal with forms and a public feature-request voting board.
* `/about` — Structural overview of the ChronoEarth initiative, telemetry partners, and planetary simulation layers.

---

## Technology Stack

**Frontend:**
* Next.js (App Router)
* TypeScript
* React

**Visualization:**
* CesiumJS

**Deployment:**
* Vercel

---

## Screenshots

Below are actual views of the ChronoEarth interface:

### Home Page
![Home Page](./public/screenshots/home.png)

### Cyber 2050 Mode
![Cyber 2050 Mode](./public/screenshots/cyber_mode.png)

### City Intelligence Page
![City Intelligence Page](./public/screenshots/city_page.png)

### Predictions Page
![Predictions Page](./public/screenshots/predictions_page.png)

### Feedback Page
![Feedback Page](./public/screenshots/feedback_page.png)

---

## Installation

To run ChronoEarth locally, clone the repository and install its dependencies:

```bash
git clone https://github.com/varda/ChronoEarth.git
cd ChronoEarth/chronoearth
npm install
```

Start the Next.js development server:

```bash
npm run dev
```

---

## Build

Compile and build the production-ready Next.js application:

```bash
npm run build
```

---

## Deployment

Deploy the application to Vercel production:

```bash
# Set up Vercel project configuration and deploy
vercel --prod
```

---

## Roadmap

Future enhancement milestones:

* **Real AI Forecasting**: Integration with live climate modeling LLMs for predictive reporting.
* **Global Climate Simulations**: Interactive sandbox controls on the Cesium globe to trigger simulation scenarios.
* **User Accounts**: Decentralized digital citizen profiles for saving telemetry bookmarks and tracking foresight rep.
* **Collaboration Tools**: Multi-user rooms for futurologists to model urban developments concurrently.
* **Scenario Modeling**: Visualizing branch futures based on varying levels of carbon tax policies.
