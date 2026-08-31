# ChronoEarth

ChronoEarth is an interactive platform for exploring how cities, technology, climate, infrastructure, and society could change in the future.

The project combines an interactive 3D Earth with a prediction feed, city intelligence pages, a knowledge base, and community-driven ideas about the future.

## Features

### Interactive Earth

- **3D Earth** with dynamic visual layers for climate, energy, satellites, and pollution.
- **Interactive city markers** that let users select cities and explore their information.
- **Atmospheric effects** and realistic Earth rendering using CesiumJS.
- **Satellite and orbital visualizations** for communication and monitoring infrastructure.
- **Animated routes and data paths** connecting important locations.
- **Multiple visualization modes** for switching between a lightweight feed experience and the full interactive map.

### Predictions

- Browse predictions related to AI, climate, energy, space, transport, and other areas.
- Open individual prediction pages with additional information and analysis.
- Upvote predictions and save interesting ones for later.
- Browse predictions through categories and search.

### City Intelligence

ChronoEarth includes dedicated pages for major cities such as:

- London
- Delhi
- Dubai
- Singapore
- Tokyo
- New York

Each city page can include:

- Future projections
- Climate and resilience metrics
- Carbon and water-risk indicators
- Population projections
- AI adoption and automation indicators
- Energy and transportation information
- Infrastructure-related data

### Knowledge Base

A collection of articles explaining technologies, systems, and ideas that could influence the future.

Topics include areas such as:

- Artificial Intelligence
- Climate technology
- Energy
- Urban infrastructure
- Space technology
- Emerging technologies

### Community

The platform also includes features for community participation:

- Submit future predictions
- Suggest new features
- Report issues
- Vote on community requests
- Save predictions and articles

### Search

A central search system helps users find:

- Predictions
- Cities
- Futurologists
- Knowledge articles
- Other platform content

## Pages

The main routes currently included in the platform are:

| Route | Description |
|---|---|
| `/` | Main ChronoEarth interface and Earth visualization |
| `/feed` | Feed containing predictions and platform updates |
| `/predictions` | Browse predictions by category |
| `/predictions/[slug]` | Individual prediction pages |
| `/knowledge` | Knowledge base |
| `/futurologists` | Futurologist directory |
| `/futurologists/[slug]` | Individual futurologist profiles |
| `/city/[slug]` | City intelligence pages |
| `/feedback` | Feedback and feature requests |
| `/about` | About ChronoEarth |

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript

**3D Visualization**
- CesiumJS
- HTML5 Canvas

**Styling**
- CSS
- Tailwind CSS

**Deployment**
- Vercel

## Screenshots

### Home

![Home Page](./public/screenshots/home.png)

### Interactive Map

![Map Mode](./public/screenshots/cyber_mode.png)

### City Intelligence

![City Intelligence Page](./public/screenshots/city_page.png)

### Predictions

![Predictions Page](./public/screenshots/predictions_page.png)

### Feedback

![Feedback Page](./public/screenshots/feedback_page.png)

## Getting Started

Clone the repository:

```bash
git clone https://github.com/vardanraghav/ChronoEarth.git
cd ChronoEarth/chronoearth
