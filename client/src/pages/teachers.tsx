import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeacherForm } from "@/components/teacher-form";
import { AvailabilityGrid } from "@/components/availability-grid";
import type { Teacher, Subject } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Teachers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: teachers = [], isLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/teachers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast({
        title: "Teacher deleted",
        description: "The teacher has been removed successfully.",
      });
    },
  });

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      deleteMutation.mutate(id);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSubjectNames = (subjectIds: string[]) => {
    return subjectIds
      .map((id) => subjects.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  if (selectedTeacherId) {
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setSelectedTeacherId(null)}
              className="mb-2"
              data-testid="button-back"
            >
              ← Back to Teachers
            </Button>
            <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-availability">
              {teacher?.name} - Availability
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set weekly availability for this teacher
            </p>
          </div>
        </div>
        <AvailabilityGrid teacherId={selectedTeacherId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-teachers">
            Teachers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage teacher profiles and availability
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTeacher(null)} data-testid="button-add-teacher">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
              </DialogTitle>
            </DialogHeader>
            <TeacherForm
              teacher={editingTeacher}
              onSuccess={() => {
                setDialogOpen(false);
                setEditingTeacher(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No teachers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first teacher to get started
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-teacher">
              <Plus className="w-4 h-4 mr-2" />
              Add Teacher
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card key={teacher.id} data-testid={`card-teacher-${teacher.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium truncate">
                      {teacher.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {teacher.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Subjects</div>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.length > 0 ? (
                      teacher.subjects.map((subjectId) => {
                        const subject = subjects.find((s) => s.id === subjectId);
                        return subject ? (
                          <Badge key={subjectId} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        ) : null;
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">No subjects assigned</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    data-testid={`button-availability-${teacher.id}`}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Availability
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(teacher)}
                    data-testid={`button-edit-${teacher.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(teacher.id)}
                    data-testid={`button-delete-${teacher.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
