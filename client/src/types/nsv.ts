export interface Highway {
  id: number;
  nhNumber: string;
  name: string;
  totalLength?: string;
  createdAt?: string;
}

export interface Segment {
  id: number;
  highwayId: number;
  chainageStart: string;
  chainageEnd: string;
  length: string;
  surveyDate: string;
  createdAt?: string;
}

export interface Lane {
  id: number;
  segmentId: number;
  laneNumber: string;
  latitude: string;
  longitude: string;
  roughnessBI?: string;
  rutDepth?: string;
  crackArea?: string;
  ravelling?: string;
  createdAt?: string;
}

export interface Alert {
  id: number;
  laneId: number;
  alertType: string;
  severity: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  thresholdValue: string;
  actualValue: string;
  message?: string;
  isResolved: boolean;
  createdAt?: string;
  resolvedAt?: string;
}

export interface SegmentWithRelations extends Segment {
  highway: Highway;
  lanes: (Lane & { alerts: Alert[] })[];
}

export interface DashboardStats {
  totalSegments: number;
  criticalAlerts: number;
  avgRoughness: number;
  distressDistribution: { type: string; count: number; percentage: number }[];
}

export interface MapFilters {
  highway: string;
  distressType: string;
  severity: {
    excellent: boolean;
    good: boolean;
    fair: boolean;
    poor: boolean;
    critical: boolean;
  };
  startDate: string;
  endDate: string;
}
