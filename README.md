# NYC Accident Risk Predictor

Full-stack web application for visualizing and predicting accident risk zones in New York City.

## Project Overview

This project consists of:
- **Frontend**: Next.js 14 with React-Leaflet for interactive mapping
- **Backend**: (Coming soon) FastAPI for risk prediction API

## Quick Start

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# Open http://localhost:3000
```

See [frontend/README.md](./frontend/README.md) for details.

## Features

- 🗺️ Interactive NYC risk map with zoom-aware visualization
- 🔍 Search by location name or GPS coordinates
- 📍 Current location detection
- 🟢🟠🔴 Risk levels: Low, Medium, High
- ⏰ Time-based filtering (hour/day/month)
- 📱 Mobile responsive

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js 14 (App Router) |
| Package Manager | pnpm |
| Map Library | React-Leaflet + Leaflet.js |
| Styling | TailwindCSS |
| Language | TypeScript |
| Deployment | Vercel |

## Dataset

Based on NYC Motor Vehicle Collisions dataset (2019-2024)  
*Currently using mock data for demonstration*

## Development Roadmap

- [x] Frontend with interactive map
- [x] Mock data integration
- [x] Search and geolocation
- [ ] Backend API (FastAPI)
- [ ] ML model integration
- [ ] Real collision data
- [ ] Deployment to production

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Developer

Created by ฟา
