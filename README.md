# NYC Accident Risk Predictor

Full-stack web application for visualizing and predicting accident risk zones in New York City.

## Project Overview

This project consists of:

- **Frontend**: Next.js 14 with React-Leaflet for interactive mapping
- **Backend**: FastAPI for risk prediction API with ML model

## Quick Start

### Backend

1. **Create and activate virtual environment** (first time only):

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

3. **Run the server**:

```bash
python3 main.py
```

The API will be available at `http://localhost:3001`

**API Endpoints:**

- `GET /` - API information
- `GET /health` - Health check
- `GET /factors` - List of contributing factors
- `POST /predict` - Predict accident risk for a location

**Note:** Always activate the virtual environment before running:อำ

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

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

| Component                | Technology                 |
| ------------------------ | -------------------------- |
| Frontend Framework       | Next.js 14 (App Router)    |
| Frontend Package Manager | pnpm                       |
| Map Library              | React-Leaflet + Leaflet.js |
| Frontend Styling         | TailwindCSS                |
| Frontend Language        | TypeScript                 |
| Backend Framework        | FastAPI                    |
| Backend Language         | Python 3                   |
| ML Framework             | XGBoost, scikit-learn      |
| API Server               | Uvicorn                    |
| Deployment               | Self-hosted (PM2 + Nginx)  |

## Deployment (Self-Hosted)

### Prerequisites

- Node.js 18+ & pnpm
- Python 3.10+
- PM2 (`npm install -g pm2`)
- Nginx (optional, for reverse proxy)

### 1. Backend Deployment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with PM2
pm2 start "source venv/bin/activate && python main.py" --name nyc-backend
pm2 save
```

### 2. Frontend Deployment

```bash
cd frontend
pnpm install
pnpm build

# Run with PM2
pm2 start "pnpm start" --name nyc-frontend
pm2 save
```

### 3. Nginx Configuration (Optional)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 Commands

```bash
pm2 list              # View running processes
pm2 logs              # View logs
pm2 restart all       # Restart all processes
pm2 startup           # Enable auto-start on boot
```

## Dataset

Based on NYC Motor Vehicle Collisions dataset (2019-2024)  
_Currently using mock data for demonstration_

## Development Roadmap

- [x] Frontend with interactive map
- [x] Mock data integration
- [x] Search and geolocation
- [x] Backend API (FastAPI)
- [x] ML model integration
- [x] Self-hosted deployment
- [ ] Real collision data integration

## Developer

Created by Fafromh0me
