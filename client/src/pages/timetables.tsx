import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimetableGrid } from "@/components/timetable-grid";
import type { Class, Conflict } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Timetables() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      await apiRequest("POST", "/api/timetable/generate");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      setIsGenerating(false);
      toast({
        title: "Timetable generated",
        description: "The timetable has been created successfully.",
      });
    },
    onError: () => {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "There was an error generating the timetable.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-timetables">
            Timetables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage class schedules
          </p>
        </div>
        <div className="flex items-center gap-3">
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
            </Badge>
          )}
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={isGenerating}
            data-testid="button-generate-timetable"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Timetable"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Class</label>
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-64" data-testid="select-class">
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classData) => (
                  <SelectItem key={classData.id} value={classData.id}>
                    {classData.name} - {classData.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedClassId ? (
            <TimetableGrid classId={selectedClassId} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a class to view timetable</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a class from the dropdown above to see or edit its schedule
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
