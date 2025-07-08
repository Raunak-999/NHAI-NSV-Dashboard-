import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Mic, FileText, Navigation } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import type { SegmentWithRelations } from '@shared/schema';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function MobileFieldMode() {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [nearbySegments, setNearbySegments] = useState<SegmentWithRelations[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Fetch all segments
  const { data: segments = [] } = useQuery({
    queryKey: ['/api/segments'],
    queryFn: getQueryFn<SegmentWithRelations[]>({ on401: 'throw' }),
  });

  // Find nearby segments when location changes
  useEffect(() => {
    if (!location || !segments.length) return;

    const nearby = segments.filter(segment => {
      // Calculate distance using Haversine formula (simplified)
      const avgLat = segment.lanes.reduce((sum, lane) => sum + parseFloat(lane.latitude), 0) / segment.lanes.length;
      const avgLng = segment.lanes.reduce((sum, lane) => sum + parseFloat(lane.longitude), 0) / segment.lanes.length;
      
      const distance = Math.sqrt(
        Math.pow(location.latitude - avgLat, 2) + 
        Math.pow(location.longitude - avgLng, 2)
      );
      
      return distance < 0.1; // Within ~10km radius
    });

    setNearbySegments(nearby);
  }, [location, segments]);

  const handlePhotoCapture = () => {
    setIsCapturing(true);
    // Simulate photo capture
    setTimeout(() => {
      setIsCapturing(false);
      alert('📸 Photo captured with GPS coordinates!');
    }, 2000);
  };

  const handleVoiceNote = () => {
    alert('🎤 Voice recording started (Demo mode)');
  };

  const handleNavigate = (segment: SegmentWithRelations) => {
    if (segment.lanes.length > 0) {
      const lat = parseFloat(segment.lanes[0].latitude);
      const lng = parseFloat(segment.lanes[0].longitude);
      const url = `https://maps.google.com/?q=${lat},${lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Field Inspection Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {location ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Latitude:</span>
                <br />
                {location.latitude.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Longitude:</span>
                <br />
                {location.longitude.toFixed(6)}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Accuracy:</span> ±{location.accuracy.toFixed(0)}m
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              📍 Getting your location...
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handlePhotoCapture} 
              disabled={isCapturing}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isCapturing ? 'Capturing...' : 'Take Photo'}
            </Button>
            <Button onClick={handleVoiceNote} variant="outline" className="flex-1">
              <Mic className="h-4 w-4 mr-2" />
              Voice Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nearby Highway Segments ({nearbySegments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {nearbySegments.length > 0 ? (
            nearbySegments.map((segment) => {
              const criticalAlerts = segment.lanes.flatMap(lane => lane.alerts).filter(alert => alert.severity === 'critical').length;
              
              return (
                <div key={segment.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{segment.highway.nhNumber}</h4>
                      <p className="text-sm text-muted-foreground">
                        Chainage: {segment.chainageStart} - {segment.chainageEnd}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {segment.lanes.length} lanes
                      </p>
                    </div>
                    <div className="text-right">
                      {criticalAlerts > 0 && (
                        <Badge variant="destructive">{criticalAlerts} Critical</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleNavigate(segment)}
                      className="flex-1"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-3 w-3 mr-1" />
                      Inspect
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No highway segments nearby
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}