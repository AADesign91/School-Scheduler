import { useQuery, useMutation } from "@tanstack/react-query";
import { DAYS, PERIODS, type TimetableEntry, type Teacher, type Subject, type Day, type Period } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { TimetableEntryForm } from "./timetable-entry-form";

interface TimetableGridProps {
  classId: string;
}

export function TimetableGrid({ classId }: TimetableGridProps) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<{ day: Day; period: Period } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: entries = [], isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ["/api/timetable", classId],
  });

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      await apiRequest("DELETE", `/api/timetable/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", classId] });
      toast({
        title: "Entry deleted",
        description: "The timetable entry has been removed.",
      });
    },
  });

  const getEntry = (day: Day, period: Period): TimetableEntry | undefined => {
    return entries.find((e) => e.day === day && e.period === period);
  };

  const getTeacher = (teacherId: string): Teacher | undefined => {
    return teachers.find((t) => t.id === teacherId);
  };

  const getSubject = (subjectId: string): Subject | undefined => {
    return subjects.find((s) => s.id === subjectId);
  };

  const handleCellClick = (day: Day, period: Period) => {
    setSelectedSlot({ day, period });
    setDialogOpen(true);
  };

  const handleDeleteEntry = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteMutation.mutate(entryId);
    }
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
    <>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border bg-muted p-2 text-left text-xs font-medium text-muted-foreground sticky left-0 z-10">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="border bg-muted p-2 text-center text-xs font-medium text-muted-foreground min-w-[150px]"
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
                    const entry = getEntry(day, period);
                    const teacher = entry ? getTeacher(entry.teacherId) : undefined;
                    const subject = entry ? getSubject(entry.subjectId) : undefined;

                    return (
                      <td
                        key={`${day}-${period}`}
                        className="border p-0 cursor-pointer hover-elevate active-elevate-2 transition-colors"
                        onClick={() => handleCellClick(day, period)}
                        data-testid={`cell-${day}-${period}`}
                      >
                        {entry && teacher && subject ? (
                          <div
                            className="p-3 h-full min-h-[80px] flex flex-col justify-between"
                            style={{
                              backgroundColor: subject.color + "20",
                              borderLeft: `4px solid ${subject.color}`,
                            }}
                          >
                            <div>
                              <div className="font-medium text-sm text-foreground">
                                {subject.name}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {teacher.name}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 self-end mt-1"
                              onClick={(e) => handleDeleteEntry(entry.id, e)}
                              data-testid={`button-delete-entry-${entry.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3 h-full min-h-[80px] flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                            <span className="text-xs text-muted-foreground">
                              Click to add
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSlot && `${selectedSlot.day} - ${selectedSlot.period}`}
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <TimetableEntryForm
              classId={classId}
              day={selectedSlot.day}
              period={selectedSlot.period}
              existingEntry={getEntry(selectedSlot.day, selectedSlot.period)}
              onSuccess={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
