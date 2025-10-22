import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member, Space, Booking, Payment } from "@shared/schema";

export default function DashboardAdmin() {
  const { data: members, isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: spaces, isLoading: loadingSpaces } = useQuery<Space[]>({
    queryKey: ["/api/spaces"],
  });

  const { data: bookings, isLoading: loadingBookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: payments, isLoading: loadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const isLoading = loadingMembers || loadingSpaces || loadingBookings || loadingPayments;

  // Calculate statistics
  const activeMembers = members?.filter((m) => m.isActive).length || 0;
  const totalRevenue = payments
    ?.filter((p) => p.paymentStatus === "paid")
    .reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const activeBookings = bookings?.filter((b) => b.status === "confirmed").length || 0;
  const availableSpaces = spaces?.filter((s) => s.status === "available").length || 0;

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Active Bookings",
      value: activeBookings.toString(),
      icon: Calendar,
      trend: "+8.2%",
      trendUp: true,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Active Members",
      value: activeMembers.toString(),
      icon: Users,
      trend: "+5.3%",
      trendUp: true,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Available Spaces",
      value: availableSpaces.toString(),
      icon: Building2,
      trend: "-2.1%",
      trendUp: false,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  const recentBookings = bookings?.slice(0, 5) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your coworking space performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
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
                <>
                  <div className="text-2xl font-bold" data-testid={`value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trendUp ? (
                      <TrendingUp className="h-4 w-4 text-chart-3" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${stat.trendUp ? "text-chart-3" : "text-destructive"}`}>
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground">from last month</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent bookings
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg hover-elevate">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Booking #{booking.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.startTime).toLocaleDateString()} - {booking.status}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">
                      ${parseFloat(booking.totalAmount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Space Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : spaces && spaces.length > 0 ? (
              <div className="space-y-4">
                {spaces.slice(0, 5).map((space) => {
                  const spaceBookings = bookings?.filter(
                    (b) => b.spaceId === space.id && b.status === "confirmed"
                  ).length || 0;
                  const occupancyRate = spaceBookings > 0 ? Math.min((spaceBookings / 10) * 100, 100) : 0;

                  return (
                    <div key={space.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{space.name}</span>
                        <span className="text-muted-foreground">{occupancyRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No spaces available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
