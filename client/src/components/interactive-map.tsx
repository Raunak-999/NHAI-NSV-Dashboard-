import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SegmentWithRelations } from "@/types/nsv";
import { convertSegmentsToMapData, getSeverityColor, formatDistressValue } from "@/lib/map-utils";
import { Map, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react";

interface InteractiveMapProps {
  segments: SegmentWithRelations[];
  isLoading: boolean;
}

declare global {
  interface Window {
    L: any;
  }
}

export function InteractiveMap({ segments, isLoading }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<'segments' | 'alerts' | 'traffic'>('segments');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (!window.L) {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setIsMapLoaded(true);
        document.head.appendChild(script);
      } else {
        setIsMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.L) return;

    // Initialize map if not already done
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView([28.6139, 77.2090], 6);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing layers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer.options && layer.options.className === 'highway-segment') {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add segment data to map
    if (segments && segments.length > 0) {
      const mapSegments = convertSegmentsToMapData(segments);
      
      mapSegments.forEach(segment => {
        if (segment.coordinates.length > 0) {
          const polyline = window.L.polyline(segment.coordinates, {
            color: getSeverityColor(segment.severity),
            weight: 6,
            opacity: 0.8,
            className: 'highway-segment'
          }).addTo(mapInstanceRef.current);

          // Create popup content
          const popupContent = `
            <div class="p-2">
              <h4 class="font-semibold text-gray-800">${segment.highway}</h4>
              <p class="text-sm text-gray-600">Chainage: ${segment.chainage}</p>
              <div class="mt-2 space-y-1 text-xs">
                <div>Roughness: ${formatDistressValue('roughness', segment.distressData.roughness || 0)}</div>
                <div>Rut Depth: ${formatDistressValue('rutdepth', segment.distressData.rutDepth || 0)}</div>
                <div>Crack Area: ${formatDistressValue('crackarea', segment.distressData.crackArea || 0)}</div>
                <div>Ravelling: ${formatDistressValue('ravelling', segment.distressData.ravelling || 0)}</div>
              </div>
              <div class="mt-2">
                <span class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full" 
                      style="background-color: ${getSeverityColor(segment.severity)}20; color: ${getSeverityColor(segment.severity)}">
                  ${segment.severity.charAt(0).toUpperCase() + segment.severity.slice(1)}
                </span>
              </div>
            </div>
          `;

          polyline.bindPopup(popupContent);
        }
      });

      // Fit map to show all segments
      if (mapSegments.length > 0) {
        const allCoords = mapSegments.flatMap(s => s.coordinates);
        if (allCoords.length > 0) {
          const bounds = window.L.latLngBounds(allCoords);
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapLoaded, segments]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleLocateUser = () => {
    if (mapInstanceRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 12);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Loading map...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              <Map className="inline mr-2 text-blue-600" />
              Highway Network
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeLayer === 'segments' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('segments')}
              >
                Segments
              </Button>
              <Button
                variant={activeLayer === 'alerts' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('alerts')}
              >
                Alerts
              </Button>
              <Button
                variant={activeLayer === 'traffic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveLayer('traffic')}
              >
                Traffic
              </Button>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div ref={mapRef} className="h-96 w-full"></div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-3 text-xs">
            <div className="font-medium text-gray-800 mb-2">Distress Level</div>
            <div className="space-y-1">
              {[
                { label: 'Excellent', color: '#4CAF50' },
                { label: 'Good', color: '#8BC34A' },
                { label: 'Fair', color: '#FFC107' },
                { label: 'Poor', color: '#FF9800' },
                { label: 'Critical', color: '#F44336' },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleLocateUser}
            >
              <Locate className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
