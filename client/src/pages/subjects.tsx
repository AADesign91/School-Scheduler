import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubjectForm } from "@/components/subject-form";
import type { Subject } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Subjects() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { toast } = useToast();

  const { data: subjects = [], isLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/subjects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
      toast({
        title: "Subject deleted",
        description: "The subject has been removed successfully.",
      });
    },
  });

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-subjects">
            Subjects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage subjects taught in your school
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSubject(null)} data-testid="button-add-subject">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? "Edit Subject" : "Add New Subject"}
              </DialogTitle>
            </DialogHeader>
            <SubjectForm
              subject={editingSubject}
              onSuccess={() => {
                setDialogOpen(false);
                setEditingSubject(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No subjects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first subject to get started
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-subject">
              <Plus className="w-4 h-4 mr-2" />
              Add Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id} data-testid={`row-subject-${subject.id}`}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span className="text-xs text-muted-foreground">{subject.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(subject)}
                        data-testid={`button-edit-subject-${subject.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(subject.id)}
                        data-testid={`button-delete-subject-${subject.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
