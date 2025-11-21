import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Subject, ClassSubjectRequirement } from "@shared/schema";

interface ClassRequirementsFormProps {
  classId: string;
}

export function ClassRequirementsForm({ classId }: ClassRequirementsFormProps) {
  const { toast } = useToast();
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [timesPerWeek, setTimesPerWeek] = useState(1);

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: requirements = [], isLoading } = useQuery<ClassSubjectRequirement[]>({
    queryKey: ["/api/classes", classId, "requirements"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubjectId) {
        toast({ title: "Error", description: "Please select a subject" });
        return;
      }
      await apiRequest("POST", `/api/classes/${classId}/requirements`, {
        subjectId: selectedSubjectId,
        timesPerWeek,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "requirements"] });
      setSelectedSubjectId("");
      setTimesPerWeek(1);
      toast({
        title: "Requirement added",
        description: "Subject requirement has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add requirement",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requirementId: string) => {
      await apiRequest("DELETE", `/api/classes/requirements/${requirementId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", classId, "requirements"] });
      toast({
        title: "Requirement removed",
        description: "Subject requirement has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove requirement",
      });
    },
  });

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || subjectId;
  };

  if (isLoading) {
    return <div className="h-20 bg-muted animate-pulse rounded" />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Current Requirements</h3>
        {requirements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subject requirements yet</p>
        ) : (
          <div className="space-y-2">
            {requirements.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 border rounded-md bg-muted/30"
                data-testid={`row-requirement-${req.id}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{getSubjectName(req.subjectId)}</p>
                  <p className="text-xs text-muted-foreground">{req.timesPerWeek}x per week</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(req.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-requirement-${req.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="font-medium text-sm">Add Requirement</h3>
        <div className="space-y-2">
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
            <SelectTrigger data-testid="select-add-subject">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block">Times per week</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
                data-testid="input-times-per-week"
              />
            </div>
            <Button
              onClick={() => addMutation.mutate()}
              disabled={addMutation.isPending || !selectedSubjectId}
              size="sm"
              data-testid="button-add-requirement"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
