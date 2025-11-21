import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTimetableEntrySchema, type InsertTimetableEntry, type TimetableEntry, type Teacher, type Subject, type Day, type Period } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TimetableEntryFormProps {
  classId: string;
  day: Day;
  period: Period;
  existingEntry?: TimetableEntry;
  onSuccess: () => void;
}

export function TimetableEntryForm({
  classId,
  day,
  period,
  existingEntry,
  onSuccess,
}: TimetableEntryFormProps) {
  const { toast } = useToast();

  const { data: teachers = [] } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const form = useForm<InsertTimetableEntry>({
    resolver: zodResolver(insertTimetableEntrySchema),
    defaultValues: {
      classId,
      teacherId: existingEntry?.teacherId || "",
      subjectId: existingEntry?.subjectId || "",
      day,
      period,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTimetableEntry) => {
      if (existingEntry) {
        await apiRequest("PATCH", `/api/timetable/${existingEntry.id}`, data);
      } else {
        await apiRequest("POST", "/api/timetable", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable", classId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      toast({
        title: existingEntry ? "Entry updated" : "Entry added",
        description: existingEntry
          ? "The timetable entry has been updated successfully."
          : "The timetable entry has been added successfully.",
      });
      onSuccess();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
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
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-teacher">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-submit-entry"
          >
            {mutation.isPending ? "Saving..." : existingEntry ? "Update Entry" : "Add Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
