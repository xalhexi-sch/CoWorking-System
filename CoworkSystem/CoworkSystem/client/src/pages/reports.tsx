import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Member, Space, Booking, Payment } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can access reports",
        variant: "destructive",
      });
    }
  }, [isAdmin, authLoading, toast]);

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

  if (!authLoading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only administrators can view reports</p>
        </div>
      </div>
    );
  }

  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m) => m.isActive).length || 0;
  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter((b) => b.status === "completed").length || 0;
  const totalRevenue = payments?.filter((p) => p.paymentStatus === "paid").reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalSpaces = spaces?.length || 0;
  const availableSpaces = spaces?.filter((s) => s.status === "available").length || 0;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = payments?.filter((p) => {
    if (!p.paymentDate || p.paymentStatus !== "paid") return false;
    const paymentDate = new Date(p.paymentDate);
    return paymentDate >= thisMonth;
  }).reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

  const monthlyBookings = bookings?.filter((b) => {
    const bookingDate = new Date(b.createdAt);
    return bookingDate >= thisMonth;
  }).length || 0;

  const membershipDistribution = members?.reduce((acc, member) => {
    acc[member.membershipType] = (acc[member.membershipType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights into your coworking space performance
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalMembers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeMembers} active members
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {completedBookings} completed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-chart-3">
                  ${totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time revenue
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Spaces
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{availableSpaces}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {totalSpaces} total spaces
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Revenue This Month</span>
                <span className="text-2xl font-bold text-chart-3">
                  ${isLoading ? "..." : monthlyRevenue.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-chart-3 transition-all"
                  style={{
                    width: totalRevenue > 0 ? `${Math.min((monthlyRevenue / totalRevenue) * 100, 100)}%` : "0%",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Bookings This Month</span>
                <span className="text-2xl font-bold text-chart-1">
                  {isLoading ? "..." : monthlyBookings}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-chart-1 transition-all"
                  style={{
                    width: totalBookings > 0 ? `${Math.min((monthlyBookings / totalBookings) * 100, 100)}%` : "0%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membership Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            ) : membershipDistribution && Object.keys(membershipDistribution).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(membershipDistribution).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{type}</span>
                      <span className="text-muted-foreground">
                        {count} ({totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: totalMembers > 0 ? `${(count / totalMembers) * 100}%` : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No membership data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
