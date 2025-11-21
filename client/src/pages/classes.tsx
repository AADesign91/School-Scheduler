import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, GraduationCap, BookOpen } from "lucide-react";
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
import { ClassForm } from "@/components/class-form";
import { ClassRequirementsForm } from "@/components/class-requirements-form";
import type { Class } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Classes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [selectedClassForRequirements, setSelectedClassForRequirements] = useState<Class | null>(null);
  const { toast } = useToast();

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
      toast({
        title: "Class deleted",
        description: "The class has been removed successfully.",
      });
    },
  });

  const handleEdit = (classData: Class) => {
    setEditingClass(classData);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this class?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-classes">
            Classes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage class groups and student information
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingClass(null)} data-testid="button-add-class">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
            </DialogHeader>
            <ClassForm
              classData={editingClass}
              onSuccess={() => {
                setDialogOpen(false);
                setEditingClass(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={requirementsOpen} onOpenChange={setRequirementsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedClassForRequirements && `Subject Requirements - ${selectedClassForRequirements.name}`}
              </DialogTitle>
            </DialogHeader>
            {selectedClassForRequirements && (
              <ClassRequirementsForm classId={selectedClassForRequirements.id} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No classes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first class to get started
            </p>
            <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-class">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Student Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classData) => (
                <TableRow key={classData.id} data-testid={`row-class-${classData.id}`}>
                  <TableCell className="font-medium">{classData.name}</TableCell>
                  <TableCell>{classData.grade}</TableCell>
                  <TableCell>{classData.studentCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClassForRequirements(classData);
                          setRequirementsOpen(true);
                        }}
                        data-testid={`button-manage-requirements-${classData.id}`}
                        title="Manage subject requirements"
                      >
                        <BookOpen className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(classData)}
                        data-testid={`button-edit-class-${classData.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(classData.id)}
                        data-testid={`button-delete-class-${classData.id}`}
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
