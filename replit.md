# NHAI NSV Dashboard - Real-time Pavement Condition Monitoring

## Overview

The NHAI NSV Dashboard is a full-stack web application designed for the NHAI Innovation Hackathon 2025. It provides real-time visualization and monitoring of Network Survey Vehicle (NSV) pavement condition data, enabling highway engineers and inspectors to analyze road distress metrics, track highway segments, and receive alerts for threshold violations.

The application follows a modern monorepo structure with a React frontend, Express backend, and PostgreSQL database, all designed for real-time data processing and mobile-responsive field inspection workflows.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for CRUD operations and data analytics
- **File Processing**: Multer for Excel file uploads, XLSX library for parsing
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Connection**: Neon serverless driver with WebSocket support
- **Schema**: Normalized structure with highways, segments, lanes, and alerts tables

## Key Components

### Database Schema
The application uses a normalized database structure:
- **highways**: Master table for highway information (NH numbers, names, lengths)
- **segments**: Highway segments with chainage data and survey timestamps
- **lanes**: Individual lane data with GPS coordinates and distress measurements
- **alerts**: Automated alerts based on distress threshold violations

### File Processing Pipeline
- Excel/CSV file upload with validation
- XLSX parsing and data transformation
- Bulk insertion with transaction support
- Automatic alert generation based on predefined thresholds

### Interactive Components
- **Interactive Map**: Leaflet.js integration for geographic visualization
- **Real-time Dashboard**: Statistics cards, charts, and trend analysis
- **Data Tables**: Sortable, filterable tables with pagination
- **Alert System**: Real-time notifications for threshold violations
- **Upload Interface**: Drag-and-drop file processing with progress tracking

### Analytics Engine
- Distress severity calculation based on NHAI thresholds
- Statistical aggregations for dashboard metrics
- Trend analysis and reporting capabilities
- Search and filtering across multiple data dimensions

## Data Flow

1. **Data Ingestion**: Excel files uploaded via drag-and-drop interface
2. **Processing**: Server-side parsing and validation of NSV data
3. **Storage**: Normalized data insertion into PostgreSQL tables
4. **Alert Generation**: Automatic threshold checking and alert creation
5. **Visualization**: Real-time dashboard updates via React Query
6. **Interaction**: User filters and searches trigger API calls for updated data

### Distress Monitoring Thresholds
- **Roughness BI**: 2400 mm/km
- **Rut Depth**: 5 mm
- **Crack Area**: 5%
- **Ravelling**: 1%

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **recharts**: Data visualization and charting
- **date-fns**: Date formatting and manipulation
- **wouter**: Lightweight routing solution

### Backend Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with migration support
- **multer**: File upload middleware
- **xlsx**: Excel file parsing
- **express**: Web application framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend, tsx for backend
- **Database**: Neon serverless PostgreSQL with connection pooling
- **File Storage**: Local memory storage for file uploads
- **Environment Variables**: DATABASE_URL for database connection

### Production Deployment
- **Build Process**: Vite build for frontend static assets, esbuild for backend bundle
- **Server**: Node.js Express server serving both API and static files
- **Database**: Neon PostgreSQL with production-grade connection pooling
- **Environment**: Production environment variables with secure configuration

### Replit Integration
- **Runtime Error Overlay**: Development-only error modal integration
- **Cartographer**: Development mapping for better debugging experience
- **Banner Integration**: Development environment indicators

The application is designed to be easily deployable on various platforms while maintaining development-production parity through environment-specific configurations.

## Changelog

```
Changelog:
- July 08, 2025. Initial setup with complete database schema and basic components
- July 08, 2025. Added comprehensive sample data and fully functional backend
- July 08, 2025. Fixed frontend Select component issues and database integration
- July 08, 2025. Created sample Excel file for testing upload functionality
- July 08, 2025. Backend fully connected and functional with PostgreSQL database
- July 08, 2025. Fixed critical Excel parsing issue for NHAI format - now processes complex multi-lane data correctly
- July 08, 2025. Added debug upload component and comprehensive 5-tab dashboard interface
- July 08, 2025. Implemented all advanced features: real-time monitoring, mobile field mode, export functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```