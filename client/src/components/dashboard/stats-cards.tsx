import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, Clock, CheckCircle } from "lucide-react";
import type { DashboardAnalytics } from "@shared/schema";

export default function StatsCards() {
  const { data: analytics } = useQuery<DashboardAnalytics>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const stats = [
    {
      title: "Total Equipment",
      value: analytics?.stats?.equipment?.total || 24,
      change: "+12% from last month",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Active Reservations",
      value: analytics?.stats?.reservations?.active || 8,
      change: "3 expiring today",
      changeType: "warning" as const,
      icon: Calendar,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Pending Approvals",
      value: analytics?.stats?.reservations?.pending || 5,
      change: "2 urgent",
      changeType: "negative" as const,
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      title: "Available Now",
      value: analytics?.stats?.equipment?.available || 16,
      change: "Ready to use",
      changeType: "positive" as const,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  const getChangeColor = (type: "positive" | "negative" | "warning") => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = (type: "positive" | "negative" | "warning") => {
    switch (type) {
      case "positive":
        return <TrendingUp className="w-4 h-4 inline mr-1" />;
      case "negative":
        return <TrendingUp className="w-4 h-4 inline mr-1 rotate-180" />;
      case "warning":
        return <Clock className="w-4 h-4 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm mt-1 ${getChangeColor(stat.changeType)}`}>
                    {getChangeIcon(stat.changeType)}
                    {stat.change}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
