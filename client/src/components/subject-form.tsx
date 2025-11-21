import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertSubjectSchema, type InsertSubject, type Subject } from "@shared/schema";
import { z } from "zod";
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

interface SubjectFormProps {
  subject: Subject | null;
  onSuccess: () => void;
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export function SubjectForm({ subject, onSuccess }: SubjectFormProps) {
  const { toast } = useToast();

  const formSchema = insertSubjectSchema.extend({
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  });

  const form = useForm<InsertSubject>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject?.name || "",
      color: subject?.color || PRESET_COLORS[0],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSubject) => {
      if (subject) {
        await apiRequest("PATCH", `/api/subjects/${subject.id}`, data);
      } else {
        await apiRequest("POST", "/api/subjects", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: subject ? "Subject updated" : "Subject added",
        description: subject
          ? "The subject has been updated successfully."
          : "The subject has been added successfully.",
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
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="Mathematics" {...field} data-testid="input-subject-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-8 h-8 rounded border-2 hover-elevate active-elevate-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: field.value === color ? "hsl(var(--primary))" : "transparent",
                      }}
                      onClick={() => field.onChange(color)}
                      data-testid={`color-preset-${color}`}
                    />
                  ))}
                </div>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="#3b82f6"
                    {...field}
                    data-testid="input-subject-color"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="button-submit-subject"
          >
            {mutation.isPending ? "Saving..." : subject ? "Update Subject" : "Add Subject"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
