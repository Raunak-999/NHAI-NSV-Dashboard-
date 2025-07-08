import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapFilters } from "@/types/nsv";
import { Filter, Search } from "lucide-react";

interface FilterControlsProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  onApplyFilters: () => void;
}

export function FilterControls({ filters, onFiltersChange, onApplyFilters }: FilterControlsProps) {
  const handleInputChange = (field: string, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleSeverityChange = (severity: keyof typeof filters.severity, checked: boolean) => {
    onFiltersChange({
      ...filters,
      severity: {
        ...filters.severity,
        [severity]: checked,
      },
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          <Filter className="inline mr-2 text-blue-600" />
          Filters
        </h3>
        
        {/* Highway Search */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Highway</Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="e.g., NH-44, NH-1"
              value={filters.highway}
              onChange={(e) => handleInputChange('highway', e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Distress Type */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Distress Type</Label>
          <Select value={filters.distressType} onValueChange={(value) => handleInputChange('distressType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="roughness">Roughness BI</SelectItem>
              <SelectItem value="rutdepth">Rut Depth</SelectItem>
              <SelectItem value="crackarea">Crack Area</SelectItem>
              <SelectItem value="ravelling">Ravelling</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Severity Level */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</Label>
          <div className="space-y-2">
            {[
              { key: 'excellent', label: 'Excellent', color: 'bg-green-500' },
              { key: 'good', label: 'Good', color: 'bg-green-400' },
              { key: 'fair', label: 'Fair', color: 'bg-yellow-500' },
              { key: 'poor', label: 'Poor', color: 'bg-orange-500' },
              { key: 'critical', label: 'Critical', color: 'bg-red-500' },
            ].map((severity) => (
              <div key={severity.key} className="flex items-center space-x-2">
                <Checkbox
                  id={severity.key}
                  checked={filters.severity[severity.key as keyof typeof filters.severity]}
                  onCheckedChange={(checked) => 
                    handleSeverityChange(severity.key as keyof typeof filters.severity, checked as boolean)
                  }
                />
                <Label htmlFor={severity.key} className="text-sm text-gray-700 flex items-center">
                  {severity.label}
                  <div className={`ml-auto w-3 h-3 ${severity.color} rounded-full`}></div>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button onClick={onApplyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
