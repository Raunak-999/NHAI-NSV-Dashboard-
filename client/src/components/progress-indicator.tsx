import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Upload, Database, BarChart3, Bell } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ProgressIndicatorProps {
  isUploading: boolean;
  uploadProgress: number;
}

export function ProgressIndicator({ isUploading, uploadProgress }: ProgressIndicatorProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'upload', label: 'File Upload', icon: <Upload className="h-4 w-4" />, completed: false },
    { id: 'parse', label: 'Data Parsing', icon: <Database className="h-4 w-4" />, completed: false },
    { id: 'process', label: 'Analytics Processing', icon: <BarChart3 className="h-4 w-4" />, completed: false },
    { id: 'alerts', label: 'Alert Generation', icon: <Bell className="h-4 w-4" />, completed: false }
  ]);

  useEffect(() => {
    if (!isUploading) {
      setSteps(prev => prev.map(step => ({ ...step, completed: false })));
      return;
    }

    // Simulate step progression based on upload progress
    const newSteps = [...steps];
    
    if (uploadProgress >= 25) newSteps[0].completed = true;
    if (uploadProgress >= 50) newSteps[1].completed = true;
    if (uploadProgress >= 75) newSteps[2].completed = true;
    if (uploadProgress >= 100) newSteps[3].completed = true;
    
    setSteps(newSteps);
  }, [uploadProgress, isUploading]);

  if (!isUploading && uploadProgress === 0) return null;

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Processing NSV Data...</span>
            <span>{uploadProgress}%</span>
          </div>
          
          <Progress value={uploadProgress} className="h-2" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  step.completed ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  step.icon
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
          
          {uploadProgress === 100 && (
            <div className="text-center text-green-600 font-medium">
              ✅ Processing complete! Dashboard updating...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}