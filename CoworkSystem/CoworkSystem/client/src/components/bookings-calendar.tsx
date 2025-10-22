import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking, Space, Member } from "@shared/schema";

interface BookingsCalendarProps {
  bookings: Booking[];
  spaces?: Space[];
  members?: Member[];
}

export function BookingsCalendar({ bookings, spaces, members }: BookingsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startOfMonth.getDate() - startOfMonth.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endOfMonth.getDate() + (6 - endOfMonth.getDay()));

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  const iterDate = new Date(startDate);

  while (iterDate <= endDate) {
    currentWeek.push(new Date(iterDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    iterDate.setDate(iterDate.getDate() + 1);
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.startTime);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear() &&
        booking.status === "confirmed"
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Bookings Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth} data-testid="button-prev-month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-32 text-center">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-2">
                {week.map((date, dayIndex) => {
                  const dateBookings = getBookingsForDate(date);
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  const isToday =
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-24 rounded-lg border p-2 ${
                        isCurrentMonth
                          ? "bg-card border-border"
                          : "bg-muted/30 border-muted text-muted-foreground"
                      } ${isToday ? "ring-2 ring-primary" : ""}`}
                      data-testid={`calendar-day-${date.toISOString().split("T")[0]}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? "text-primary font-bold" : ""
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dateBookings.length > 0 && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            {dateBookings.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dateBookings.slice(0, 3).map((booking) => {
                          const space = spaces?.find((s) => s.id === booking.spaceId);
                          const member = members?.find((m) => m.id === booking.memberId);
                          return (
                            <div
                              key={booking.id}
                              className="rounded px-1.5 py-0.5 text-xs bg-primary/10 text-primary truncate"
                              title={`${space?.name} - ${member?.fullName}`}
                            >
                              {new Date(booking.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          );
                        })}
                        {dateBookings.length > 3 && (
                          <div className="text-xs text-muted-foreground px-1.5">
                            +{dateBookings.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
