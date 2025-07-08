import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, BarChart3, FileSpreadsheet, FileImage } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import type { SegmentWithRelations, DashboardStats } from '@shared/schema';

export function ExportReports() {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    segments: true,
    alerts: true,
    analytics: true,
    map: false
  });

  // Get data for export
  const { data: segments = [] } = useQuery({
    queryKey: ['/api/segments'],
    queryFn: getQueryFn<SegmentWithRelations[]>({ on401: 'throw' }),
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: getQueryFn<DashboardStats>({ on401: 'throw' }),
  });

  const handleExport = () => {
    if (!selectedFormat) {
      alert('Please select an export format');
      return;
    }

    // Create export data based on selected sections
    const exportData = {
      generatedAt: new Date().toISOString(),
      reportType: 'NHAI NSV Dashboard Report',
      ...(selectedSections.overview && { overview: stats }),
      ...(selectedSections.segments && { segments }),
      ...(selectedSections.alerts && { alerts: segments.flatMap(s => s.lanes.flatMap(l => l.alerts)) }),
      ...(selectedSections.analytics && { analytics: stats?.distressDistribution })
    };

    if (selectedFormat === 'json') {
      downloadJSON(exportData);
    } else if (selectedFormat === 'csv') {
      downloadCSV(exportData);
    } else if (selectedFormat === 'excel') {
      downloadExcel(exportData);
    } else if (selectedFormat === 'pdf') {
      generatePDFReport(exportData);
    }
  };

  const downloadJSON = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhai-nsv-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any) => {
    if (!data.segments) return;
    
    const csvRows = [
      ['Highway', 'Chainage Start', 'Chainage End', 'Lane', 'Latitude', 'Longitude', 'Roughness', 'Rut Depth', 'Crack Area', 'Ravelling', 'Critical Alerts']
    ];

    data.segments.forEach((segment: SegmentWithRelations) => {
      segment.lanes.forEach(lane => {
        csvRows.push([
          segment.highway.nhNumber,
          segment.chainageStart,
          segment.chainageEnd,
          lane.laneNumber,
          lane.latitude,
          lane.longitude,
          lane.roughnessBI || '0',
          lane.rutDepth || '0',
          lane.crackArea || '0',
          lane.ravelling || '0',
          lane.alerts.filter(a => a.severity === 'critical').length.toString()
        ]);
      });
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nhai-nsv-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any) => {
    // For demo purposes, download as CSV with .xlsx extension
    downloadCSV(data);
  };

  const generatePDFReport = (data: any) => {
    // Create a simple HTML report and convert to PDF-like view
    const htmlContent = `
      <html>
        <head>
          <title>NHAI NSV Dashboard Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
            .stat-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NHAI NSV Dashboard Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${selectedSections.overview ? `
            <div class="section">
              <h2>Overview Statistics</h2>
              <div class="stats">
                <div class="stat-card">
                  <h3>${stats?.totalSegments || 0}</h3>
                  <p>Total Segments</p>
                </div>
                <div class="stat-card">
                  <h3>${stats?.criticalAlerts || 0}</h3>
                  <p>Critical Alerts</p>
                </div>
                <div class="stat-card">
                  <h3>${stats?.avgRoughness?.toFixed(1) || 0}</h3>
                  <p>Avg Roughness (mm/km)</p>
                </div>
                <div class="stat-card">
                  <h3>${segments.length}</h3>
                  <p>Active Highways</p>
                </div>
              </div>
            </div>
          ` : ''}
          
          ${selectedSections.alerts ? `
            <div class="section">
              <h2>Critical Alerts Summary</h2>
              <p>Total critical alerts requiring immediate attention: <strong>${segments.flatMap(s => s.lanes.flatMap(l => l.alerts.filter(a => a.severity === 'critical'))).length}</strong></p>
            </div>
          ` : ''}
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      setTimeout(() => {
        newWindow.print();
      }, 500);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports & Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  PDF Report
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Spreadsheet
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Data
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  JSON Data
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Include Sections</label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="overview"
                checked={selectedSections.overview}
                onCheckedChange={(checked) => 
                  setSelectedSections(prev => ({ ...prev, overview: checked as boolean }))
                }
              />
              <label htmlFor="overview" className="text-sm">Dashboard Overview & Statistics</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="segments"
                checked={selectedSections.segments}
                onCheckedChange={(checked) => 
                  setSelectedSections(prev => ({ ...prev, segments: checked as boolean }))
                }
              />
              <label htmlFor="segments" className="text-sm">Highway Segments Data</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="alerts"
                checked={selectedSections.alerts}
                onCheckedChange={(checked) => 
                  setSelectedSections(prev => ({ ...prev, alerts: checked as boolean }))
                }
              />
              <label htmlFor="alerts" className="text-sm">Alerts & Threshold Violations</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="analytics"
                checked={selectedSections.analytics}
                onCheckedChange={(checked) => 
                  setSelectedSections(prev => ({ ...prev, analytics: checked as boolean }))
                }
              />
              <label htmlFor="analytics" className="text-sm">Analytics & Trends</label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex gap-3">
            <Button 
              onClick={handleExport}
              disabled={!selectedFormat}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedFormat('');
                setSelectedSections({
                  overview: true,
                  segments: true,
                  alerts: true,
                  analytics: true,
                  map: false
                });
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><strong>Data Summary:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• {segments.length} highway segments</li>
            <li>• {segments.flatMap(s => s.lanes).length} lane records</li>
            <li>• {segments.flatMap(s => s.lanes.flatMap(l => l.alerts)).length} total alerts</li>
            <li>• Generated on {new Date().toLocaleDateString()}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}