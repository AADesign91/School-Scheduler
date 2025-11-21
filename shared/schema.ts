import { pgTable, text, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Days of the week
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export type Day = typeof DAYS[number];

// Time periods (school day divided into periods)
export const PERIODS = [
  "8:00-9:00",
  "9:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00"
] as const;
export type Period = typeof PERIODS[number];

// Teachers
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subjects: text("subjects").array().notNull().default([]), // Array of subject IDs
});

export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Classes
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  studentCount: integer("student_count").notNull().default(0),
});

export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

// Subjects
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(), // For visual display
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Teacher Availability
export const availability = pgTable("availability", {
  id: varchar("id").primaryKey(),
  teacherId: varchar("teacher_id").notNull(),
  day: text("day").notNull(),
  period: text("period").notNull(),
  available: boolean("available").notNull().default(true),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({ id: true });
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

// Timetable Entries
export const timetableEntries = pgTable("timetable_entries", {
  id: varchar("id").primaryKey(),
  classId: varchar("class_id").notNull(),
  teacherId: varchar("teacher_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  day: text("day").notNull(),
  period: text("period").notNull(),
});

export const insertTimetableEntrySchema = createInsertSchema(timetableEntries).omit({ id: true });
export type InsertTimetableEntry = z.infer<typeof insertTimetableEntrySchema>;
export type TimetableEntry = typeof timetableEntries.$inferSelect;

// Extended types with joined data
export type TimetableEntryWithDetails = TimetableEntry & {
  teacher: Teacher;
  subject: Subject;
  class: Class;
};

// Class Subject Requirements
export const classSubjectRequirements = pgTable("class_subject_requirements", {
  id: varchar("id").primaryKey(),
  classId: varchar("class_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  timesPerWeek: integer("times_per_week").notNull().default(1),
});

export const insertClassSubjectRequirementSchema = createInsertSchema(classSubjectRequirements).omit({ id: true });
export type InsertClassSubjectRequirement = z.infer<typeof insertClassSubjectRequirementSchema>;
export type ClassSubjectRequirement = typeof classSubjectRequirements.$inferSelect;

// Conflict type
export type Conflict = {
  type: "teacher_double_booking" | "unassigned_period" | "teacher_unavailable" | "missing_subject";
  message: string;
  day: Day;
  period: Period;
  classId?: string;
  teacherId?: string;
  subjectId?: string;
};
