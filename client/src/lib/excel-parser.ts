export interface NSVRowData {
  nhNumber: string;
  chainageStart: number;
  chainageEnd: number;
  laneNumber: string;
  latitude: number;
  longitude: number;
  roughnessBI: number;
  rutDepth: number;
  crackArea: number;
  ravelling: number;
}

export function validateNSVData(data: any[]): NSVRowData[] {
  const validRows: NSVRowData[] = [];
  
  for (const row of data) {
    try {
      const validRow: NSVRowData = {
        nhNumber: String(row['NH_Number'] || row['Highway'] || '').trim(),
        chainageStart: parseFloat(row['Chainage_Start'] || row['Start_KM']) || 0,
        chainageEnd: parseFloat(row['Chainage_End'] || row['End_KM']) || 0,
        laneNumber: String(row['Lane'] || 'L1').trim(),
        latitude: parseFloat(row['Latitude'] || row['Lat']) || 0,
        longitude: parseFloat(row['Longitude'] || row['Long']) || 0,
        roughnessBI: parseFloat(row['Roughness_BI'] || row['Roughness']) || 0,
        rutDepth: parseFloat(row['Rut_Depth'] || row['RutDepth']) || 0,
        crackArea: parseFloat(row['Crack_Area'] || row['CrackArea']) || 0,
        ravelling: parseFloat(row['Ravelling']) || 0,
      };

      // Basic validation
      if (validRow.nhNumber && 
          validRow.chainageStart > 0 && 
          validRow.chainageEnd > validRow.chainageStart &&
          validRow.latitude !== 0 && 
          validRow.longitude !== 0) {
        validRows.push(validRow);
      }
    } catch (error) {
      console.warn('Invalid row data:', row, error);
    }
  }
  
  return validRows;
}

export function getDistressSeverity(type: string, value: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  const thresholds = {
    roughness: 2400,
    rutdepth: 5,
    crackarea: 5,
    ravelling: 1,
  };

  const threshold = thresholds[type as keyof typeof thresholds];
  if (!threshold) return 'good';
  
  const ratio = value / threshold;
  if (ratio >= 1.2) return 'critical';
  if (ratio >= 1.0) return 'poor';
  if (ratio >= 0.8) return 'fair';
  if (ratio >= 0.6) return 'good';
  return 'excellent';
}
