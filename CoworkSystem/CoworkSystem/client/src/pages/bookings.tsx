import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Calendar as CalendarIcon, Filter, X, List, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookingsCalendar } from "@/components/bookings-calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookingSchema, type Booking, type InsertBooking, type Member, type Space } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const bookingFormSchema = insertBookingSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Bookings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { toast } = useToast();

  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: members } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: spaces } = useQuery<Space[]>({
    queryKey: ["/api/spaces"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      memberId: 0,
      spaceId: 0,
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      bookingType: "hourly",
      totalAmount: "0",
      status: "confirmed",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (formData: BookingFormData) => {
      const { startDate, startTime, endDate, endTime, ...rest } = formData;
      
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      const data: InsertBooking = {
        ...rest,
        startTime: startDateTime,
        endTime: endDateTime,
      };

      return await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("PATCH", `/api/bookings/${id}`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Success",
        description: "Booking cancelled",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: BookingFormData) => {
    createMutation.mutate(data);
  };

  const calculateAmount = (spaceId: number, bookingType: string, startDate: string, startTime: string, endDate: string, endTime: string) => {
    const space = spaces?.find(s => s.id === spaceId);
    if (!space || !startDate || !startTime || !endDate || !endTime) return "0";

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (bookingType === "hourly") {
      return (hours * parseFloat(space.hourlyRate)).toFixed(2);
    } else {
      const days = Math.ceil(hours / 24);
      return (days * parseFloat(space.dailyRate)).toFixed(2);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  const filteredBookings = bookings?.filter((booking) =>
    statusFilter === "all" || booking.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-chart-3 text-white";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      case "completed":
        return "bg-chart-2 text-white";
      default:
        return "";
    }
  };

  const getMemberName = (memberId: number) => {
    return members?.find((m) => m.id === memberId)?.fullName || `Member #${memberId}`;
  };

  const getSpaceName = (spaceId: number) => {
    return spaces?.find((s) => s.id === spaceId)?.name || `Space #${spaceId}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage space reservations and bookings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-booking">
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="memberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-member">
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members?.filter((m) => m.isActive).map((member) => (
                              <SelectItem key={member.id} value={member.id.toString()}>
                                {member.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spaceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                            const spaceId = parseInt(value);
                            const bookingType = form.getValues("bookingType");
                            const startDate = form.getValues("startDate");
                            const startTime = form.getValues("startTime");
                            const endDate = form.getValues("endDate");
                            const endTime = form.getValues("endTime");
                            const amount = calculateAmount(spaceId, bookingType, startDate, startTime, endDate, endTime);
                            form.setValue("totalAmount", amount);
                          }}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-space">
                              <SelectValue placeholder="Select space" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {spaces?.filter((s) => s.status === "available").map((space) => (
                              <SelectItem key={space.id} value={space.id.toString()}>
                                {space.name} - ${space.hourlyRate}/hr
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bookingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Booking Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const spaceId = form.getValues("spaceId");
                          const startDate = form.getValues("startDate");
                          const startTime = form.getValues("startTime");
                          const endDate = form.getValues("endDate");
                          const endTime = form.getValues("endTime");
                          const amount = calculateAmount(spaceId, value, startDate, startTime, endDate, endTime);
                          form.setValue("totalAmount", amount);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-booking-type">
                            <SelectValue placeholder="Select booking type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onChange={(e) => {
                              field.onChange(e);
                              const spaceId = form.getValues("spaceId");
                              const bookingType = form.getValues("bookingType");
                              const startTime = form.getValues("startTime");
                              const endDate = form.getValues("endDate");
                              const endTime = form.getValues("endTime");
                              const amount = calculateAmount(spaceId, bookingType, e.target.value, startTime, endDate, endTime);
                              form.setValue("totalAmount", amount);
                            }}
                            data-testid="input-start-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            onChange={(e) => {
                              field.onChange(e);
                              const spaceId = form.getValues("spaceId");
                              const bookingType = form.getValues("bookingType");
                              const startDate = form.getValues("startDate");
                              const endDate = form.getValues("endDate");
                              const endTime = form.getValues("endTime");
                              const amount = calculateAmount(spaceId, bookingType, startDate, e.target.value, endDate, endTime);
                              form.setValue("totalAmount", amount);
                            }}
                            data-testid="input-start-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            onChange={(e) => {
                              field.onChange(e);
                              const spaceId = form.getValues("spaceId");
                              const bookingType = form.getValues("bookingType");
                              const startDate = form.getValues("startDate");
                              const startTime = form.getValues("startTime");
                              const endTime = form.getValues("endTime");
                              const amount = calculateAmount(spaceId, bookingType, startDate, startTime, e.target.value, endTime);
                              form.setValue("totalAmount", amount);
                            }}
                            data-testid="input-end-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            onChange={(e) => {
                              field.onChange(e);
                              const spaceId = form.getValues("spaceId");
                              const bookingType = form.getValues("bookingType");
                              const startDate = form.getValues("startDate");
                              const startTime = form.getValues("startTime");
                              const endDate = form.getValues("endDate");
                              const amount = calculateAmount(spaceId, bookingType, startDate, startTime, endDate, e.target.value);
                              form.setValue("totalAmount", amount);
                            }}
                            data-testid="input-end-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          readOnly
                          className="bg-muted"
                          data-testid="input-total-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Additional notes..."
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    data-testid="button-submit-booking"
                  >
                    Create Booking
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="select-status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
            data-testid="button-calendar-view"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            data-testid="button-list-view"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <BookingsCalendar
          bookings={filteredBookings || []}
          spaces={spaces}
          members={members}
        />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingBookings ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} data-testid={`booking-row-${booking.id}`}>
                  <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                  <TableCell className="font-medium">{getMemberName(booking.memberId)}</TableCell>
                  <TableCell>{getSpaceName(booking.spaceId)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.startTime).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(booking.endTime).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {booking.bookingType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${parseFloat(booking.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(booking.status)} variant="secondary">
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === "confirmed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelMutation.mutate(booking.id)}
                        data-testid={`button-cancel-${booking.id}`}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  {statusFilter !== "all"
                    ? `No ${statusFilter} bookings found`
                    : "No bookings yet. Create your first booking to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
