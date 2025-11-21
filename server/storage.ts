import {
  type Teacher,
  type InsertTeacher,
  type Class,
  type InsertClass,
  type Subject,
  type InsertSubject,
  type Availability,
  type InsertAvailability,
  type TimetableEntry,
  type InsertTimetableEntry,
  type ClassSubjectRequirement,
  type InsertClassSubjectRequirement,
  type Conflict,
  type Day,
  type Period,
  DAYS,
  PERIODS,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Teachers
  getTeachers(): Promise<Teacher[]>;
  getTeacher(id: string): Promise<Teacher | undefined>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: InsertTeacher): Promise<Teacher>;
  deleteTeacher(id: string): Promise<void>;

  // Classes
  getClasses(): Promise<Class[]>;
  getClass(id: string): Promise<Class | undefined>;
  createClass(classData: InsertClass): Promise<Class>;
  updateClass(id: string, classData: InsertClass): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Subjects
  getSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: InsertSubject): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;

  // Class Subject Requirements
  getClassRequirements(classId: string): Promise<ClassSubjectRequirement[]>;
  setClassRequirement(requirement: InsertClassSubjectRequirement): Promise<ClassSubjectRequirement>;
  deleteClassRequirement(id: string): Promise<void>;

  // Availability
  getAvailability(teacherId: string): Promise<Availability[]>;
  setAvailability(availability: InsertAvailability): Promise<Availability>;
  
  // Timetable
  getTimetableEntries(classId?: string): Promise<TimetableEntry[]>;
  getTimetableEntry(id: string): Promise<TimetableEntry | undefined>;
  createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry>;
  updateTimetableEntry(id: string, entry: InsertTimetableEntry): Promise<TimetableEntry>;
  deleteTimetableEntry(id: string): Promise<void>;
  clearTimetable(): Promise<void>;

  // Conflicts
  detectConflicts(): Promise<Conflict[]>;
}

export class MemStorage implements IStorage {
  private teachers: Map<string, Teacher>;
  private classes: Map<string, Class>;
  private subjects: Map<string, Subject>;
  private availability: Map<string, Availability>;
  private timetableEntries: Map<string, TimetableEntry>;
  private classSubjectRequirements: Map<string, ClassSubjectRequirement>;

  constructor() {
    this.teachers = new Map();
    this.classes = new Map();
    this.subjects = new Map();
    this.availability = new Map();
    this.timetableEntries = new Map();
    this.classSubjectRequirements = new Map();
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const teacher: Teacher = { 
      ...insertTeacher, 
      id,
      subjects: insertTeacher.subjects || []
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async updateTeacher(id: string, insertTeacher: InsertTeacher): Promise<Teacher> {
    const teacher: Teacher = { 
      ...insertTeacher, 
      id,
      subjects: insertTeacher.subjects || []
    };
    this.teachers.set(id, teacher);
    return teacher;
  }

  async deleteTeacher(id: string): Promise<void> {
    this.teachers.delete(id);
    // Also delete associated availability
    const availabilityToDelete = Array.from(this.availability.values())
      .filter((a) => a.teacherId === id);
    availabilityToDelete.forEach((a) => this.availability.delete(a.id));
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const classData: Class = { 
      ...insertClass, 
      id,
      studentCount: insertClass.studentCount ?? 0
    };
    this.classes.set(id, classData);
    return classData;
  }

  async updateClass(id: string, insertClass: InsertClass): Promise<Class> {
    const classData: Class = { 
      ...insertClass, 
      id,
      studentCount: insertClass.studentCount ?? 0
    };
    this.classes.set(id, classData);
    return classData;
  }

  async deleteClass(id: string): Promise<void> {
    this.classes.delete(id);
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const id = randomUUID();
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async updateSubject(id: string, insertSubject: InsertSubject): Promise<Subject> {
    const subject: Subject = { ...insertSubject, id };
    this.subjects.set(id, subject);
    return subject;
  }

  async deleteSubject(id: string): Promise<void> {
    this.subjects.delete(id);
  }

  // Class Subject Requirements
  async getClassRequirements(classId: string): Promise<ClassSubjectRequirement[]> {
    return Array.from(this.classSubjectRequirements.values()).filter((r) => r.classId === classId);
  }

  async setClassRequirement(insertRequirement: InsertClassSubjectRequirement): Promise<ClassSubjectRequirement> {
    // Find existing or create new
    const existing = Array.from(this.classSubjectRequirements.values()).find(
      (r) => r.classId === insertRequirement.classId && r.subjectId === insertRequirement.subjectId
    );

    if (existing) {
      const updated: ClassSubjectRequirement = { 
        ...insertRequirement, 
        id: existing.id 
      };
      this.classSubjectRequirements.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const requirement: ClassSubjectRequirement = { 
        ...insertRequirement, 
        id 
      };
      this.classSubjectRequirements.set(id, requirement);
      return requirement;
    }
  }

  async deleteClassRequirement(id: string): Promise<void> {
    this.classSubjectRequirements.delete(id);
  }

  // Availability
  async getAvailability(teacherId: string): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter((a) => a.teacherId === teacherId);
  }

  async setAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    // Find existing or create new
    const existing = Array.from(this.availability.values()).find(
      (a) =>
        a.teacherId === insertAvailability.teacherId &&
        a.day === insertAvailability.day &&
        a.period === insertAvailability.period
    );

    if (existing) {
      const updated: Availability = { 
        ...insertAvailability, 
        id: existing.id,
        available: insertAvailability.available ?? true
      };
      this.availability.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const availability: Availability = { 
        ...insertAvailability, 
        id,
        available: insertAvailability.available ?? true
      };
      this.availability.set(id, availability);
      return availability;
    }
  }

  // Timetable
  async getTimetableEntries(classId?: string): Promise<TimetableEntry[]> {
    const entries = Array.from(this.timetableEntries.values());
    if (classId) {
      return entries.filter((e) => e.classId === classId);
    }
    return entries;
  }

  async getTimetableEntry(id: string): Promise<TimetableEntry | undefined> {
    return this.timetableEntries.get(id);
  }

  async createTimetableEntry(insertEntry: InsertTimetableEntry): Promise<TimetableEntry> {
    // Check if entry already exists for this class/day/period
    const existing = Array.from(this.timetableEntries.values()).find(
      (e) =>
        e.classId === insertEntry.classId &&
        e.day === insertEntry.day &&
        e.period === insertEntry.period
    );

    if (existing) {
      // Update existing entry
      const updated: TimetableEntry = { ...insertEntry, id: existing.id };
      this.timetableEntries.set(existing.id, updated);
      return updated;
    }

    const id = randomUUID();
    const entry: TimetableEntry = { ...insertEntry, id };
    this.timetableEntries.set(id, entry);
    return entry;
  }

  async updateTimetableEntry(id: string, insertEntry: InsertTimetableEntry): Promise<TimetableEntry> {
    const entry: TimetableEntry = { ...insertEntry, id };
    this.timetableEntries.set(id, entry);
    return entry;
  }

  async deleteTimetableEntry(id: string): Promise<void> {
    this.timetableEntries.delete(id);
  }

  async clearTimetable(): Promise<void> {
    this.timetableEntries.clear();
  }

  // Conflicts
  async detectConflicts(): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    const entries = Array.from(this.timetableEntries.values());

    // Check for teacher double-booking
    const teacherSchedule = new Map<string, Set<string>>();
    
    for (const entry of entries) {
      const key = `${entry.day}-${entry.period}`;
      
      if (!teacherSchedule.has(entry.teacherId)) {
        teacherSchedule.set(entry.teacherId, new Set());
      }
      
      const schedule = teacherSchedule.get(entry.teacherId)!;
      
      if (schedule.has(key)) {
        const teacher = await this.getTeacher(entry.teacherId);
        conflicts.push({
          type: "teacher_double_booking",
          message: `${teacher?.name || "Teacher"} is double-booked`,
          day: entry.day as Day,
          period: entry.period as Period,
          teacherId: entry.teacherId,
        });
      }
      
      schedule.add(key);
    }

    // Check for teacher unavailability
    for (const entry of entries) {
      const availabilityData = await this.getAvailability(entry.teacherId);
      const availability = availabilityData.find(
        (a) => a.day === entry.day && a.period === entry.period
      );
      
      if (availability && !availability.available) {
        const teacher = await this.getTeacher(entry.teacherId);
        conflicts.push({
          type: "teacher_unavailable",
          message: `${teacher?.name || "Teacher"} is not available`,
          day: entry.day as Day,
          period: entry.period as Period,
          teacherId: entry.teacherId,
          classId: entry.classId,
        });
      }
    }

    return conflicts;
  }
}

export const storage = new MemStorage();
