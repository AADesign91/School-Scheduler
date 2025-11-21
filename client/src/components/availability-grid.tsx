import { useQuery, useMutation } from "@tanstack/react-query";
import { DAYS, PERIODS, type Availability, type Day, type Period } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AvailabilityGridProps {
  teacherId: string;
}

export function AvailabilityGrid({ teacherId }: AvailabilityGridProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<boolean | null>(null);

  const { data: availabilityData = [], isLoading } = useQuery<Availability[]>({
    queryKey: ["/api/availability", teacherId],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ day, period, available }: { day: Day; period: Period; available: boolean }) => {
      await apiRequest("POST", "/api/availability", {
        teacherId,
        day,
        period,
        available,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability", teacherId] });
    },
  });

  const isAvailable = (day: Day, period: Period): boolean => {
    const entry = availabilityData.find((a) => a.day === day && a.period === period);
    return entry?.available ?? true; // Default to available
  };

  const toggleAvailability = (day: Day, period: Period) => {
    const currentlyAvailable = isAvailable(day, period);
    updateMutation.mutate({ day, period, available: !currentlyAvailable });
  };

  const handleMouseDown = (day: Day, period: Period) => {
    setIsDragging(true);
    const currentlyAvailable = isAvailable(day, period);
    setDragMode(!currentlyAvailable);
    toggleAvailability(day, period);
  };

  const handleMouseEnter = (day: Day, period: Period) => {
    if (isDragging && dragMode !== null) {
      const currentlyAvailable = isAvailable(day, period);
      if (currentlyAvailable !== dragMode) {
        updateMutation.mutate({ day, period, available: dragMode });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
    toast({
      title: "Availability updated",
      description: "Teacher availability has been saved.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Weekly Availability</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Click and drag to set availability. Green = Available, Red = Unavailable
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="inline-block min-w-full"
            onMouseLeave={handleMouseUp}
            onMouseUp={handleMouseUp}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border bg-muted p-2 text-left text-xs font-medium text-muted-foreground sticky left-0 z-10">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="border bg-muted p-2 text-center text-xs font-medium text-muted-foreground min-w-[100px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="border bg-muted p-2 text-xs font-mono sticky left-0 z-10">
                      {period}
                    </td>
                    {DAYS.map((day) => {
                      const available = isAvailable(day, period);
                      return (
                        <td
                          key={`${day}-${period}`}
                          className={`border p-0 cursor-pointer select-none transition-colors ${
                            available
                              ? "bg-green-100 dark:bg-green-950 hover:bg-green-200 dark:hover:bg-green-900"
                              : "bg-red-100 dark:bg-red-950 hover:bg-red-200 dark:hover:bg-red-900"
                          }`}
                          onMouseDown={() => handleMouseDown(day, period)}
                          onMouseEnter={() => handleMouseEnter(day, period)}
                          data-testid={`cell-${day}-${period}`}
                        >
                          <div className="w-full h-16 flex items-center justify-center">
                            {available ? (
                              <Check className="w-5 h-5 text-green-700 dark:text-green-400" />
                            ) : (
                              <X className="w-5 h-5 text-red-700 dark:text-red-400" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
