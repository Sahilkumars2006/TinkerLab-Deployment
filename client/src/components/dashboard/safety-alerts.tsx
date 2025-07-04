import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bolt } from "lucide-react";

export default function SafetyAlerts() {
  // Mock data - in real app this would come from API
  const alerts = [
    {
      id: 1,
      type: "training",
      title: "Equipment Training Required",
      message: "3 users need safety training before using CNC machines",
      severity: "warning",
    },
    {
      id: 2,
      type: "maintenance",
      title: "Maintenance Overdue",
      message: "Soldering Station A requires immediate inspection",
      severity: "error",
    },
  ];

  const getAlertStyles = (severity: string) => {
    switch (severity) {
      case "error":
        return {
          container: "bg-red-50 border-red-200",
          icon: "text-red-600",
          title: "text-red-800",
          message: "text-red-700",
        };
      case "warning":
        return {
          container: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-600",
          title: "text-yellow-800",
          message: "text-yellow-700",
        };
      default:
        return {
          container: "bg-blue-50 border-blue-200",
          icon: "text-blue-600",
          title: "text-blue-800",
          message: "text-blue-700",
        };
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return Bolt;
      default:
        return AlertTriangle;
    }
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-900">Safety Alerts</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const styles = getAlertStyles(alert.severity);
            const Icon = getAlertIcon(alert.type);
            
            return (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border ${styles.container}`}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
                <div>
                  <p className={`text-sm font-medium ${styles.title}`}>
                    {alert.title}
                  </p>
                  <p className={`text-xs ${styles.message}`}>
                    {alert.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
