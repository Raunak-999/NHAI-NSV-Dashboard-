import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/types/nsv";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { PieChart as PieChartIcon, TrendingUp } from "lucide-react";

interface ChartsSectionProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const COLORS = ['#F44336', '#FF9800', '#FFC107', '#2196F3'];

export function ChartsSection({ stats, isLoading }: ChartsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">No chart data available</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare distress distribution data for pie chart
  const distressData = stats.distressDistribution.map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.percentage,
    count: item.count,
  }));

  // Sample trend data (in a real app, this would come from the API)
  const trendData = [
    { name: 'Mon', value: 2100 },
    { name: 'Tue', value: 2050 },
    { name: 'Wed', value: 1980 },
    { name: 'Thu', value: 1920 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 1850 },
    { name: 'Sun', value: 1800 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}: ${payload[0].value}%`}</p>
          <p className="text-sm text-gray-600">{`Count: ${payload[0].payload.count}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Distress Distribution Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <PieChartIcon className="inline mr-2 text-blue-600" />
            Distress Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {distressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {distressData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-gray-600">{item.name} ({item.value.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis Chart */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <TrendingUp className="inline mr-2 text-blue-600" />
            7-Day Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any) => [`${value} mm/km`, 'Average Roughness']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1976D2" 
                  strokeWidth={3}
                  dot={{ fill: '#1976D2', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#1976D2', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
            <span>Average roughness improving by 2.3%</span>
            <span className="text-green-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trend Up
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
