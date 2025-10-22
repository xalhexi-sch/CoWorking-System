import { Button } from "@/components/ui/button";
import { Building2, Calendar, Users, CreditCard, BarChart3, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                <Building2 className="h-10 w-10" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
              CoWorking Space Management
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-8">
              Streamline your coworking space operations with our comprehensive management system.
              Handle bookings, members, payments, and analytics all in one place.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
                className="text-base px-8"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to manage your space
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for efficiency and ease of use
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Member Management",
                description: "Track member information, membership types, and activity with ease",
              },
              {
                icon: Building2,
                title: "Space Management",
                description: "Manage desks, offices, and meeting rooms with real-time availability",
              },
              {
                icon: Calendar,
                title: "Smart Booking",
                description: "Handle reservations efficiently with conflict detection and calendar views",
              },
              {
                icon: CreditCard,
                title: "Payment Tracking",
                description: "Record and monitor payments with comprehensive financial reporting",
              },
              {
                icon: BarChart3,
                title: "Analytics & Reports",
                description: "Gain insights with detailed reports on revenue, occupancy, and trends",
              },
              {
                icon: CheckCircle,
                title: "Activity Logs",
                description: "Complete audit trail of all system actions for accountability",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="rounded-lg bg-card border border-card-border p-8 hover-elevate"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-12 py-16 text-center shadow-lg">
            <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">
              Ready to streamline your coworking space?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/90 mb-8">
              Join us today and experience efficient space management
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login-cta"
              className="text-base px-8"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
