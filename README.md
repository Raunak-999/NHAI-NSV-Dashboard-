# NHAI NSV Dashboard - Real-time Pavement Condition Monitoring

## 🚀 Project Summary
A comprehensive full-stack web application for the NHAI Innovation Hackathon 2025. This system processes Network Survey Vehicle (NSV) data to monitor highway pavement conditions across India's highway network in real time.

---

## 📋 Project Details

### Core Functionality
- **Excel File Processing**: Upload and parse complex NHAI NSV data files with multi-lane highway segments
- **Real-time Dashboard**: Interactive visualization with statistics, charts, and analytics
- **Interactive Mapping**: Geographic visualization of highway segments with color-coded distress levels
- **Alert System**: Automatic threshold violation detection and notifications
- **Mobile-Responsive Design**: Optimized for field inspection on mobile devices
- **Data Export**: Export processed data and generate reports

### Current System Status
- **2,260 segments processed**
- **115 critical alerts active**
- **3,530 lanes in recent upload**
- **Multi-lane processing (L1-L4, R1-R4 configurations)**
- **4 distress metrics monitored: Roughness BI, Rut Depth, Crack Area, Ravelling**

---

## 🛠 Technology Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS (utility-first styling)
- Radix UI + shadcn/ui (accessible UI components)
- TanStack Query (server state management)
- Wouter (client-side routing)
- Leaflet.js (interactive map)
- Recharts (charts)
- Vite (build tool)

### Backend
- Node.js + Express.js
- TypeScript (ES modules)
- Multer (file upload)
- XLSX (Excel parsing)
- RESTful API

### Database & ORM
- PostgreSQL (Neon Serverless)
- Drizzle ORM (type-safe schema)
- Drizzle Kit (migrations)

---

## 🏗 Project Structure

```
NHAI-NSV-Dashboard/
├── client/         # React Frontend
│   ├── src/
│   │   ├── components/ (UI, map, charts, alerts, etc.)
│   │   ├── pages/ (dashboard, not-found)
│   │   ├── lib/ (excel-parser, map-utils, etc.)
│   │   ├── types/ (nsv.ts)
│   │   └── hooks/
├── server/         # Express Backend
│   ├── index.ts
│   ├── routes.ts
│   ├── db.ts
│   ├── storage.ts
│   └── vite.ts
├── shared/         # Drizzle schema
│   └── schema.ts
├── sample_nsv_data.xlsx
├── test_nhai_format.xlsx
└── ...
```

---

## 🔄 Development Workflow

### Database Schema
- **highways** → **segments** → **lanes** → **alerts**
- highways: Master highway info
- segments: Chainage, timestamps
- lanes: GPS, distress
- alerts: Threshold violations

### Processing Pipeline
1. Excel Upload (drag-and-drop)
2. Server-side XLSX parsing
3. Batch Processing (25 segments/batch, 1000 lanes/chunk)
4. Database Storage (normalized, transactional)
5. Alert Generation (NHAI standards)
6. Real-time Dashboard Updates (TanStack Query)

### NHAI Distress Thresholds
- Roughness BI: 2400 mm/km
- Rut Depth: 5 mm
- Crack Area: 5%
- Ravelling: 1%

---

## 📱 Application Features

### 5-Tab Dashboard Interface
- **Overview**: Stats, charts, key metrics
- **Map View**: Interactive Leaflet map
- **Data Table**: Sortable/filterable data
- **Alerts**: Real-time notifications
- **Field Mode**: Mobile-optimized

### API Endpoints
- `GET /api/stats` – Dashboard statistics
- `GET /api/segments` – Highway segments
- `GET /api/alerts` – Active alerts
- `GET /api/highways` – Highway list
- `POST /api/upload` – Excel upload
- `POST /api/alerts/:id/resolve` – Resolve alert

---

## 🛠 Local Deployment Requirements

### 1. Environment Variables
Create a `.env` file in the root directory:
```
DATABASE_URL=your_neon_database_connection_url
```

### 2. Database Setup
- Use Neon PostgreSQL (recommended)
- Just update the `DATABASE_URL` in your `.env` file

### 3. Local Development Setup
```
npm install
npm run db:push
```

### 4. Start the Application
```
npm run dev
```
- Access at: http://localhost:5000

---

## 🎯 Key Innovations
- Real-time, bulk Excel processing
- Progress indicators for uploads
- Live dashboard updates
- Mobile-responsive, professional UI/UX
- Scalable, type-safe, and extensible architecture

---

## 🏆 Innovation Hackathon Ready
This application demonstrates enterprise-grade real-time data processing, interactive visualization, and comprehensive monitoring capabilities—perfect for highway engineers and maintenance teams to monitor pavement conditions across India's highway network.