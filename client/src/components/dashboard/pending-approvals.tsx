import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, X, User } from "lucide-react";

export default function PendingApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pendingReservations = [] } = useQuery({
    queryKey: ["/api/reservations/pending"],
    enabled: user?.role !== 'student',
  });

  const approvalMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      await apiRequest("PATCH", `/api/reservations/${id}/approve`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations/pending"] });
      toast({
        title: "Success",
        description: "Reservation status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reservation status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: number) => {
    approvalMutation.mutate({ id, status: "approved" });
  };

  const handleReject = (id: number) => {
    approvalMutation.mutate({ id, status: "rejected", notes: "Rejected by supervisor" });
  };

  if (user?.role === 'student') {
    return null;
  }

  return (
    <Card className="border-gray-100">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Pending Approvals</CardTitle>
          {pendingReservations.length > 0 && (
            <Badge className="bg-red-100 text-red-800">
              {pendingReservations.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {pendingReservations.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReservations.slice(0, 3).map((reservation: any) => (
              <div key={reservation.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={reservation.user?.profileImageUrl} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {reservation.user?.firstName} {reservation.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {reservation.equipment?.name} - 3 hours
                  </p>
                  <p className="text-xs text-gray-400">
                    Requested {new Date(reservation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-6 h-6 p-0 bg-green-100 text-green-600 border-green-200 hover:bg-green-200"
                    onClick={() => handleApprove(reservation.id)}
                    disabled={approvalMutation.isPending}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-6 h-6 p-0 bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                    onClick={() => handleReject(reservation.id)}
                    disabled={approvalMutation.isPending}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            {pendingReservations.length > 3 && (
              <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary/80">
                View All Pending Requests
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
