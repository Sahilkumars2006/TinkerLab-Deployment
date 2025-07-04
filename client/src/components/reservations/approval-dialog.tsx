import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, Clock, User, MapPin } from "lucide-react";
import { format } from "date-fns";

interface ApprovalDialogProps {
  reservation: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ApprovalDialog({ reservation, open, onOpenChange, onSuccess }: ApprovalDialogProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const approvalMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      await apiRequest("PATCH", `/api/reservations/${reservation.id}/approve`, { status, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reservations/pending"] });
      toast({
        title: "Success",
        description: `Reservation ${isApproving ? "approved" : "rejected"} successfully`,
      });
      onSuccess();
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reservation status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    setIsApproving(true);
    approvalMutation.mutate({ status: "approved", notes });
  };

  const handleReject = () => {
    setIsApproving(false);
    approvalMutation.mutate({ status: "rejected", notes: notes || "Rejected by supervisor" });
  };

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Reservation Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reservation Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">{reservation.equipment?.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown User'}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {reservation.equipment?.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(reservation.startTime), "MMM dd, yyyy")}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                {format(new Date(reservation.startTime), "hh:mm a")} - {format(new Date(reservation.endTime), "hh:mm a")}
              </div>
            </div>

            <div className="mt-3">
              <Badge className="bg-yellow-100 text-yellow-800">
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Purpose of Use</Label>
            <div className="mt-1 p-3 bg-white border border-gray-200 rounded-md">
              <p className="text-sm text-gray-900">{reservation.purpose}</p>
            </div>
          </div>

          {/* User Information */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Requested By</Label>
            <div className="mt-1 p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {reservation.user ? `${reservation.user.firstName} ${reservation.user.lastName}` : 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-600">{reservation.user?.email}</p>
                  <p className="text-xs text-gray-500">
                    Requested {format(new Date(reservation.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Decision Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any comments or conditions for this decision..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={approvalMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              {approvalMutation.isPending && !isApproving ? "Rejecting..." : "Reject"}
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={approvalMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              {approvalMutation.isPending && isApproving ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
