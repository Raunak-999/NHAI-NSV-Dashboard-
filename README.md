# NHAI NSV Dashboard - Pavement Condition Monitoring

## 🚀 Project Overview

A comprehensive full-stack web application for the NHAI Innovation Hackathon 2025 that provides real-time visualization and monitoring of Network Survey Vehicle (NSV) pavement condition data.

## ✨ Features

### Core Functionality
- **Excel File Upload**: Upload and process NSV data files with validation
- **Interactive Map**: Real-time visualization of highway segments with color-coded distress levels
- **Real-time Dashboard**: Statistics cards, charts, and analytics
- **Mobile-Responsive**: Optimized for field inspection on mobile devices  
- **Alert System**: Automatic threshold violation notifications
- **Data Export**: Export processed data and reports

### Current Data
The application currently contains sample data for:
- **3 Highways**: NH-44, NH-1, NH-2
- **4 Segments**: Various chainage sections
- **16 Lanes**: L1, L2, R1, R2 configurations
- **17 Active Alerts**: Critical threshold violations

## 📊 Database Schema

### Tables
- **highways**: Master highway information (NH numbers, names, lengths)
- **segments**: Highway segments with chainage data and survey timestamps
- **lanes**: Individual lane data with GPS coordinates and distress measurements
- **alerts**: Automated alerts based on distress threshold violations

### Distress Thresholds
- **Roughness BI**: 2400 mm/km
- **Rut Depth**: 5 mm
- **Crack Area**: 5%
- **Ravelling**: 1%

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Leaflet.js** for interactive maps
- **Recharts** for data visualization
- **TanStack Query** for state management

### Backend
- **Node.js** with Express.js
- **PostgreSQL** (Neon serverless)
- **Drizzle ORM** for database operations
- **XLSX** for Excel file processing

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Neon configured)

### Installation
1. Install dependencies: `npm install`
2. Set up database: `npm run db:push`
3. Start development server: `npm run dev`

### Testing Upload Feature
Use the provided `sample_nsv_data.xlsx` file to test the upload functionality. The file contains sample NSV data with various distress levels.

## 📱 API Endpoints

- `GET /api/stats` - Dashboard statistics
- `GET /api/segments` - Highway segments with filtering
- `GET /api/alerts` - Active alerts
- `GET /api/highways` - Highway list
- `POST /api/upload` - Excel file upload
- `POST /api/alerts/:id/resolve` - Resolve alert

## 🎯 Features Demonstrated

### Real-time Monitoring
- Live dashboard with current statistics
- Interactive map showing highway network
- Color-coded distress level visualization

### Data Processing
- Excel file upload with validation
- Automatic distress calculation
- Alert generation for threshold violations

### Mobile Optimization
- Responsive design for all screen sizes
- Touch-optimized map controls
- Mobile-friendly navigation

## 📈 Current Statistics

- **Total Segments**: 4
- **Critical Alerts**: 15
- **Average Roughness**: 2315 mm/km
- **Distress Distribution**: Balanced across all types

## 🔧 Next Steps

1. Upload the sample Excel file to see the processing in action
2. Explore the interactive map with real highway data
3. Review alerts and dashboard analytics
4. Test mobile responsiveness on different devices

## 🏆 Innovation Hackathon Ready

This application demonstrates:
- Real-time data processing and visualization
- Professional UI/UX design
- Scalable architecture
- Mobile-first approach
- Comprehensive monitoring capabilities

Perfect for field engineers and highway maintenance teams to monitor pavement conditions in real-time.