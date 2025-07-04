import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bolt, Calendar, AlertTriangle, UserPlus } from "lucide-react";

export default function RecentActivity() {
  // Mock data - in real app this would come from API
  const activities = [
    {
      id: 1,
      type: "checkout",
      user: "John Smith",
      equipment: "3D Printer Model X",
      timestamp: "2 minutes ago",
      status: "checked_out",
      icon: Bolt,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: 2,
      type: "approval",
      user: "Dr. Wilson",
      equipment: "CNC Machine Pro",
      timestamp: "15 minutes ago",
      status: "approved",
      icon: Calendar,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      id: 3,
      type: "maintenance",
      user: "System",
      equipment: "Soldering Station A",
      timestamp: "1 hour ago",
      status: "maintenance",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      id: 4,
      type: "training",
      user: "Emily Davis",
      equipment: "Testing Equipment",
      timestamp: "2 hours ago",
      status: "training",
      icon: UserPlus,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      checked_out: "bg-green-100 text-green-800",
      approved: "bg-green-100 text-green-800",
      maintenance: "bg-red-100 text-red-800",
      training: "bg-primary/10 text-primary",
    };

    const labels = {
      checked_out: "Checked Out",
      approved: "Approved",
      maintenance: "Maintenance",
      training: "Training",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getActivityMessage = (activity: any) => {
    switch (activity.type) {
      case "checkout":
        return (
          <>
            <span className="font-medium">{activity.user}</span> checked out{" "}
            <span className="font-medium">{activity.equipment}</span>
          </>
        );
      case "approval":
        return (
          <>
            <span className="font-medium">{activity.user}</span> approved reservation for{" "}
            <span className="font-medium">{activity.equipment}</span>
          </>
        );
      case "maintenance":
        return (
          <>
            <span className="font-medium">{activity.equipment}</span> maintenance required
          </>
        );
      case "training":
        return (
          <>
            <span className="font-medium">{activity.user}</span> completed safety training for{" "}
            <span className="font-medium">{activity.equipment}</span>
          </>
        );
      default:
        return `${activity.user} performed action on ${activity.equipment}`;
    }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {getActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
