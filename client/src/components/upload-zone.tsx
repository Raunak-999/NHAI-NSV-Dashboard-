import { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CloudUpload, File, CheckCircle, AlertCircle, X, Clock } from "lucide-react";
import { ProgressIndicator } from './progress-indicator';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [uploadStats, setUploadStats] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadStage('Starting upload...');
      setUploadStats(null);
      setEstimatedTime(Math.ceil(file.size / (1024 * 100))); // Rough estimate: 100KB/sec

      const formData = new FormData();
      formData.append('file', file);
      
      // Create abort controller for user cancellation (no automatic timeout)
      abortControllerRef.current = new AbortController();
      // Removed automatic timeout - let large files process as needed

      try {
        const startTime = Date.now();
        
        // Upload progress simulation
        setUploadProgress(15);
        setUploadStage('Uploading file...');
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal,
        });

        // No timeout to clear - processing continues until complete

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        // Processing stages with progress updates
        setUploadProgress(30);
        setUploadStage('File uploaded, parsing data...');
        await new Promise(resolve => setTimeout(resolve, 800));

        setUploadProgress(60);
        setUploadStage('Processing segments and lanes...');
        await new Promise(resolve => setTimeout(resolve, 1200));

        setUploadProgress(85);
        setUploadStage('Saving to database...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const result = await response.json();
        
        setUploadProgress(100);
        setUploadStage('Complete!');
        setUploadStats(result);

        const processingTime = Date.now() - startTime;
        result.clientProcessingTime = processingTime;

        return result;
      } catch (error) {
        // Handle user cancellation or network errors
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStage('');
        setEstimatedTime(0);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Keep success state visible for 3 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setUploadStage('');
        setUploadStats(null);
        setEstimatedTime(0);
      }, 3000);

      const processingTime = data.stats?.processingTimeMs || data.clientProcessingTime || 0;
      
      toast({
        title: "File processed successfully",
        description: `Processed: ${data.processed.segments} segments, ${data.processed.lanes} lanes, ${data.processed.alerts} alerts in ${(processingTime/1000).toFixed(1)}s`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/segments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStage('');
      setUploadStats(null);
      setEstimatedTime(0);
      
      let errorMessage = error.message;
      
      // Provide specific error guidance
      if (error.message.includes('too large')) {
        errorMessage = 'File too large. Maximum size is 50MB.';
      } else if (error.message.includes('No valid data')) {
        errorMessage = 'No valid data found. Please check the Excel format using the debugger.';
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFile(target.files[0]);
      }
    };
    input.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <CloudUpload className="inline mr-2 text-blue-600" />
          Upload NSV Data
        </h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          {uploadMutation.isPending ? (
            <div className="space-y-3">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm font-medium text-gray-600">Processing file...</p>
            </div>
          ) : (
            <>
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600">
                Drop Excel files here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports .xlsx, .xls files up to 50MB
              </p>
            </>
          )}
        </div>

        {isUploading && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-medium">{uploadStage}</span>
              <span className="text-blue-600">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full h-2" />
            
            {estimatedTime > 0 && uploadProgress < 100 && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Processing...</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{Math.max(1, Math.ceil(estimatedTime * (100 - uploadProgress) / 100))}s remaining
                </span>
              </div>
            )}

            {uploadStats && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm space-y-1">
                  <p className="font-medium text-green-800">Processing Complete!</p>
                  <p className="text-green-700">
                    Processed {uploadStats.processed.segments} segments, {uploadStats.processed.lanes} lanes, {uploadStats.processed.alerts} alerts
                  </p>
                  {uploadStats.stats && (
                    <p className="text-green-600 text-xs">
                      {uploadStats.stats.recordsPerSecond} records/sec • {(uploadStats.stats.processingTimeMs/1000).toFixed(1)}s total
                    </p>
                  )}
                </div>
              </div>
            )}

            {uploadProgress < 100 && (
              <div className="text-center">
                <Button variant="outline" size="sm" onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                  setIsUploading(false);
                  setUploadProgress(0);
                  setUploadStage('');
                  setUploadStats(null);
                  setEstimatedTime(0);
                }} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel Upload
                </Button>
              </div>
            )}
          </div>
        )}

        {uploadMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">Upload failed. Please try again.</span>
          </div>
        )}

        {uploadMutation.isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm text-green-700">File processed successfully!</span>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Excel Format:</h4>
          <div className="text-xs text-blue-600 space-y-1">
            <div>• NH_Number, Chainage_Start, Chainage_End</div>
            <div>• Lane, Latitude, Longitude</div>
            <div>• Roughness_BI, Rut_Depth, Crack_Area, Ravelling</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
