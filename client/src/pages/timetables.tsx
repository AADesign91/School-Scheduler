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
import type { Class, Conflict, Subject } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type RequirementsMap = Record<string, Record<string, number>>; // classId -> subjectId -> periods per week

export default function Timetables() {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [requirements, setRequirements] = useState<RequirementsMap>({});
  const { toast } = useToast();

  const { data: classes = [] } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const handleRequirementChange = (
    classId: string,
    subjectId: string,
    value: string,
  ) => {
    const num = value === "" ? 0 : Number(value);
    const safe = Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;

    setRequirements((prev) => {
      const classReqs = prev[classId] ?? {};
      return {
        ...prev,
        [classId]: {
          ...classReqs,
          [subjectId]: safe,
        },
      };
    });
  };

  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      await apiRequest("POST", "/api/timetable/generate", {
        requirements,
      });
    },
    onSuccess: () => {
      // Refresh timetables and conflicts
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      if (selectedClassId) {
        queryClient.invalidateQueries({
          queryKey: ["/api/timetable", selectedClassId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conflicts"] });
      setIsGenerating(false);
      toast({
        title: "Timetable generated",
        description:
          "The timetable has been created based on your class requirements.",
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

  const hasSelectedClass = !!selectedClassId;
  const currentRequirements = hasSelectedClass
    ? requirements[selectedClassId] ?? {}
    : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-foreground"
            data-testid="heading-timetables"
          >
            Timetables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set per-class subject requirements and generate specialist
            timetables.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              {conflicts.length} conflict
              {conflicts.length !== 1 ? "s" : ""}
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
        <CardContent className="p-6 space-y-6">
          {/* Class selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Class
            </label>
            <Select
              value={selectedClassId}
              onValueChange={setSelectedClassId}
            >
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

          {/* Requirements per class */}
          {hasSelectedClass && subjects.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3 bg-muted/40">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">
                  Requirements for this class
                </h2>
                <p className="text-xs text-muted-foreground">
                  Set how many periods per week each specialist subject should
                  be scheduled. <strong>0 = do not schedule</strong>.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map((subject) => {
                  const value = currentRequirements[subject.id] ?? 0;
                  return (
                    <div
                      key={subject.id}
                      className="flex flex-col gap-1 border rounded-md p-3 bg-background"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {subject.name}
                        </span>
                        <span
                          className="inline-block w-3 h-3 rounded-full border"
                          style={{ backgroundColor: subject.color }}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">
                          Periods / week
                        </label>
                        <Input
                          type="number"
                          min={0}
                          max={40}
                          value={value}
                          onChange={(e) =>
                            handleRequirementChange(
                              selectedClassId,
                              subject.id,
                              e.target.value,
                            )
                          }
                          className="h-8 w-20"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timetable grid */}
          {hasSelectedClass ? (
            <TimetableGrid classId={selectedClassId} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                Select a class to view timetable
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Choose a class from the dropdown above to see or edit its
                schedule.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
