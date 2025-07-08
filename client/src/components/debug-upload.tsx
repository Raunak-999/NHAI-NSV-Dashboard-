import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Search, FileText, AlertCircle } from 'lucide-react';

export function DebugUpload() {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const { toast } = useToast();

  const handleDebugUpload = async (file: File) => {
    setIsDebugging(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiRequest('POST', '/api/debug-upload', formData);
      const result = await response.json();
      
      setDebugResult(result);
      toast({
        title: "Debug complete",
        description: `File structure analyzed: ${result.totalRows} rows, ${result.totalColumns} columns`,
      });
    } catch (error) {
      toast({
        title: "Debug failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
    setIsDebugging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleDebugUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Excel File Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            disabled={isDebugging}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Upload an Excel file to analyze its structure and column mapping
          </p>
        </div>

        {isDebugging && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Analyzing file structure...</p>
          </div>
        )}

        {debugResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Badge variant="outline">File: {debugResult.fileName}</Badge>
              </div>
              <div>
                <Badge variant="outline">
                  {debugResult.totalRows} rows × {debugResult.totalColumns} columns
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Column Mapping Guide:</h4>
              <div className="text-xs space-y-1 text-muted-foreground bg-gray-50 p-3 rounded">
                <div><strong>NH Number:</strong> {debugResult.columnMapping.nhNumber}</div>
                <div><strong>Start/End Chainage:</strong> {debugResult.columnMapping.startChainage}, {debugResult.columnMapping.endChainage}</div>
                <div><strong>GPS Coordinates:</strong> {debugResult.columnMapping.gpsCoords}</div>
                <div><strong>Roughness BI:</strong> {debugResult.columnMapping.roughness}</div>
                <div><strong>Rut Depth:</strong> {debugResult.columnMapping.rutDepth}</div>
                <div><strong>Crack Area:</strong> {debugResult.columnMapping.crackArea}</div>
                <div><strong>Ravelling:</strong> {debugResult.columnMapping.ravelling}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Header Row:</h4>
              <div className="text-xs bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(debugResult.headerRow?.slice(0, 10), null, 2)}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">First Data Row:</h4>
              <div className="text-xs bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                {debugResult.firstDataRow ? (
                  <pre>{JSON.stringify(debugResult.firstDataRow.slice(0, 10), null, 2)}</pre>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    No data rows found with NH number
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Sample JSON Row:</h4>
              <div className="text-xs bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(debugResult.sampleJsonRow, null, 2)}</pre>
              </div>
            </div>

            {debugResult.firstDataRow && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2 text-green-700">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Ready for Processing</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  File structure looks compatible. You can now upload it normally.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}