import { SegmentWithRelations } from '@/types/nsv';

export interface MapSegment {
  id: number;
  coordinates: [number, number][];
  highway: string;
  chainage: string;
  severity: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  distressData: {
    roughness?: number;
    rutDepth?: number;
    crackArea?: number;
    ravelling?: number;
  };
}

export function convertSegmentsToMapData(segments: SegmentWithRelations[]): MapSegment[] {
  return segments.map(segment => {
    const coordinates: [number, number][] = segment.lanes.map(lane => [
      parseFloat(lane.latitude),
      parseFloat(lane.longitude)
    ]);

    // Calculate overall severity based on worst lane
    let worstSeverity: 'excellent' | 'good' | 'fair' | 'poor' | 'critical' = 'excellent';
    const distressData = {
      roughness: 0,
      rutDepth: 0,
      crackArea: 0,
      ravelling: 0,
    };

    segment.lanes.forEach(lane => {
      // Update distress data averages
      if (lane.roughnessBI) distressData.roughness += parseFloat(lane.roughnessBI);
      if (lane.rutDepth) distressData.rutDepth += parseFloat(lane.rutDepth);
      if (lane.crackArea) distressData.crackArea += parseFloat(lane.crackArea);
      if (lane.ravelling) distressData.ravelling += parseFloat(lane.ravelling);

      // Check for worst severity from alerts
      lane.alerts.forEach(alert => {
        if (getSeverityLevel(alert.severity) > getSeverityLevel(worstSeverity)) {
          worstSeverity = alert.severity;
        }
      });
    });

    // Calculate averages
    const laneCount = segment.lanes.length;
    if (laneCount > 0) {
      distressData.roughness /= laneCount;
      distressData.rutDepth /= laneCount;
      distressData.crackArea /= laneCount;
      distressData.ravelling /= laneCount;
    }

    return {
      id: segment.id,
      coordinates,
      highway: segment.highway.nhNumber,
      chainage: `${segment.chainageStart}-${segment.chainageEnd}`,
      severity: worstSeverity,
      distressData,
    };
  });
}

function getSeverityLevel(severity: string): number {
  const levels = {
    'excellent': 0,
    'good': 1,
    'fair': 2,
    'poor': 3,
    'critical': 4,
  };
  return levels[severity as keyof typeof levels] || 0;
}

export function getSeverityColor(severity: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'): string {
  const colors = {
    'excellent': '#4CAF50',
    'good': '#8BC34A',
    'fair': '#FFC107',
    'poor': '#FF9800',
    'critical': '#F44336',
  };
  return colors[severity];
}

export function formatDistressValue(type: string, value: number): string {
  switch (type) {
    case 'roughness':
      return `${value.toFixed(0)} mm/km`;
    case 'rutdepth':
      return `${value.toFixed(1)} mm`;
    case 'crackarea':
    case 'ravelling':
      return `${value.toFixed(1)}%`;
    default:
      return value.toString();
  }
}
