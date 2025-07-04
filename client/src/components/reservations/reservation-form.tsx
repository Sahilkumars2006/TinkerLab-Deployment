import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import type { Equipment } from "@shared/schema";

const reservationSchema = z.object({
  equipmentId: z.number({ required_error: "Please select equipment" }),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  startTime: z.string({ required_error: "Start time is required" }),
  endTime: z.string({ required_error: "End time is required" }),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type ReservationFormData = z.infer<typeof reservationSchema>;

interface ReservationFormProps {
  preselectedEquipment?: Equipment;
  onSuccess: () => void;
}

export default function ReservationForm({ preselectedEquipment, onSuccess }: ReservationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | undefined>(preselectedEquipment?.id);

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      equipmentId: preselectedEquipment?.id,
      purpose: "",
      startTime: "",
      endTime: "",
    },
  });

  const createReservationMutation = useMutation({
    mutationFn: async (data: ReservationFormData) => {
      await apiRequest("POST", "/api/reservations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      toast({
        title: "Reservation Created",
        description: "Your reservation request has been submitted for approval.",
      });
      onSuccess();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create reservation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReservationFormData) => {
    createReservationMutation.mutate(data);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      dates.push({
        value: format(date, "yyyy-MM-dd"),
        label: format(date, "MMMM d, yyyy"),
      });
    }
    return dates;
  };

  const timeSlots = generateTimeSlots();
  const dateOptions = generateDateOptions();
  const availableEquipment = equipment.filter(item => item.status === "available");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">New Equipment Reservation</h2>
        <p className="text-sm text-gray-600 mt-1">
          Submit a request to reserve lab equipment. Your request will be reviewed by lab supervisors.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Equipment Selection */}
          <FormField
            control={form.control}
            name="equipmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    setSelectedEquipmentId(parseInt(value));
                  }}
                  value={field.value?.toString()}
                  disabled={!!preselectedEquipment}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment to reserve" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {preselectedEquipment ? (
                      <SelectItem value={preselectedEquipment.id.toString()}>
                        {preselectedEquipment.name} - {preselectedEquipment.location}
                      </SelectItem>
                    ) : (
                      availableEquipment.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} - {item.location}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected Equipment Info */}
          {selectedEquipmentId && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              {(() => {
                const selectedEquipment = equipment.find(item => item.id === selectedEquipmentId);
                if (!selectedEquipment) return null;
                
                return (
                  <div>
                    <h4 className="font-medium text-blue-900">{selectedEquipment.name}</h4>
                    <p className="text-sm text-blue-700 mt-1">{selectedEquipment.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-blue-600">
                      <span>📍 {selectedEquipment.location}</span>
                      {selectedEquipment.requiresTraining && (
                        <span>⚠️ Training Required</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date & Time</FormLabel>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(date) => {
                        const currentTime = field.value ? field.value.split('T')[1] : '09:00';
                        field.onChange(`${date}T${currentTime}`);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dateOptions.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      onValueChange={(time) => {
                        const currentDate = field.value ? field.value.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                        field.onChange(`${currentDate}T${time}`);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date & Time</FormLabel>
                  <div className="space-y-2">
                    <Select
                      onValueChange={(date) => {
                        const currentTime = field.value ? field.value.split('T')[1] : '10:00';
                        field.onChange(`${date}T${currentTime}`);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dateOptions.map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      onValueChange={(time) => {
                        const currentDate = field.value ? field.value.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                        field.onChange(`${currentDate}T${time}`);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Purpose */}
          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose of Use</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what you plan to use this equipment for (minimum 10 characters)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Safety Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Safety Requirements</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Complete safety training before first use</li>
              <li>• Follow all equipment operating procedures</li>
              <li>• Report any damage or malfunctions immediately</li>
              <li>• Return equipment in clean, working condition</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={createReservationMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {createReservationMutation.isPending ? "Submitting..." : "Submit Reservation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
