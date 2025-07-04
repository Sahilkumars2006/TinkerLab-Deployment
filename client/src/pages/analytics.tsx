import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Calendar, Clock, Users } from "lucide-react";

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading, error } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
    enabled: isAuthenticated,
  });

  const { data: utilization = [] } = useQuery({
    queryKey: ["/api/analytics/equipment-utilization"],
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  // Sample data for charts
  const monthlyUsage = [
    { month: 'Jan', reservations: 45, usage: 120 },
    { month: 'Feb', reservations: 52, usage: 135 },
    { month: 'Mar', reservations: 48, usage: 128 },
    { month: 'Apr', reservations: 61, usage: 155 },
    { month: 'May', reservations: 55, usage: 142 },
    { month: 'Jun', reservations: 67, usage: 168 },
  ];

  const equipmentCategoryData = [
    { category: 'Mechanical', count: 8, color: '#2196F3' },
    { category: 'Electronics', count: 6, color: '#4CAF50' },
    { category: 'Testing', count: 4, color: '#FF9800' },
    { category: '3D Printing', count: 3, color: '#9C27B0' },
    { category: 'Machining', count: 3, color: '#F44336' },
  ];

  const dailyUsage = [
    { day: 'Mon', hours: 45 },
    { day: 'Tue', hours: 52 },
    { day: 'Wed', hours: 48 },
    { day: 'Thu', hours: 61 },
    { day: 'Fri', hours: 38 },
    { day: 'Sat', hours: 25 },
    { day: 'Sun', hours: 15 },
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <Header 
          title="Analytics Dashboard"
          description="Insights into equipment utilization, usage patterns, and lab efficiency."
        />
        
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reservations</p>
                    <p className="text-3xl font-bold text-gray-900">328</p>
                    <p className="text-sm text-green-600 mt-1">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      +12% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Usage Hours</p>
                    <p className="text-3xl font-bold text-gray-900">1,248</p>
                    <p className="text-sm text-green-600 mt-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      +8% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold text-gray-900">156</p>
                    <p className="text-sm text-green-600 mt-1">
                      <Users className="w-4 h-4 inline mr-1" />
                      +5% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Session</p>
                    <p className="text-3xl font-bold text-gray-900">3.8h</p>
                    <p className="text-sm text-yellow-600 mt-1">
                      <Clock className="w-4 h-4 inline mr-1" />
                      -2% from last month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reservations" fill="#2196F3" name="Reservations" />
                    <Bar dataKey="usage" fill="#4CAF50" name="Usage Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equipment Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={equipmentCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, count }) => `${category}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {equipmentCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Daily Usage Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="hours" 
                      stroke="#2196F3" 
                      strokeWidth={2}
                      dot={{ fill: '#2196F3' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Equipment Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Top Equipment by Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {utilization.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.equipmentId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.totalReservations || 0}</p>
                        <p className="text-sm text-gray-600">reservations</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total Reservations</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Usage Hours</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilization.map((item: any) => (
                      <tr key={item.equipmentId} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 capitalize">{item.category}</td>
                        <td className="py-3 px-4">{item.totalReservations || 0}</td>
                        <td className="py-3 px-4">{Math.round((item.totalUsageHours || 0) / 60)}h</td>
                        <td className="py-3 px-4">{Math.round(item.avgUsageDuration || 0)}min</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
