import mongoose, { Document } from "mongoose";

export type UserStatus = "applied" | "interview_scheduled" | "verified" | "blocked";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  status: UserStatus;
  isOnboarded?: boolean;
  verificationLevel: "none" | "green" | "blue";
  profileImage?: string;
  bannerImage?: string;
  country?: string;
  timezone?: string;
  lastLogin?: Date;
  interviewDate?: Date;
  interviewTimezone?: string;
  interviewLink?: string;
  interviewHostLink?: string;
  meetingId?: string;
  meetingDuration?: number;
  meetingNotes?: string;
  interviewCompletedAt?: Date;
  createdAt: Date;
  blockReason?: string;
  isPublicProfile: boolean;
  hasJoinedWhatsAppCommunity?: boolean;
  // New fields for student expertise/goals (for matching)
  studentExpertiseNeeds?: IStudentExpertiseNeed[];
}

export interface IUserFlag extends Document {
  user: mongoose.Types.ObjectId;
  reason: string;
  type: "late_payment" | "inactivity" | "cancellation";
  count: number;
  createdAt: Date;
}

export type TutorRequestStatus = 
  | "Pending" 
  | "Reviewing" 
  | "Tutor Found" 
  | "Contacted" 
  | "Connected" 
  | "Closed";

export interface ITutorRequest extends Document {
  fullName: string;
  email: string;
  subject: string;
  classLevel: string;
  budget: string; // Can be hourly or monthly (any budget)
  preferredLanguage: string[];
  description: string;
  preferredSchedule?: string;
  preferredGender?: string;
  additionalNotes?: string;
  status: TutorRequestStatus;
  assignedTutor?: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId; // Optional, if student is registered
  internalNotes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  frequency: "weekly" | "monthly" | "once";
  duration: number;
  meetingLink?: string;
  status: "active" | "completed" | "cancelled";
  subject: string;
  rate: number;
  monthsCompleted: number;
  lastPaymentDate?: Date;
  notes?: string;
  attendance?: {
    date: Date;
    present: boolean;
  }[];
  createdAt: Date;
}

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  description?: string;
  whichClass?: string;
  subjects?: string[];
  learningGoals?: string;
  isVerified?: boolean;
  createdAt: Date;
}

export interface IDegreeDocument {
  name: string;
  institution: string;
  graduationYear: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
  status: "pending" | "verified" | "rejected";
}

export interface ICertificateDocument {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
  status: "pending" | "verified" | "rejected";
}

export interface ITutorAvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  active?: boolean;
  slots?: string[];
}

// New interfaces for Expertise System
export interface IExpertiseCategory extends Document {
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpertiseSubject extends Document {
  category: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEducationLevel extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExpertise extends Document {
  tutor: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teachingLevels: mongoose.Types.ObjectId[];
  teachingLanguages: string[];
  experience: number; // years
  teachingStrength?: "beginner" | "good" | "strong" | "very_strong";
  hourlyRate?: number;
  certificates?: ICertificateDocument[];
  specialNotes?: string;
  isActive: boolean;
  visibility: "public" | "private" | "connections";
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentExpertiseNeed {
  category?: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId;
  level?: mongoose.Types.ObjectId;
  goal?: string;
  targetGrade?: string;
  weeklyHours?: number;
  preferredTutorGender?: string;
  preferredLanguage?: string;
  budget?: number;
  timezone?: string;
}

export interface ITutorProfile extends Document {
  user: mongoose.Types.ObjectId;
  // Deprecated fields - still keep for backward compatibility
  subjects: string[];
  skills: string[];
  experienceYears: number;
  education: string;
  hourlyRate: number;
  monthlyRate: number;
  bio?: string;
  languages: string[];
  rating: number;
  totalStudents: number;
  availability: ITutorAvailabilitySlot[];
  isVerified: boolean;
  payoutDetails?: {
    method: "JazzCash" | "Easypaisa" | "Bank Transfer";
    accountTitle: string;
    accountNumber: string; // Phone number for JazzCash/Easypaisa, Account number for Bank
    bankName?: string;
    iban?: string;
  };
  teachingLevels: string[];
  teachingLevelsOther?: string;
  experienceLevel: "Less than 1 year" | "1-2 years" | "3-5 years" | "5+ years";
  maxClassSize?: number;
  teachingLanguage?: string[];
  hasDegree: boolean;
  degreeName?: string;
  universityName?: string;
  graduationYear?: string;
  degreeDocument?: IDegreeDocument;
  certificateDocuments?: ICertificateDocument[];
  certifications: string[];
  createdAt: Date;
}

export interface ITutorPayout extends Document {
  tutor: mongoose.Types.ObjectId;
  amount: number; // Gross amount (total earned)
  platformFee: number; // 20% commission
  payoutAmount: number; // Net amount sent to tutor
  status: "pending" | "paid" | "failed";
  method: string;
  transactionId?: string;
  screenshot?: string; // URL to proof/screenshot
  notes?: string;
  paidAt?: Date;
  createdAt: Date;
}

export interface IPayment extends Document {
  session: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  amount: number;
  commission: number;
  tutorEarning: number;
  monthNumber: number;
  status: 
    | "pending" // legacy, for old payments
    | "awaiting_payment"
    | "submitted"
    | "under_review"
    | "confirmed"
    | "rejected";
  paymentMethod?: string;
  transactionId?: string;
  screenshot?: string; // URL to payment proof
  notes?: string;
  rejectionReason?: string;
  history: {
    action: string;
    timestamp: Date;
    adminId?: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// New interface for Invoice
export interface IInvoice extends Document {
  learningContract: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  invoiceNumber: string;
  monthYear: string; // e.g., "2026-07"
  billingType: "hourly" | "monthly";
  dueDate: Date;
  paidAt?: Date;
  paidAmount: number;
  outstandingAmount: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled" | "refunded";
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    meetingIds?: mongoose.Types.ObjectId[];
  }[];
  notes?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// New interfaces for Learning Contract System
export type LearningContractStatus = "draft" | "pending_acceptance" | "active" | "paused" | "completed" | "cancelled" | "expired";

export interface ILearningContract extends Document {
  tutor: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  expertise?: mongoose.Types.ObjectId; // Reference to Tutor's Expertise
  subject: mongoose.Types.ObjectId;
  subjectName?: string; // for display
  teachingLevel: mongoose.Types.ObjectId;
  teachingLevelName?: string;
  courseName?: string;
  hourlyRate: number;
  monthlyRate?: number;
  billingType: "hourly" | "monthly" | "custom_package";
  weeklySchedule: ITutorAvailabilitySlot[];
  startDate: Date;
  endDate?: Date;
  expectedDuration?: string; // e.g., "3 months"
  sessionsPerWeek?: number;
  estimatedMonthlyHours?: number;
  cancellationPolicy?: string;
  status: LearningContractStatus;
  acceptedBy?: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  totalHoursPurchased?: number;
  hoursUsed: number;
  hoursRemaining: number;
  totalClasses?: number;
  classesCompleted: number;
  classesMissed: number;
  paymentStatus: "pending" | "paid" | "unpaid" | "overdue";
  nextBillingDate?: Date;
  notes?: string;
  learningGoal?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// New interface for Course Enrollment
export type CourseEnrollmentStatus = "enrolled" | "active" | "paused" | "completed" | "cancelled";

export interface ICourseEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  learningContract: mongoose.Types.ObjectId;
  subject: mongoose.Types.ObjectId;
  teachingLevel: mongoose.Types.ObjectId;
  currentProgress: number; // 0-100
  startDate: Date;
  estimatedCompletionDate?: Date;
  completedLessons: number;
  remainingLessons: number;
  attendance: number; // percentage
  completionPercentage: number; // 0-100
  averageSessionDuration: number; // minutes
  homeworkCompleted: number;
  status: CourseEnrollmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// New interface for Meeting Attendance
export interface IMeetingAttendance extends Document {
  meeting: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: "tutor" | "student";
  joinedAt?: Date;
  leftAt?: Date;
  isPresent: boolean;
  attendancePercentage: number; // for the meeting
  createdAt: Date;
  updatedAt: Date;
}

// Expanded ScheduledMeeting interface
export interface IScheduledMeeting extends Document {
  connection: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId; // Tutor is always host
  studentId: mongoose.Types.ObjectId;
  tutorId: mongoose.Types.ObjectId; // Keep for compatibility
  learningContract?: mongoose.Types.ObjectId;
  courseEnrollment?: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  scheduledStart: Date;
  expectedDuration: number; // original duration requested
  duration: number; // actual split duration (20/30/40)
  notes?: string;
  roomId?: string; // Jitsi room name, only set when tutor starts session
  status: "draft" | "scheduled" | "starting" | "in_progress" | "completed" | "cancelled" | "expired" | "no_show";
  startedAt?: Date;
  endedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  actualDuration?: number; // Actual duration in minutes
  groupId?: string; // For grouping split sessions
  partNumber?: number; // Part number (1, 2, etc.) for split sessions
  totalParts?: number; // Total parts in group
  paymentStatus?: "pending" | "paid" | "unpaid";
  cancellationReason?: string;
  noShowReason?: string;
  attendance?: IMeetingAttendance[];
  createdAt: Date;
  updatedAt: Date;
}

export type AchievementType = "badge" | "certificate" | "milestone" | "achievement";

export interface IAchievement extends Document {
  name: string;
  description: string;
  type: AchievementType;
  image?: string; // Base64 or URL
  icon?: string; // Lucide icon name
  category?: string;
  criteria?: {
    type: "sessions" | "hours" | "courses" | "streak" | "custom";
    value: number;
    config?: any;
  }[];
  points?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAchievement extends Document {
  user: mongoose.Types.ObjectId;
  achievement: mongoose.Types.ObjectId;
  earnedAt: Date;
  criteriaMet?: any; // Record of how criteria were met
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 1. Phone & Mobile Verification Types
export type MobileConfirmationState = "none" | "confirmed" | "verified";

export interface IMobileVerification extends Document {
  user: mongoose.Types.ObjectId;
  countryCode: string; // e.g., "+92"
  countryName: string;
  mobileNumber: string; // full number without country code
  whatsappNumber?: string;
  whatsappSameAsMobile: boolean;
  otp?: string; // Hashed OTP
  otpExpiresAt?: Date;
  otpAttempts: number;
  lastOtpSentAt?: Date;
  isVerified: boolean;
  verifiedAt?: Date;
  verificationMethod: "otp" | "manual" | "admin";
  verifiedBy?: mongoose.Types.ObjectId; // Admin who verified manually
  isDuplicate: boolean;
  confirmationState: MobileConfirmationState;
  confirmedAt?: Date;
  doubleEntryMatched?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 2. User Activity Tracking
export interface IUserActivity extends Document {
  user: mongoose.Types.ObjectId;
  clerkUserId: string;
  isOnline: boolean;
  lastSeen: Date;
  lastLoginAt?: Date;
  lastLogoutAt?: Date;
  lastPageVisited?: string;
  lastRoute?: string;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Connection Request Monitoring & Reminders
export type ConnectionReminderMethod = "whatsapp" | "email" | "internal_notification";
export interface IConnectionReminder extends Document {
  connection: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  sentAt: Date;
  method: ConnectionReminderMethod;
  sentBy?: mongoose.Types.ObjectId; // Admin or system
  note?: string;
  createdAt: Date;
}

// 4. AI Moderation & Trust & Safety
export type AIFlagLevel = "low" | "medium" | "high" | "critical";
export type AIFlagCategory =
  | "contact_sharing"
  | "payment_bypass"
  | "profanity"
  | "spam"
  | "toxicity"
  | "harassment"
  | "scam"
  | "grooming"
  | "fraud"
  | "suspicious"
  | "tutor_extra_fee"
  | "student_abuse"
  | "unknown";

export interface IAIConversationFlag extends Document {
  conversationId: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  flaggedBy: "rule_engine" | "ai_analysis" | "user_report" | "admin";
  ruleMatched?: string; // Which rule in Layer 1
  summary?: string; // Layer 2 AI summary
  sentiment?: string;
  riskScore: number; // 0-100
  confidenceScore?: number; // 0-100
  level: AIFlagLevel;
  category: AIFlagCategory;
  categories?: AIFlagCategory[];
  recommendedAction?: string;
  explanation?: string;
  flaggedContent?: string;
  participants: mongoose.Types.ObjectId[];
  handled: boolean;
  handledAt?: Date;
  handledBy?: mongoose.Types.ObjectId;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIRiskProfile extends Document {
  user: mongoose.Types.ObjectId;
  overallRiskScore: number; // 0-100
  riskLevel: AIFlagLevel;
  flagsCount: number;
  criticalFlagsCount: number;
  recentCategories: AIFlagCategory[];
  lastAnalyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 5. Reports System
export type ReportType = "daily_ceo" | "weekly";
export interface IPlatformReport extends Document {
  type: ReportType;
  date: Date;
  startDate: Date;
  endDate: Date;
  reportNumber: string;
  generatedAt: Date;
  data: {
    newUsers?: number;
    activeUsers?: number;
    messagesSent?: number;
    sessionsScheduled?: number;
    pendingConnections?: number;
    highRiskConversations?: number;
    contactSharingAttempts?: number;
    paymentBypassAttempts?: number;
    tutorResponseTime?: number; // Average minutes
    studentSatisfaction?: number;
    platformHealthScore?: number;
    revenue?: number;
    complaints?: number;
    userRetention?: number;
    mostActiveTutors?: mongoose.Types.ObjectId[];
    mostActiveStudents?: mongoose.Types.ObjectId[];
    aiRecommendations?: string[];
    additionalMetrics?: any;
  };
  createdAt: Date;
}

// 6. Payment Details Privacy System
export interface IPaymentDetailsRequest extends Document {
  student: mongoose.Types.ObjectId;
  tutor: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "contacted";
  requestNote?: string;
  adminNote?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  handledBy?: mongoose.Types.ObjectId; // Admin
  createdAt: Date;
  updatedAt: Date;
}

// 7. Admin Notification System (for real-time)
export type AdminNotificationType =
  | "connection_request"
  | "payment_details_request"
  | "ai_flag"
  | "report_generated"
  | "tutor_reminder"
  | "new_user";
export interface IAdminNotification extends Document {
  type: AdminNotificationType;
  title: string;
  message: string;
  relatedModel?: string;
  relatedId?: mongoose.Types.ObjectId;
  payload?: any;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}
