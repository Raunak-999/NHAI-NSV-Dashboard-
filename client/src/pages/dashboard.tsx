import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/stats-cards";
import { UploadZone } from "@/components/upload-zone";
import { FilterControls } from "@/components/filter-controls";
import { AlertsPanel } from "@/components/alerts-panel";
import { InteractiveMap } from "@/components/interactive-map";
import { ChartsSection } from "@/components/charts-section";
import { DataTable } from "@/components/data-table";
import { DashboardStats, MapFilters } from "@/types/nsv";
import { Construction, Bell, User, Menu, Clock, Activity, Download, FileText, BarChart3, MapPin, Smartphone } from "lucide-react";
import { RealTimeStatus } from "@/components/real-time-status";
import { MobileFieldMode } from "@/components/mobile-field-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    highway: "",
    distressType: "all",
    severity: {
      excellent: true,
      good: true,
      fair: true,
      poor: true,
      critical: true,
    },
    startDate: "",
    endDate: "",
  });

  // Build query params from filters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (filters.highway) params.append('highway', filters.highway);
    if (filters.distressType && filters.distressType !== 'all') params.append('distressType', filters.distressType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    return params.toString();
  };

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: segments, isLoading: segmentsLoading } = useQuery({
    queryKey: [`/api/segments?${buildQueryParams()}`],
  });

  const handleApplyFilters = () => {
    // This will automatically trigger a refetch due to the query key change
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Construction className="h-8 w-8 text-blue-600" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-800">NHAI NSV Dashboard</h1>
                <p className="text-sm text-gray-600">Network Survey Vehicle Monitoring</p>
              </div>
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-gray-800">NSV Dashboard</h1>
              </div>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center space-x-4">
              {/* Alerts Bell */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-800">
                  Field Engineer
                </span>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Activity className="mr-3 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Construction className="mr-3 h-4 w-4" />
              Map View
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Bell className="mr-3 h-4 w-4" />
              Alerts
            </Button>
          </div>
        </div>
      )}

      {/* Real-time Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <RealTimeStatus />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats} isLoading={statsLoading} />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate Summary
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Interactive Map
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Data Upload
              </TabsTrigger>
              <TabsTrigger value="field" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Field Mode
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alert Center
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Filter Controls */}
              <FilterControls
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={handleApplyFilters}
              />

              {/* Charts Section */}
              <ChartsSection stats={stats} isLoading={statsLoading} />

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Data Table */}
                <div className="lg:col-span-2">
                  <DataTable segments={segments || []} isLoading={segmentsLoading} />
                </div>

                {/* Right: Alerts Panel */}
                <div className="lg:col-span-1">
                  <AlertsPanel />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              {/* Filter Controls */}
              <FilterControls
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={handleApplyFilters}
              />

              {/* Interactive Map - Full Width */}
              <InteractiveMap segments={segments || []} isLoading={segmentsLoading} />

              {/* Map Controls Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Map Controls & Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Excellent (Within limits)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm">Good (60-80% limit)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-sm">Fair (80-100% limit)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Critical (Exceeds limit)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              {/* Upload Zone */}
              <UploadZone />

              {/* Upload Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Required Excel Columns:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• NH_Number (Highway identifier)</li>
                        <li>• Chainage_Start & Chainage_End</li>
                        <li>• Lane (L1, L2, R1, R2, etc.)</li>
                        <li>• Latitude & Longitude</li>
                        <li>• Roughness_BI (mm/km)</li>
                        <li>• Rut_Depth (mm)</li>
                        <li>• Crack_Area (%)</li>
                        <li>• Ravelling (%)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Processing Pipeline:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Data validation & parsing</li>
                        <li>• Highway segment creation</li>
                        <li>• GPS coordinate mapping</li>
                        <li>• Threshold analysis</li>
                        <li>• Automatic alert generation</li>
                        <li>• Real-time dashboard updates</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="field" className="space-y-6">
              <MobileFieldMode />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AlertsPanel />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Alert Thresholds</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Roughness BI:</span>
                        <span className="text-red-600">≥ 2,400 mm/km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Rut Depth:</span>
                        <span className="text-red-600">≥ 5 mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Crack Area:</span>
                        <span className="text-red-600">≥ 5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Ravelling:</span>
                        <span className="text-red-600">≥ 1%</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Alert Actions:</h5>
                      <div className="space-y-2">
                        <Button size="sm" className="w-full justify-start">
                          Email Notifications
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          SMS Alerts
                        </Button>
                        <Button size="sm" variant="outline" className="w-full justify-start">
                          Generate Reports
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>© 2025 NHAI Innovation Dashboard</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Last sync: 2 minutes ago</span>
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
