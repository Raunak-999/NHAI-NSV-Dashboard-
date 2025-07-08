import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SegmentWithRelations } from "@/types/nsv";
import { Search, Download, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DataTableProps {
  segments: SegmentWithRelations[];
  isLoading: boolean;
}

export function DataTable({ segments, isLoading }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter segments based on search query
  const filteredSegments = segments.filter(segment =>
    segment.highway.nhNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    segment.highway.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${segment.chainageStart}-${segment.chainageEnd}`.includes(searchQuery)
  );

  // Paginate results
  const totalPages = Math.ceil(filteredSegments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSegments = filteredSegments.slice(startIndex, startIndex + itemsPerPage);

  // Calculate segment statistics
  const getSegmentStats = (segment: SegmentWithRelations) => {
    const lanes = segment.lanes;
    if (lanes.length === 0) return { avgRoughness: 0, avgRutDepth: 0, avgCrackArea: 0, worstSeverity: 'good' };

    const avgRoughness = lanes.reduce((sum, lane) => 
      sum + (lane.roughnessBI ? parseFloat(lane.roughnessBI) : 0), 0) / lanes.length;
    const avgRutDepth = lanes.reduce((sum, lane) => 
      sum + (lane.rutDepth ? parseFloat(lane.rutDepth) : 0), 0) / lanes.length;
    const avgCrackArea = lanes.reduce((sum, lane) => 
      sum + (lane.crackArea ? parseFloat(lane.crackArea) : 0), 0) / lanes.length;

    // Find worst severity from alerts
    let worstSeverity = 'excellent';
    const severityLevels = { excellent: 0, good: 1, fair: 2, poor: 3, critical: 4 };
    
    lanes.forEach(lane => {
      lane.alerts.forEach(alert => {
        if (severityLevels[alert.severity as keyof typeof severityLevels] > 
            severityLevels[worstSeverity as keyof typeof severityLevels]) {
          worstSeverity = alert.severity;
        }
      });
    });

    return { avgRoughness, avgRutDepth, avgCrackArea, worstSeverity };
  };

  const getSeverityBadge = (severity: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive',
      critical: 'destructive',
    };

    const colors: { [key: string]: string } = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-green-100 text-green-700',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[severity] || colors.good}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Highway', 'Chainage', 'Lanes', 'Avg Roughness', 'Avg Rut Depth', 'Avg Crack Area', 'Status', 'Survey Date'];
    const csvContent = [
      headers.join(','),
      ...filteredSegments.map(segment => {
        const stats = getSegmentStats(segment);
        return [
          segment.highway.nhNumber,
          `${segment.chainageStart}-${segment.chainageEnd}`,
          segment.lanes.length,
          stats.avgRoughness.toFixed(1),
          stats.avgRutDepth.toFixed(2),
          stats.avgCrackArea.toFixed(1),
          stats.worstSeverity,
          new Date(segment.surveyDate).toLocaleDateString()
        ].join(',');
      })
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'highway-segments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="animate-pulse">
            <div className="h-16 bg-gray-200 border-b"></div>
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Highway Segments
            </h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search segments..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-8 w-64"
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Highway</TableHead>
                <TableHead>Chainage</TableHead>
                <TableHead>Lanes</TableHead>
                <TableHead>Roughness</TableHead>
                <TableHead>Rut Depth</TableHead>
                <TableHead>Crack Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Survey Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSegments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No segments found matching your search.' : 'No segments available.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSegments.map((segment) => {
                  const stats = getSegmentStats(segment);
                  return (
                    <TableRow key={segment.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {segment.highway.nhNumber}
                      </TableCell>
                      <TableCell>
                        {segment.chainageStart}-{segment.chainageEnd}
                      </TableCell>
                      <TableCell>
                        {segment.lanes.length} lanes
                      </TableCell>
                      <TableCell>
                        {stats.avgRoughness.toFixed(0)} mm/km
                      </TableCell>
                      <TableCell>
                        {stats.avgRutDepth.toFixed(1)} mm
                      </TableCell>
                      <TableCell>
                        {stats.avgCrackArea.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        {getSeverityBadge(stats.worstSeverity)}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(segment.surveyDate), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSegments.length)} of {filteredSegments.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 p-0"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
