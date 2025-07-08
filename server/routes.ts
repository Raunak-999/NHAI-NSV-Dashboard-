import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { insertHighwaySchema, insertSegmentSchema, insertLaneSchema, insertAlertSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Check file extension (more reliable than MIME type)
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Only Excel files (.xlsx, .xls) are allowed. Received: ${fileExtension}`));
    }
  }
});

// Distress thresholds
const THRESHOLDS = {
  roughness: 2400, // mm/km
  rutDepth: 5, // mm
  crackArea: 5, // %
  ravelling: 1, // %
};

function calculateSeverity(type: string, value: number): string {
  const threshold = THRESHOLDS[type as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  const ratio = value / threshold;
  if (ratio >= 1.2) return 'critical';
  if (ratio >= 1.0) return 'poor';
  if (ratio >= 0.8) return 'fair';
  if (ratio >= 0.6) return 'good';
  return 'excellent';
}

function processExcelData(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
  // Get raw data as array of arrays for better control
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  console.log('Raw Excel rows:', rawData.length);
  console.log('Sample raw row:', rawData[1] || rawData[0]);
  
  // Find data start row (skip headers)
  let dataStartRow = 0;
  for (let i = 0; i < Math.min(rawData.length, 10); i++) {
    const row = rawData[i] as any[];
    if (row && row[0] && typeof row[0] === 'string' && row[0].toString().includes('NH')) {
      dataStartRow = i;
      break;
    }
  }
  
  console.log(`Data starts at row: ${dataStartRow}`);
  const dataRows = rawData.slice(dataStartRow);
  console.log(`Processing ${dataRows.length} data rows`);
  
  const processedData: any[] = [];
  
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] as any[];
    
    // Skip empty rows
    if (!row || !row[0] || !row[1] || !row[2]) {
      continue;
    }
    
    console.log(`Processing row ${i}:`, row.slice(0, 5));
    
    // Extract basic segment info
    const nhNumber = row[0]?.toString();
    const chainageStart = parseFloat(row[1]);
    const chainageEnd = parseFloat(row[2]);
    
    if (!nhNumber || isNaN(chainageStart) || isNaN(chainageEnd)) {
      console.log(`Skipping row ${i}: invalid basic data`);
      continue;
    }
    
    // Process each lane (L1-L4, R1-R4)
    const lanes = ['L1', 'L2', 'L3', 'L4', 'R1', 'R2', 'R3', 'R4'];
    
    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const laneNumber = lanes[laneIndex];
      
      // GPS coordinates: columns 5-36 (4 coords per lane: start_lat, start_lng, end_lat, end_lng)
      const coordStartIndex = 5 + (laneIndex * 4);
      const latitude = parseFloat(row[coordStartIndex]) || null;
      const longitude = parseFloat(row[coordStartIndex + 1]) || null;
      
      // Distress data indices based on Excel structure
      const roughnessIndex = 31 + laneIndex; // L1 Lane Roughness BI starts at column 31
      const rutDepthIndex = 40 + laneIndex;  // L1 Rut Depth starts at column 40
      const crackAreaIndex = 49 + laneIndex; // L1 Crack Area starts at column 49
      const ravellingIndex = 58 + laneIndex; // L1 Ravelling starts at column 58
      
      const roughnessBI = parseFloat(row[roughnessIndex]) || null;
      const rutDepth = parseFloat(row[rutDepthIndex]) || null;
      const crackArea = parseFloat(row[crackAreaIndex]) || null;
      const ravelling = parseFloat(row[ravellingIndex]) || null;
      
      // Only include lanes with some actual data
      if (latitude || longitude || roughnessBI || rutDepth || crackArea || ravelling) {
        processedData.push({
          nhNumber,
          chainageStart,
          chainageEnd,
          laneNumber,
          latitude: latitude || 28.7041, // Default Delhi coords if missing
          longitude: longitude || 77.1025,
          roughnessBI,
          rutDepth,
          crackArea,
          ravelling,
        });
      }
    }
  }
  
  console.log(`Processed ${processedData.length} lane records from ${dataRows.length} rows`);
  return processedData;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/highways - Get all highways
  app.get("/api/highways", async (req, res) => {
    try {
      const highways = await storage.getHighways();
      res.json(highways);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch highways" });
    }
  });

  // GET /api/segments - Get segments with filters
  app.get("/api/segments", async (req, res) => {
    try {
      const { highway, startDate, endDate, limit, offset } = req.query;
      
      const filters: any = {};
      if (highway) {
        const highwayRecord = await storage.getHighwayByNH(highway as string);
        if (highwayRecord) {
          filters.highwayId = highwayRecord.id;
        }
      }
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const segments = await storage.getSegments(filters);
      res.json(segments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch segments" });
    }
  });

  // GET /api/segments/:id - Get specific segment
  app.get("/api/segments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const segment = await storage.getSegmentById(id);
      
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      
      res.json(segment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch segment" });
    }
  });

  // GET /api/alerts - Get alerts with filters
  app.get("/api/alerts", async (req, res) => {
    try {
      const { severity, resolved, limit } = req.query;
      
      const filters: any = {};
      if (severity) filters.severity = severity as string;
      if (resolved !== undefined) filters.isResolved = resolved === 'true';
      if (limit) filters.limit = parseInt(limit as string);

      const alerts = await storage.getAlerts(filters);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // POST /api/alerts/:id/resolve - Resolve an alert
  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveAlert(id);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // GET /api/stats - Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDistressStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // GET /api/search - Search segments
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const segments = await storage.searchSegments(q);
      res.json(segments);
    } catch (error) {
      res.status(500).json({ message: "Failed to search segments" });
    }
  });

  // POST /api/debug-upload - Debug Excel file structure
  app.post("/api/debug-upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Get both formats for debugging
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      res.json({
        fileName: req.file.originalname,
        sheetNames: workbook.SheetNames,
        totalRows: rawData.length,
        totalColumns: rawData[0]?.length || 0,
        firstFiveRows: rawData.slice(0, 5),
        sampleJsonRow: jsonData[0],
        headerRow: rawData[0],
        firstDataRow: rawData.find(row => row[0] && row[0].toString().includes('NH')),
        columnMapping: {
          nhNumber: 'Column 0',
          startChainage: 'Column 1', 
          endChainage: 'Column 2',
          gpsCoords: 'Columns 5-36 (4 per lane)',
          roughness: 'Columns 31-38',
          rutDepth: 'Columns 40-47',
          crackArea: 'Columns 49-56',
          ravelling: 'Columns 58-65'
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Debug failed", error: (error as Error).message });
    }
  });

  // POST /api/upload - Upload and process Excel file
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const excelData = processExcelData(req.file.buffer);
      const processedCount = { highways: 0, segments: 0, lanes: 0, alerts: 0 };

      // Group data by highway and segments
      const groupedData = new Map();
      
      for (const row of excelData) {
        if (!row.nhNumber || !row.chainageStart || !row.chainageEnd) continue;
        
        const segmentKey = `${row.nhNumber}-${row.chainageStart}-${row.chainageEnd}`;
        
        if (!groupedData.has(segmentKey)) {
          groupedData.set(segmentKey, {
            nhNumber: row.nhNumber,
            chainageStart: row.chainageStart,
            chainageEnd: row.chainageEnd,
            lanes: []
          });
        }
        
        groupedData.get(segmentKey).lanes.push(row);
      }

      // Process each segment
      for (const segmentData of Array.from(groupedData.values())) {
        try {
          // Create or get highway
          let highway = await storage.getHighwayByNH(segmentData.nhNumber);
          if (!highway) {
            highway = await storage.createHighway({
              nhNumber: segmentData.nhNumber,
              name: `National Highway ${segmentData.nhNumber}`,
              totalLength: "0",
            });
            processedCount.highways++;
          }

          // Create segment
          const segment = await storage.createSegment({
            highwayId: highway.id,
            chainageStart: segmentData.chainageStart.toString(),
            chainageEnd: segmentData.chainageEnd.toString(),
            length: (segmentData.chainageEnd - segmentData.chainageStart).toString(),
            surveyDate: new Date(),
          });
          processedCount.segments++;

          // Create lanes and check for alerts
          const lanesToCreate = [];
          const alertsToCreate = [];

          for (const laneData of segmentData.lanes) {
            if (!laneData.latitude || !laneData.longitude) continue;

            const laneInsert = {
              segmentId: segment.id,
              laneNumber: laneData.laneNumber,
              latitude: laneData.latitude.toString(),
              longitude: laneData.longitude.toString(),
              roughnessBI: laneData.roughnessBI?.toString(),
              rutDepth: laneData.rutDepth?.toString(),
              crackArea: laneData.crackArea?.toString(),
              ravelling: laneData.ravelling?.toString(),
            };

            lanesToCreate.push(laneInsert);
          }

          const createdLanes = await storage.bulkCreateLanes(lanesToCreate);
          processedCount.lanes += createdLanes.length;

          // Check for threshold violations and create alerts
          for (let i = 0; i < createdLanes.length; i++) {
            const lane = createdLanes[i];
            const laneData = segmentData.lanes[i];

            const checks = [
              { type: 'roughness', value: laneData.roughnessBI, threshold: THRESHOLDS.roughness },
              { type: 'rutdepth', value: laneData.rutDepth, threshold: THRESHOLDS.rutDepth },
              { type: 'crackarea', value: laneData.crackArea, threshold: THRESHOLDS.crackArea },
              { type: 'ravelling', value: laneData.ravelling, threshold: THRESHOLDS.ravelling },
            ];

            for (const check of checks) {
              if (check.value && check.value > check.threshold) {
                const severity = calculateSeverity(check.type, check.value);
                
                await storage.createAlert({
                  laneId: lane.id,
                  alertType: check.type,
                  severity,
                  thresholdValue: check.threshold.toString(),
                  actualValue: check.value.toString(),
                  message: `${check.type} threshold exceeded: ${check.value} > ${check.threshold}`,
                  isResolved: false,
                });
                processedCount.alerts++;
              }
            }
          }

        } catch (error) {
          console.error('Error processing segment:', error);
          continue;
        }
      }

      res.json({
        message: "File processed successfully",
        processed: processedCount,
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
