import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/types/nsv";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AlertsPanel() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/alerts?limit=5&resolved=false'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-200 text-red-800';
      case 'poor': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'fair': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'good': return 'bg-green-100 border-green-200 text-green-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'roughness': return 'Roughness BI';
      case 'rutdepth': return 'Rut Depth';
      case 'crackarea': return 'Crack Area';
      case 'ravelling': return 'Ravelling';
      default: return type;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            <AlertTriangle className="inline mr-2 text-yellow-600" />
            Recent Alerts
          </h3>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
        
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">No active alerts</p>
            <p className="text-sm text-gray-500">All systems are functioning normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert: Alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium">
                        {getAlertTypeLabel(alert.alertType)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {alert.message || `Value: ${alert.actualValue} (Threshold: ${alert.thresholdValue})`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : 'Just now'}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2">
                    <div className={`w-full h-full rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' : 
                      alert.severity === 'poor' ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
