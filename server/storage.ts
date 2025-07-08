import { highways, segments, lanes, alerts, type Highway, type Segment, type Lane, type Alert, type InsertHighway, type InsertSegment, type InsertLane, type InsertAlert, type SegmentWithRelations, type LaneWithSegment } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, or } from "drizzle-orm";

export interface IStorage {
  // Highways
  getHighways(): Promise<Highway[]>;
  getHighwayByNH(nhNumber: string): Promise<Highway | undefined>;
  createHighway(highway: InsertHighway): Promise<Highway>;

  // Segments
  getSegments(filters?: {
    highwayId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<SegmentWithRelations[]>;
  getSegmentById(id: number): Promise<SegmentWithRelations | undefined>;
  createSegment(segment: InsertSegment): Promise<Segment>;

  // Lanes
  getLanesBySegmentId(segmentId: number): Promise<LaneWithSegment[]>;
  createLane(lane: InsertLane): Promise<Lane>;
  bulkCreateLanes(lanes: InsertLane[]): Promise<Lane[]>;

  // Alerts
  getAlerts(filters?: {
    severity?: string;
    isResolved?: boolean;
    limit?: number;
  }): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(alertId: number): Promise<Alert>;

  // Analytics
  getDistressStats(): Promise<{
    totalSegments: number;
    criticalAlerts: number;
    avgRoughness: number;
    distressDistribution: { type: string; count: number; percentage: number }[];
  }>;

  // Search
  searchSegments(query: string): Promise<SegmentWithRelations[]>;
}

export class DatabaseStorage implements IStorage {
  async getHighways(): Promise<Highway[]> {
    return await db.select().from(highways).orderBy(highways.nhNumber);
  }

  async getHighwayByNH(nhNumber: string): Promise<Highway | undefined> {
    const [highway] = await db.select().from(highways).where(eq(highways.nhNumber, nhNumber));
    return highway || undefined;
  }

  async createHighway(insertHighway: InsertHighway): Promise<Highway> {
    const [highway] = await db.insert(highways).values(insertHighway).returning();
    return highway;
  }

  async getSegments(filters?: {
    highwayId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<SegmentWithRelations[]> {
    const query = db.query.segments.findMany({
      with: {
        highway: true,
        lanes: {
          with: {
            alerts: true,
          },
        },
      },
      where: filters ? and(
        filters.highwayId ? eq(segments.highwayId, filters.highwayId) : undefined,
        filters.startDate ? gte(segments.surveyDate, filters.startDate) : undefined,
        filters.endDate ? lte(segments.surveyDate, filters.endDate) : undefined
      ) : undefined,
      orderBy: [desc(segments.surveyDate)],
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    });

    return await query;
  }

  async getSegmentById(id: number): Promise<SegmentWithRelations | undefined> {
    const segment = await db.query.segments.findFirst({
      where: eq(segments.id, id),
      with: {
        highway: true,
        lanes: {
          with: {
            alerts: true,
          },
        },
      },
    });

    return segment || undefined;
  }

  async createSegment(insertSegment: InsertSegment): Promise<Segment> {
    const [segment] = await db.insert(segments).values(insertSegment).returning();
    return segment;
  }

  async getLanesBySegmentId(segmentId: number): Promise<LaneWithSegment[]> {
    const result = await db.query.lanes.findMany({
      where: eq(lanes.segmentId, segmentId),
      with: {
        segment: {
          with: {
            highway: true,
          },
        },
        alerts: true,
      },
    });

    return result;
  }

  async createLane(insertLane: InsertLane): Promise<Lane> {
    const [lane] = await db.insert(lanes).values(insertLane).returning();
    return lane;
  }

  async bulkCreateLanes(insertLanes: InsertLane[]): Promise<Lane[]> {
    if (insertLanes.length === 0) return [];
    return await db.insert(lanes).values(insertLanes).returning();
  }

  async getAlerts(filters?: {
    severity?: string;
    isResolved?: boolean;
    limit?: number;
  }): Promise<Alert[]> {
    return await db.select().from(alerts)
      .where(and(
        filters?.severity ? eq(alerts.severity, filters.severity) : undefined,
        filters?.isResolved !== undefined ? eq(alerts.isResolved, filters.isResolved) : undefined
      ))
      .orderBy(desc(alerts.createdAt))
      .limit(filters?.limit || 50);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async resolveAlert(alertId: number): Promise<Alert> {
    const [alert] = await db.update(alerts)
      .set({ isResolved: true, resolvedAt: new Date() })
      .where(eq(alerts.id, alertId))
      .returning();
    return alert;
  }

  async getDistressStats(): Promise<{
    totalSegments: number;
    criticalAlerts: number;
    avgRoughness: number;
    distressDistribution: { type: string; count: number; percentage: number }[];
  }> {
    // Get total segments
    const totalSegmentsResult = await db.select().from(segments);
    const totalSegments = totalSegmentsResult.length;

    // Get critical alerts count
    const criticalAlertsResult = await db.select().from(alerts)
      .where(and(eq(alerts.severity, 'critical'), eq(alerts.isResolved, false)));
    const criticalAlerts = criticalAlertsResult.length;

    // Calculate average roughness
    const lanesResult = await db.select().from(lanes);
    const avgRoughness = lanesResult.reduce((sum, lane) => {
      return sum + (lane.roughnessBI ? parseFloat(lane.roughnessBI.toString()) : 0);
    }, 0) / lanesResult.length || 0;

    // Get distress distribution
    const alertsResult = await db.select().from(alerts);
    const distressTypes = ['roughness', 'rutdepth', 'crackarea', 'ravelling'];
    const distressDistribution = distressTypes.map(type => {
      const count = alertsResult.filter(alert => alert.alertType === type).length;
      const percentage = alertsResult.length > 0 ? (count / alertsResult.length) * 100 : 0;
      return { type, count, percentage };
    });

    return {
      totalSegments,
      criticalAlerts,
      avgRoughness,
      distressDistribution,
    };
  }

  async searchSegments(query: string): Promise<SegmentWithRelations[]> {
    return await db.query.segments.findMany({
      with: {
        highway: true,
        lanes: {
          with: {
            alerts: true,
          },
        },
      },
      where: or(
        ilike(highways.nhNumber, `%${query}%`),
        ilike(highways.name, `%${query}%`)
      ),
      orderBy: [desc(segments.surveyDate)],
      limit: 20,
    });
  }
}

export const storage = new DatabaseStorage();
