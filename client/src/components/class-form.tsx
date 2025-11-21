import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertClassSchema, type InsertClass, type Class } from "@shared/schema";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ClassFormProps {
  classData: Class | null;
  onSuccess: () => void;
}

export function ClassForm({ classData, onSuccess }: ClassFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertClass>({
    resolver: zodResolver(insertClassSchema),
    defaultValues: {
      name: classData?.name || "",
      grade: classData?.grade || "",
      studentCount: classData?.studentCount || 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertClass) => {
      if (classData) {
        await apiRequest("PATCH", `/api/classes/${classData.id}`, data);
      } else {
        await apiRequest("POST", "/api/classes", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: classData ? "Class updated" : "Class added",
        description: classData
          ? "The class has been updated successfully."
          : "The class has been added successfully.",
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
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="Class 10A" {...field} data-testid="input-class-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <FormControl>
                <Input placeholder="Grade 10" {...field} data-testid="input-class-grade" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studentCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Count</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="30"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  data-testid="input-class-student-count"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-submit-class"
          >
            {mutation.isPending ? "Saving..." : classData ? "Update Class" : "Add Class"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
