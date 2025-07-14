import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAnalytics } from "@shared/schema";

export default function EquipmentStatus() {
  const { data: analytics } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const equipment = analytics?.stats?.equipment || {
    available: 16,
    inUse: 6,
    maintenance: 2,
    total: 24,
  };

  const utilization = Math.round(((equipment.inUse || 0) / (equipment.total || 1)) * 100);

  const statusItems = [
    {
      label: "Available",
      count: equipment.available || 0,
      color: "bg-green-500",
    },
    {
      label: "In Use",
      count: equipment.inUse || 0,
      color: "bg-yellow-500",
    },
    {
      label: "Maintenance",
      count: equipment.maintenance || 0,
      color: "bg-red-500",
    },
  ];

  return (
    <Card className="border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-900">Equipment Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Lab Utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${utilization}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
