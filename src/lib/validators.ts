import { z } from "zod";

// Basic user schemas
export const UserIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

export const ConnectionRequestSchema = z.object({
  targetUserId: z.string().min(1, "Target user ID is required"),
});

export const ConnectionStatusSchema = z.object({
  status: z.enum(["accepted", "rejected", "pending", "cancelled", "blocked"]),
});

// Session schemas
export const CreateSessionSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  tutorId: z.string().min(1, "Tutor ID is required"),
  startDate: z.string().min(1, "Start date is required"),
  frequency: z.enum(["weekly", "monthly", "once"]).optional().default("weekly"),
  duration: z.number().int().min(15).max(240).optional().default(60),
  subject: z.string().min(1, "Subject is required"),
  rate: z.number().min(0).optional().default(0),
  notes: z.string().optional(),
});

export const UpdateSessionSchema = CreateSessionSchema.partial();

// Payment schemas
export const SubmitPaymentProofSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  monthNumber: z.number().int().min(1).max(12),
  amount: z.number().min(0),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  screenshot: z.string().min(1, "Screenshot is required"),
  paymentId: z.string().optional(),
});

// Interview schemas
export const ScheduleInterviewSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  date: z.string().min(1, "Interview date is required"),
  timezone: z.string().optional().default("UTC"),
  notes: z.string().optional(),
  autoCreateZoom: z.boolean().optional().default(true),
});

// Admin user status schema
export const UpdateUserStatusSchema = z.object({
  status: z.enum(["applied", "interview_scheduled", "verified", "blocked"]),
  blockReason: z.string().optional(),
});

// Achievement schemas
export const CreateAchievementSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["badge", "certificate", "milestone", "achievement"]),
  image: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  points: z.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
});

export const AwardAchievementSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  achievementId: z.string().min(1, "Achievement ID is required"),
  notes: z.string().optional(),
});

// Feedback schema
export const CreateFeedbackSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  userRole: z.string().min(1, "User role is required"),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1, "Feedback text is required"),
  screenshotUrl: z.string().optional(),
  attachments: z.array(z.string()).optional().default([]),
  isPublic: z.boolean().optional().default(true),
});

// Contact schema
export const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
});

// Onboarding schema
export const OnboardingSchema = z.object({
  role: z.enum(["student", "tutor"]),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  // Student fields
  whichClass: z.string().optional(),
  learningGoals: z.string().optional(),
  studentSubjects: z.array(z.string()).optional(),
  // Tutor fields
  tutorSubjects: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().int().optional(),
  education: z.string().optional(),
  hourlyRate: z.number().optional(),
  monthlyRate: z.number().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  availability: z.array(z.any()).optional(),
  payoutMethod: z.string().optional(),
  accountTitle: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  iban: z.string().optional(),
});

// Payment verify schema
export const VerifyPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  status: z.enum(["submitted", "under_review", "confirmed", "rejected", "paid", "failed"]),
  rejectionReason: z.string().optional(),
});
