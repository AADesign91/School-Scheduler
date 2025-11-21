import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Teacher, Class, Subject, Conflict } from "@shared/schema";

export default function Dashboard() {
  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["/api/teachers"],
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["/api/classes"],
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["/api/conflicts"],
  });

  const stats = [
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: Users,
      isLoading: teachersLoading,
      testId: "stat-teachers",
    },
    {
      title: "Total Classes",
      value: classes.length,
      icon: GraduationCap,
      isLoading: classesLoading,
      testId: "stat-classes",
    },
    {
      title: "Total Subjects",
      value: subjects.length,
      icon: BookOpen,
      isLoading: subjectsLoading,
      testId: "stat-subjects",
    },
    {
      title: "Scheduling Conflicts",
      value: conflicts.length,
      icon: AlertTriangle,
      isLoading: false,
      variant: conflicts.length > 0 ? "warning" : "default",
      testId: "stat-conflicts",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="heading-dashboard">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your school scheduling system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-2xl font-semibold" data-testid={`${stat.testId}-value`}>
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Recent Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.slice(0, 5).map((conflict, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-md border bg-card"
                  data-testid={`conflict-${index}`}
                >
                  <Badge variant="destructive" className="mt-0.5">
                    {conflict.type.replace(/_/g, " ")}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{conflict.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {conflict.day} • {conflict.period}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/teachers"
              className="block p-3 rounded-md border hover-elevate active-elevate-2 transition-colors"
              data-testid="action-manage-teachers"
            >
              <div className="font-medium text-sm">Manage Teachers</div>
              <div className="text-xs text-muted-foreground mt-1">
                Add teachers and set their availability
              </div>
            </a>
            <a
              href="/timetables"
              className="block p-3 rounded-md border hover-elevate active-elevate-2 transition-colors"
              data-testid="action-view-timetables"
            >
              <div className="font-medium text-sm">View Timetables</div>
              <div className="text-xs text-muted-foreground mt-1">
                See and edit class schedules
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                1
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Add Subjects</div>
                <div className="text-xs text-muted-foreground">
                  Define subjects taught in your school
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                2
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Add Teachers & Classes</div>
                <div className="text-xs text-muted-foreground">
                  Register teachers and create class groups
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                3
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Set Availability</div>
                <div className="text-xs text-muted-foreground">
                  Input teacher schedules and preferences
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                4
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Generate Timetable</div>
                <div className="text-xs text-muted-foreground">
                  Automatically create optimized schedules
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
