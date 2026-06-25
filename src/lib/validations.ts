import { z } from "zod";

export const onboardingSchema = z.object({
  role: z.enum(["student", "tutor", "admin"]),
  country: z.string().min(2).max(100).optional(),
  timezone: z.string().optional(),
  // Student fields
  whichClass: z.string().optional(),
  learningGoals: z.string().optional(),
  description: z.string().optional(),
  // Tutor fields
  experienceYears: z.coerce.number().min(0).max(50).optional(),
  education: z.string().optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  monthlyRate: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
  subjects: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  availability: z.array(z.object({
    day: z.string(),
    time: z.array(z.string())
  })).optional(),
  payoutDetails: z.object({
    method: z.enum(["JazzCash", "Easypaisa", "Bank Transfer"]),
    accountTitle: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    bankName: z.string().optional(),
    iban: z.string().optional(),
  }).optional(),
  secretPin: z.string().optional(),
});

export const zoomUrlSchema = z.string().url().refine((url) => {
  // More inclusive Zoom regex that handles password tokens and extra query params
  const zoomRegex = /^(https?:\/\/)?([a-z0-9-]+\.)?zoom\.(us|com)\/(j|my|s)\/[\d\w?=&._-]+$/i;
  return zoomRegex.test(url);
}, {
  message: "Invalid Zoom meeting URL. Please provide a valid zoom.us or zoom.com link.",
});

export const interviewScheduleSchema = z.object({
  userId: z.string(),
  scheduledAt: z.string().datetime(),
  interviewLink: zoomUrlSchema,
  interviewHostLink: zoomUrlSchema.optional(),
  notes: z.string().optional(),
});

export const studentProfileSchema = z.object({
  name: z.string().min(2).optional(),
  whichClass: z.string().optional(),
  learningGoals: z.string().optional(),
  subjects: z.union([z.string(), z.array(z.string())]).optional(),
  description: z.string().optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
});

export const tutorProfileSchema = z.object({
  name: z.string().min(2).optional(),
  education: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  subjects: z.union([z.string(), z.array(z.string())]).optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  languages: z.union([z.string(), z.array(z.string())]).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  monthlyRate: z.coerce.number().min(0).optional(),
  bio: z.string().optional(),
  availability: z.array(z.object({
    day: z.string(),
    time: z.array(z.string())
  })).optional(),
  payoutDetails: z.object({
    method: z.enum(["JazzCash", "Easypaisa", "Bank Transfer"]),
    accountTitle: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    bankName: z.string().optional(),
    iban: z.string().optional(),
  }).optional(),
  timezone: z.string().optional(),
  country: z.string().optional(),
});
