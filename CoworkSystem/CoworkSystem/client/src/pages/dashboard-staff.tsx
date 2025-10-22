import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Booking, Payment } from "@shared/schema";

export default function DashboardStaff() {
  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: payments, isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const isLoading = loadingBookings || loadingPayments;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayBookings = bookings?.filter((b) => {
    const bookingDate = new Date(b.startTime);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === today.getTime() && b.status === "confirmed";
  }).length || 0;

  const pendingPayments = payments?.filter((p) => p.paymentStatus === "pending").length || 0;

  const quickStats = [
    {
      title: "Today's Bookings",
      value: todayBookings.toString(),
      icon: Calendar,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      icon: CreditCard,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const quickActions = [
    { label: "Add Member", icon: Users, href: "/members", color: "primary" },
    { label: "New Booking", icon: Calendar, href: "/bookings", color: "primary" },
    { label: "Record Payment", icon: CreditCard, href: "/payments", color: "primary" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Quick access to daily operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover-elevate" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid={`value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex-col gap-3 hover-elevate"
                  data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings && bookings.filter((b) => {
            const bookingDate = new Date(b.startTime);
            bookingDate.setHours(0, 0, 0, 0);
            return bookingDate.getTime() === today.getTime() && b.status === "confirmed";
          }).length > 0 ? (
            <div className="space-y-4">
              {bookings
                .filter((b) => {
                  const bookingDate = new Date(b.startTime);
                  bookingDate.setHours(0, 0, 0, 0);
                  return bookingDate.getTime() === today.getTime() && b.status === "confirmed";
                })
                .slice(0, 5)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover-elevate">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Booking #{booking.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(booking.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${parseFloat(booking.totalAmount).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{booking.bookingType}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bookings scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
