import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ReservationForm from "@/components/reservations/reservation-form";
import ApprovalDialog from "@/components/reservations/approval-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, Plus, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { Reservation } from "@shared/schema";

export default function ReservationsPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my-reservations");

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

  const { data: reservations = [], isLoading: reservationsLoading, error, refetch } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations"],
    enabled: isAuthenticated,
  });

  const { data: pendingReservations = [] } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations/pending"],
    enabled: isAuthenticated && user?.role !== 'student',
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

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleApproval = (reservation: any) => {
    setSelectedReservation(reservation);
    setApprovalDialogOpen(true);
  };

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
          title="Reservations"
          description="Manage equipment reservations and approval workflows."
        />
        
        <div className="p-6">
          <Tabs defaultValue="my-reservations" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="my-reservations">My Reservations</TabsTrigger>
                {user?.role !== 'student' && (
                  <>
                    <TabsTrigger value="all-reservations">All Reservations</TabsTrigger>
                    <TabsTrigger value="pending-approval">
                      Pending Approval
                      {pendingReservations.length > 0 && (
                        <Badge className="ml-2 bg-red-500 text-white">
                          {pendingReservations.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Reservation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <ReservationForm onSuccess={() => refetch()} />
                </DialogContent>
              </Dialog>
            </div>

            <TabsContent value="my-reservations" className="space-y-4">
              {reservationsLoading ? (
                <div className="grid gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-6 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                  <p className="text-gray-600 mb-4">You haven't made any equipment reservations yet.</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Make Your First Reservation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <ReservationForm onSuccess={() => refetch()} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reservations.map((reservation: any) => (
                    <Card key={reservation.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{reservation.equipment?.name}</h3>
                            <p className="text-gray-600">{reservation.purpose}</p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {format(new Date(reservation.startTime), "MMM dd, yyyy")}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {format(new Date(reservation.startTime), "hh:mm a")} - {format(new Date(reservation.endTime), "hh:mm a")}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {reservation.equipment?.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'You'}
                          </div>
                        </div>
                        
                        {reservation.approvalNotes && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600"><strong>Notes:</strong> {reservation.approvalNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {user?.role !== 'student' && (
              <>
                <TabsContent value="all-reservations" className="space-y-4">
                  <div className="grid gap-4">
                    {reservations.map((reservation: any) => (
                      <Card key={reservation.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{reservation.equipment?.name}</h3>
                              <p className="text-gray-600">{reservation.purpose}</p>
                            </div>
                            {getStatusBadge(reservation.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(new Date(reservation.startTime), "MMM dd, yyyy")}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-4 h-4 mr-2" />
                              {format(new Date(reservation.startTime), "hh:mm a")} - {format(new Date(reservation.endTime), "hh:mm a")}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              {reservation.equipment?.location}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown User'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="pending-approval" className="space-y-4">
                  {pendingReservations.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-600">No pending reservations require approval.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {pendingReservations.map((reservation: any) => (
                        <Card key={reservation.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{reservation.equipment?.name}</h3>
                                <p className="text-gray-600">{reservation.purpose}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(reservation.status)}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproval(reservation)}
                                >
                                  Review
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                {format(new Date(reservation.startTime), "MMM dd, yyyy")}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                {format(new Date(reservation.startTime), "hh:mm a")} - {format(new Date(reservation.endTime), "hh:mm a")}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {reservation.equipment?.location}
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="w-4 h-4 mr-2" />
                                {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown User'}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
      
      {/* Approval Dialog */}
      <ApprovalDialog
        reservation={selectedReservation}
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        onSuccess={() => {
          refetch();
          setApprovalDialogOpen(false);
        }}
      />
    </div>
  );
}
