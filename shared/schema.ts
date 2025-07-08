import { pgTable, text, serial, integer, decimal, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const highways = pgTable("highways", {
  id: serial("id").primaryKey(),
  nhNumber: varchar("nh_number", { length: 20 }).notNull(),
  name: text("name").notNull(),
  totalLength: decimal("total_length", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  highwayId: integer("highway_id").references(() => highways.id).notNull(),
  chainageStart: decimal("chainage_start", { precision: 10, scale: 3 }).notNull(),
  chainageEnd: decimal("chainage_end", { precision: 10, scale: 3 }).notNull(),
  length: decimal("length", { precision: 10, scale: 3 }).notNull(),
  surveyDate: timestamp("survey_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lanes = pgTable("lanes", {
  id: serial("id").primaryKey(),
  segmentId: integer("segment_id").references(() => segments.id).notNull(),
  laneNumber: varchar("lane_number", { length: 10 }).notNull(), // L1, L2, L3, L4, R1, R2, R3, R4
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  roughnessBI: decimal("roughness_bi", { precision: 8, scale: 2 }),
  rutDepth: decimal("rut_depth", { precision: 6, scale: 2 }),
  crackArea: decimal("crack_area", { precision: 5, scale: 2 }),
  ravelling: decimal("ravelling", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  laneId: integer("lane_id").references(() => lanes.id).notNull(),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'roughness', 'rutdepth', 'crackarea', 'ravelling'
  severity: varchar("severity", { length: 20 }).notNull(), // 'critical', 'poor', 'fair', 'good', 'excellent'
  thresholdValue: decimal("threshold_value", { precision: 8, scale: 2 }).notNull(),
  actualValue: decimal("actual_value", { precision: 8, scale: 2 }).notNull(),
  message: text("message"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Relations
export const highwaysRelations = relations(highways, ({ many }) => ({
  segments: many(segments),
}));

export const segmentsRelations = relations(segments, ({ one, many }) => ({
  highway: one(highways, {
    fields: [segments.highwayId],
    references: [highways.id],
  }),
  lanes: many(lanes),
}));

export const lanesRelations = relations(lanes, ({ one, many }) => ({
  segment: one(segments, {
    fields: [lanes.segmentId],
    references: [segments.id],
  }),
  alerts: many(alerts),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  lane: one(lanes, {
    fields: [alerts.laneId],
    references: [lanes.id],
  }),
}));

// Insert schemas
export const insertHighwaySchema = createInsertSchema(highways).omit({
  id: true,
  createdAt: true,
});

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  createdAt: true,
});

export const insertLaneSchema = createInsertSchema(lanes).omit({
  id: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Types
export type InsertHighway = z.infer<typeof insertHighwaySchema>;
export type Highway = typeof highways.$inferSelect;

export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type Segment = typeof segments.$inferSelect;

export type InsertLane = z.infer<typeof insertLaneSchema>;
export type Lane = typeof lanes.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Extended types for API responses
export type SegmentWithRelations = Segment & {
  highway: Highway;
  lanes: (Lane & { alerts: Alert[] })[];
};

export type LaneWithSegment = Lane & {
  segment: Segment & { highway: Highway };
  alerts: Alert[];
};
