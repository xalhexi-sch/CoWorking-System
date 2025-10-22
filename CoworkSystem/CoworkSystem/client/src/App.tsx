import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import DashboardAdmin from "@/pages/dashboard-admin";
import DashboardStaff from "@/pages/dashboard-staff";
import Members from "@/pages/members";
import Spaces from "@/pages/spaces";
import Bookings from "@/pages/bookings";
import Payments from "@/pages/payments";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={isAdmin ? DashboardAdmin : DashboardStaff} />
          <Route path="/members" component={Members} />
          <Route path="/spaces" component={Spaces} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/payments" component={Payments} />
          <Route path="/reports" component={Reports} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      {isLoading || !isAuthenticated ? (
        <>
          <Router />
          <Toaster />
        </>
      ) : (
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="flex items-center justify-between p-4 border-b border-border bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-8 max-w-7xl">
                  <Router />
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      )}
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
