# NYC Accident Risk Predictor

Interactive web application for visualizing accident risk zones in New York City.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Package Manager**: pnpm
- **Map**: React-Leaflet + Leaflet.js
- **Styling**: TailwindCSS
- **Language**: TypeScript

## Features

- 🗺️ Interactive map with zoom-aware risk visualization
- 🔍 Search by place name or coordinates
- 📍 Geolocation support
- 🟢🟠🔴 Color-coded risk levels (Low/Medium/High)
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install with `npm install -g pnpm`)

### Installation

```bash
cd frontend
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Usage

1. **Search**: Enter a place name (e.g., "Times Square") or coordinates (e.g., "40.758,-73.985")
2. **Time Filters** (optional): Add hour (0-23), day (1-31), month (1-12)
3. **My Location**: Click to use your current GPS location
4. **Clear**: Reset to default NYC view

### Supported Locations (Mock)

- Times Square
- Central Park
- Brooklyn Bridge
- Statue of Liberty
- Empire State Building
- Wall Street

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── MapView.tsx      # Leaflet map component
│   └── SearchBar.tsx    # Search input UI
├── public/
│   └── mock-data.json   # Sample risk data
└── types/
    └── index.ts         # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Select Framework: Next.js
5. Deploy

Your app will be live at `https://your-app.vercel.app`

## Notes

- Currently uses **mock data** from `public/mock-data.json`
- Backend integration coming soon
- Zoom levels 10-16 supported with dynamic circle sizing

## Developer

Created by ฟา
