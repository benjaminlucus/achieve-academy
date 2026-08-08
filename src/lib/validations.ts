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
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    active: z.boolean().optional(),
    time: z.array(z.string()).optional()
  })).optional(),
  payoutDetails: z.object({
    method: z.enum(["JazzCash", "Easypaisa", "Bank Transfer"]),
    accountTitle: z.string().optional().or(z.literal("")),
    accountNumber: z.string().optional().or(z.literal("")),
    bankName: z.string().optional(),
    iban: z.string().optional(),
  }).optional(),
  secretPin: z.string().optional(),
  // New fields for Teaching Levels & Qualifications
  teachingLevels: z.union([z.string(), z.array(z.string())]).optional(),
  teachingLevelsOther: z.string().optional(),
  experienceLevel: z.enum(["Less than 1 year", "1-2 years", "3-5 years", "5+ years"]).optional(),
  maxClassSize: z.coerce.number().optional(),
  teachingLanguage: z.union([z.string(), z.array(z.string())]).optional(),
  hasDegree: z.coerce.boolean().optional(),
  degreeName: z.string().optional(),
  universityName: z.string().optional(),
  graduationYear: z.string().optional(),
  degreeDocument: z.object({
    name: z.string(),
    institution: z.string(),
    graduationYear: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    uploadedAt: z.coerce.date().optional(),
    status: z.enum(["pending", "verified", "rejected"]).optional()
  }).optional(),
  certificateDocuments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    fileUrl: z.string(),
    fileType: z.string(),
    uploadedAt: z.coerce.date().optional(),
    status: z.enum(["pending", "verified", "rejected"]).optional()
  })).optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
  phoneVerification: z.object({
    countryCode: z.string().optional(),
    countryName: z.string().optional(),
    mobileNumber: z.string().optional(),
    whatsappSameAsMobile: z.boolean().optional(),
    whatsappNumber: z.string().optional(),
    isConfirmed: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    confirmedAt: z.coerce.date().optional(),
    verifiedAt: z.coerce.date().optional(),
  }).optional(),
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
  interviewLink: zoomUrlSchema.optional(),
  interviewHostLink: zoomUrlSchema.optional(),
  notes: z.string().optional(),
  autoCreateZoom: z.boolean().optional().default(false),
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
  teachingLevels: z.union([z.string(), z.array(z.string())]).optional(),
  teachingLevelsOther: z.string().optional(),
  experienceLevel: z.enum(["Less than 1 year", "1-2 years", "3-5 years", "5+ years"]).optional(),
  hasDegree: z.coerce.boolean().optional(),
  degreeName: z.string().optional(),
  universityName: z.string().optional(),
  graduationYear: z.string().optional(),
  certifications: z.union([z.string(), z.array(z.string())]).optional(),
});
