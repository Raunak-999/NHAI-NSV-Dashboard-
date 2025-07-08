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
import { Construction, Bell, User, Menu, Clock, Activity } from "lucide-react";

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <UploadZone />
            <FilterControls
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
            <AlertsPanel />
          </div>

          {/* Right Column - Map and Charts */}
          <div className="lg:col-span-2 space-y-6">
            <InteractiveMap segments={segments || []} isLoading={segmentsLoading} />
            <ChartsSection stats={stats} isLoading={statsLoading} />
          </div>
        </div>

        {/* Data Table */}
        <DataTable segments={segments || []} isLoading={segmentsLoading} />
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
