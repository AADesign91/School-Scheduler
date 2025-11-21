import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTeacherSchema, type InsertTeacher, type Teacher, type Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeacherFormProps {
  teacher: Teacher | null;
  onSuccess: () => void;
}

export function TeacherForm({ teacher, onSuccess }: TeacherFormProps) {
  const { toast } = useToast();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const form = useForm<InsertTeacher>({
    resolver: zodResolver(insertTeacherSchema),
    defaultValues: {
      name: teacher?.name || "",
      email: teacher?.email || "",
      subjects: teacher?.subjects || [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTeacher) => {
      if (teacher) {
        await apiRequest("PATCH", `/api/teachers/${teacher.id}`, data);
      } else {
        await apiRequest("POST", "/api/teachers", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: teacher ? "Teacher updated" : "Teacher added",
        description: teacher
          ? "The teacher has been updated successfully."
          : "The teacher has been added successfully.",
      });
      onSuccess();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} data-testid="input-teacher-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@school.com"
                  {...field}
                  data-testid="input-teacher-email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjects"
          render={() => (
            <FormItem>
              <FormLabel>Subjects</FormLabel>
              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No subjects available. Add subjects first.
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <FormField
                      key={subject.id}
                      control={form.control}
                      name="subjects"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={subject.id}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(subject.id)}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValue, subject.id])
                                    : field.onChange(
                                        currentValue.filter((value) => value !== subject.id)
                                      );
                                }}
                                data-testid={`checkbox-subject-${subject.id}`}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {subject.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-submit-teacher"
          >
            {mutation.isPending ? "Saving..." : teacher ? "Update Teacher" : "Add Teacher"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
