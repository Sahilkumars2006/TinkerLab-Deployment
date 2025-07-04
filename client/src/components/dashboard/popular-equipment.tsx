import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PopularEquipment() {
  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/dashboard"],
  });

  const popularEquipment = analytics?.popularEquipment || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      available: "bg-green-100 text-green-800",
      in_use: "bg-yellow-100 text-yellow-800",
      maintenance: "bg-red-100 text-red-800",
      out_of_order: "bg-gray-100 text-gray-800",
    };

    const labels = {
      available: "Available",
      in_use: "In Use",
      maintenance: "Maintenance",
      out_of_order: "Out of Order",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Fallback equipment data
  const fallbackEquipment = [
    {
      id: 1,
      name: "3D Printer Model X",
      location: "Lab Room 101",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 2,
      name: "CNC Machine Pro",
      location: "Lab Room 102",
      status: "in_use",
      imageUrl: null,
    },
    {
      id: 3,
      name: "Soldering Station A",
      location: "Lab Room 103",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    },
    {
      id: 4,
      name: "Testing Rig Alpha",
      location: "Lab Room 104",
      status: "available",
      imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    },
  ];

  const equipmentToShow = popularEquipment.length > 0 ? popularEquipment : fallbackEquipment;

  return (
    <Card className="border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Popular Equipment</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All Equipment
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {equipmentToShow.slice(0, 4).map((equipment: any) => (
            <div key={equipment.id || equipment.equipmentId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {equipment.imageUrl ? (
                <img
                  src={equipment.imageUrl}
                  alt={equipment.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
              <h4 className="font-medium text-gray-900 mb-1">{equipment.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{equipment.location}</p>
              <div className="flex items-center justify-between">
                {getStatusBadge(equipment.status)}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-primary hover:text-primary/80"
                  disabled={equipment.status !== "available"}
                >
                  Reserve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
