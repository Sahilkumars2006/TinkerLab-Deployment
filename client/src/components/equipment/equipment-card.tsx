import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Settings, Eye } from "lucide-react";
import ReservationForm from "@/components/reservations/reservation-form";
import type { Equipment } from "@shared/schema";

interface EquipmentCardProps {
  equipment: Equipment;
}

const DEFAULT_BADGE = "bg-gray-100 text-gray-800";

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
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
      <Badge className={variants[status as keyof typeof variants] || DEFAULT_BADGE}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      mechanical: "bg-blue-100 text-blue-800",
      electronics: "bg-green-100 text-green-800",
      testing: "bg-purple-100 text-purple-800",
      printing: "bg-orange-100 text-orange-800",
      machining: "bg-red-100 text-red-800",
    };

    return colors[category as keyof typeof colors] || DEFAULT_BADGE;
  };

  const isReservable = equipment.status === "available";

  return (
    <Card className="hover:shadow-md transition-shadow border-gray-200">
      <CardContent className="p-0">
        {/* Equipment Image */}
        <div className="aspect-video w-full bg-gray-200 rounded-t-lg overflow-hidden">
          {equipment.imageUrl ? (
            <img
              src={equipment.imageUrl}
              alt={equipment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Settings className="w-12 h-12 text-gray-400" aria-label="No image available" />
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{equipment.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                {equipment.location}
              </div>
            </div>
            <Badge className={`ml-2 ${getCategoryColor(equipment.category)} capitalize`}>
              {equipment.category.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Description - Fixed with proper type handling */}
          {equipment.description && (
            <p 
              className="text-sm text-gray-600 mb-3 line-clamp-2"
              title={equipment.description}
            >
              {equipment.description}
            </p>
          )}

          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            {getStatusBadge(equipment.status)}

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" aria-label="View details">
                <Eye className="w-4 h-4" />
              </Button>

              {isReservable ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      Reserve
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <ReservationForm
                      preselectedEquipment={equipment}
                      onSuccess={() => {
                        // Optional: toast.success("Reservation successful!");
                      }}
                    />
                  </DialogContent>
                </Dialog>
              ) : (
                <Button size="sm" disabled aria-disabled="true">
                  Reserve
                </Button>
              )}
            </div>
          </div>

          {/* Specifications */}
          {equipment.specifications && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Specifications
              </p>
              <div className="text-xs text-gray-600">
                {typeof equipment.specifications === "object" ? (
                  <div className="space-y-1">
                    {Object.entries(equipment.specifications)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p>{String(equipment.specifications)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}