import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  insertSubjectSchema,
  type InsertSubject,
  type Subject,
} from "@shared/schema";
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
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function SubjectForm({ subject, onSuccess }: SubjectFormProps) {
  const { toast } = useToast();

  // Add some extra validation for colour
  const formSchema = insertSubjectSchema.extend({
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Please enter a valid hex colour like #3b82f6."),
  });

  const form = useForm<InsertSubject>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject?.name ?? "",
      color: subject?.color ?? PRESET_COLORS[0],
      // 0 means: this subject has no requirement and will NOT be scheduled.
      lessonsPerWeek: subject?.lessonsPerWeek ?? 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSubject) => {
      if (subject) {
        const res = await apiRequest("PATCH", `/api/subjects/${subject.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/subjects", data);
        return res.json();
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
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem saving the subject.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InsertSubject) => {
    const safeValues: InsertSubject = {
      ...values,
      lessonsPerWeek: Number.isFinite(values.lessonsPerWeek)
        ? Math.max(0, Math.floor(values.lessonsPerWeek))
        : 0,
    };
    mutation.mutate(safeValues);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        data-testid="form-subject"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Gym, French, Music"
                  {...field}
                  data-testid="input-subject-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Colour picker */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colour</FormLabel>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-8 w-8 rounded-full border-2"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          field.value === color
                            ? "hsl(var(--primary))"
                            : "transparent",
                      }}
                      onClick={() => field.onChange(color)}
                      aria-label={`Choose colour ${color}`}
                    />
                  ))}
                </div>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="#3b82f6"
                    data-testid="input-subject-color"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lessons per week requirement */}
        <FormField
          control={form.control}
          name="lessonsPerWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lessons per week (0 = don&apos;t schedule)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={field.value ?? 0}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    field.onChange(val);
                  }}
                  data-testid="input-subject-lessons-per-week"
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
            data-testid="button-submit-subject"
          >
            {mutation.isPending
              ? "Saving..."
              : subject
              ? "Update Subject"
              : "Add Subject"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
