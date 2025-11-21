import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTeacherSchema,
  insertClassSchema,
  insertSubjectSchema,
  insertAvailabilitySchema,
  insertTimetableEntrySchema,
  DAYS,
  PERIODS,
  type Day,
  type Period,
} from "@shared/schema";

type RequirementsMap = Record<string, Record<string, number>>; // classId -> subjectId -> periods per week

export async function registerRoutes(app: Express): Promise<Server> {
  // --------------------
  // Teachers
  // --------------------
  app.get("/api/teachers", async (_req, res) => {
    const teachers = await storage.getTeachers();
    res.json(teachers);
  });

  app.get("/api/teachers/:id", async (req, res) => {
    const teacher = await storage.getTeacher(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.json(teacher);
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(data);
      res.json(teacher);
    } catch {
      res.status(400).json({ error: "Invalid teacher data" });
    }
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    try {
      const existing = await storage.getTeacher(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.updateTeacher(req.params.id, data);
      res.json(teacher);
    } catch {
      res.status(400).json({ error: "Invalid teacher data" });
    }
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    const existing = await storage.getTeacher(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    await storage.deleteTeacher(req.params.id);
    res.json({ success: true });
  });

  // --------------------
  // Classes
  // --------------------
  app.get("/api/classes", async (_req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.get("/api/classes/:id", async (req, res) => {
    const classData = await storage.getClass(req.params.id);
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.json(classData);
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const data = insertClassSchema.parse(req.body);
      const classData = await storage.createClass(data);
      res.json(classData);
    } catch {
      res.status(400).json({ error: "Invalid class data" });
    }
  });

  app.patch("/api/classes/:id", async (req, res) => {
    try {
      const existing = await storage.getClass(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Class not found" });
      }
      const data = insertClassSchema.parse(req.body);
      const classData = await storage.updateClass(req.params.id, data);
      res.json(classData);
    } catch {
      res.status(400).json({ error: "Invalid class data" });
    }
  });

  app.delete("/api/classes/:id", async (req, res) => {
    const existing = await storage.getClass(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Class not found" });
    }
    await storage.deleteClass(req.params.id);
    res.json({ success: true });
  });

  // --------------------
  // Subjects
  // --------------------
  app.get("/api/subjects", async (_req, res) => {
    const subjects = await storage.getSubjects();
    res.json(subjects);
  });

  app.get("/api/subjects/:id", async (req, res) => {
    const subject = await storage.getSubject(req.params.id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json(subject);
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(data);
      res.json(subject);
    } catch {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    try {
      const existing = await storage.getSubject(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Subject not found" });
      }
      const data = insertSubjectSchema.parse(req.body);
      const subject = await storage.updateSubject(req.params.id, data);
      res.json(subject);
    } catch {
      res.status(400).json({ error: "Invalid subject data" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    const existing = await storage.getSubject(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Subject not found" });
    }
    await storage.deleteSubject(req.params.id);
    res.json({ success: true });
  });

  // --------------------
  // Availability
  // --------------------
  app.get("/api/availability/:teacherId", async (req, res) => {
    const teacher = await storage.getTeacher(req.params.teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    const availability = await storage.getAvailability(req.params.teacherId);
    res.json(availability);
  });

  app.post("/api/availability", async (req, res) => {
    try {
      const data = insertAvailabilitySchema.parse(req.body);
      const teacher = await storage.getTeacher(data.teacherId);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
      const availability = await storage.setAvailability(data);
      res.json(availability);
    } catch {
      res.status(400).json({ error: "Invalid availability data" });
    }
  });

  // --------------------
  // Timetable CRUD
  // --------------------
  app.get("/api/timetable", async (req, res) => {
    const classId =
      typeof req.query.classId === "string" ? req.query.classId : undefined;
    const entries = await storage.getTimetableEntries(classId);
    res.json(entries);
  });

  app.get("/api/timetable/:id", async (req, res) => {
    const entry = await storage.getTimetableEntry(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }
    res.json(entry);
  });

  app.post("/api/timetable", async (req, res) => {
    try {
      const data = insertTimetableEntrySchema.parse(req.body);

      const classData = await storage.getClass(data.classId);
      if (!classData) {
        return res.status(400).json({ error: "Class not found" });
      }

      const teacher = await storage.getTeacher(data.teacherId);
      if (!teacher) {
        return res.status(400).json({ error: "Teacher not found" });
      }

      const subject = await storage.getSubject(data.subjectId);
      if (!subject) {
        return res.status(400).json({ error: "Subject not found" });
      }

      if (!teacher.subjects.includes(data.subjectId)) {
        return res
          .status(400)
          .json({ error: "Teacher cannot teach this subject" });
      }

      // Check teacher availability
      const availability = await storage.getAvailability(data.teacherId);
      const unavailable = availability.find(
        (a) => a.day === data.day && a.period === data.period && !a.available,
      );

      if (unavailable) {
        return res
          .status(400)
          .json({ error: "Teacher is not available at this time" });
      }

      // Check for double-booking
      const existingEntries = await storage.getTimetableEntries();
      const conflict = existingEntries.find(
        (e) =>
          e.teacherId === data.teacherId &&
          e.day === data.day &&
          e.period === data.period,
      );

      if (conflict) {
        return res.status(400).json({
          error: "Teacher is already assigned to another class at this time",
        });
      }

      const entry = await storage.createTimetableEntry(data);
      res.json(entry);
    } catch {
      res.status(400).json({ error: "Invalid timetable entry data" });
    }
  });

  app.patch("/api/timetable/:id", async (req, res) => {
    try {
      const existing = await storage.getTimetableEntry(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Timetable entry not found" });
      }

      const data = insertTimetableEntrySchema.parse(req.body);

      const classData = await storage.getClass(data.classId);
      if (!classData) {
        return res.status(400).json({ error: "Class not found" });
      }

      const teacher = await storage.getTeacher(data.teacherId);
      if (!teacher) {
        return res.status(400).json({ error: "Teacher not found" });
      }

      if (!teacher.subjects.includes(data.subjectId)) {
        return res
          .status(400)
          .json({ error: "Teacher cannot teach this subject" });
      }

      // Check teacher availability
      const availability = await storage.getAvailability(data.teacherId);
      const unavailable = availability.find(
        (a) => a.day === data.day && a.period === data.period && !a.available,
      );

      if (unavailable) {
        return res
          .status(400)
          .json({ error: "Teacher is not available at this time" });
      }

      // Check for double-booking (excluding current entry)
      const allEntries = await storage.getTimetableEntries();
      const conflict = allEntries.find(
        (e) =>
          e.id !== req.params.id &&
          e.teacherId === data.teacherId &&
          e.day === data.day &&
          e.period === data.period,
      );

      if (conflict) {
        return res.status(400).json({
          error: "Teacher is already assigned to another class at this time",
        });
      }

      const entry = await storage.updateTimetableEntry(req.params.id, data);
      res.json(entry);
    } catch {
      res.status(400).json({ error: "Invalid timetable entry data" });
    }
  });

  app.delete("/api/timetable/:id", async (req, res) => {
    const existing = await storage.getTimetableEntry(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }
    await storage.deleteTimetableEntry(req.params.id);
    res.json({ success: true });
  });

  // --------------------
  // Generate Timetable (uses per-class requirements)
  // --------------------
  app.post("/api/timetable/generate", async (req, res) => {
    try {
      // Body: { requirements: { [classId]: { [subjectId]: number } } }
      const body = (req as any).body as { requirements?: RequirementsMap } | undefined;
      const requirements: RequirementsMap = body?.requirements ?? {};

      await storage.clearTimetable();

      const teachers = await storage.getTeachers();
      const classes = await storage.getClasses();
      const subjects = await storage.getSubjects();

      if (teachers.length === 0 || classes.length === 0 || subjects.length === 0) {
        return res.status(400).json({
          error:
            "Cannot generate timetable without teachers, classes, and subjects",
        });
      }

      // For each class, assign subjects according to its own requirements
      for (const classData of classes) {
        const classReqs = requirements[classData.id] ?? {};

        const slots: Array<{ day: Day; period: Period }> = [];

        // Build all possible time slots for the week
        for (const day of DAYS) {
          for (const period of PERIODS) {
            slots.push({ day, period });
          }
        }

        // Shuffle slots for variety
        for (let i = slots.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [slots[i], slots[j]] = [slots[j], slots[i]];
        }

        let slotIndex = 0;

        // For each subject, check this class's requirement
        for (const subject of subjects) {
          const periodsPerWeek = classReqs[subject.id] ?? 0;

          // If no requirement (0 or undefined), skip this subject for this class
          if (!periodsPerWeek || periodsPerWeek <= 0) {
            continue;
          }

          for (
            let i = 0;
            i < periodsPerWeek && slotIndex < slots.length;
            i++
          ) {
            const slot = slots[slotIndex];

            // Find an available teacher who can teach this subject
            let assignedTeacher: (typeof teachers)[number] | null = null;

            for (const teacher of teachers) {
              if (!teacher.subjects.includes(subject.id)) {
                continue;
              }

              // Check teacher availability
              const availability = await storage.getAvailability(teacher.id);
              const unavailable = availability.find(
                (a) =>
                  a.day === slot.day &&
                  a.period === slot.period &&
                  !a.available,
              );

              if (unavailable) {
                continue;
              }

              // Check if teacher is already assigned at this time
              const existingEntries = await storage.getTimetableEntries();
              const conflict = existingEntries.find(
                (e) =>
                  e.teacherId === teacher.id &&
                  e.day === slot.day &&
                  e.period === slot.period,
              );

              if (!conflict) {
                assignedTeacher = teacher;
                break;
              }
            }

            if (assignedTeacher) {
              await storage.createTimetableEntry({
                classId: classData.id,
                teacherId: assignedTeacher.id,
                subjectId: subject.id,
                day: slot.day,
                period: slot.period,
              });
            }

            // Move to next slot whether we managed to assign or not
            slotIndex++;
          }
        }
      }

      const entries = await storage.getTimetableEntries();
      res.json({ success: true, entriesCreated: entries.length });
    } catch (error) {
      console.error("Error generating timetable:", error);
      res.status(500).json({ error: "Failed to generate timetable" });
    }
  });

  // --------------------
  // Conflicts
  // --------------------
  app.get("/api/conflicts", async (_req, res) => {
    const conflicts = await storage.detectConflicts();
    res.json(conflicts);
  });

  const httpServer = createServer(app);
  return httpServer;
}
