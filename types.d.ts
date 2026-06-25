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
  country?: string;
  timezone?: string;
  lastLogin?: Date;
  interviewDate?: Date;
  interviewTimezone?: string;
  interviewLink?: string;
  interviewHostLink?: string;
  meetingId?: string;
  meetingProvider?: string;
  meetingDuration?: number;
  meetingNotes?: string;
  interviewCompletedAt?: Date;
  createdAt: Date;
}

export interface IUserFlag extends Document {
  user: mongoose.Types.ObjectId;
  reason: string;
  type: "late_payment" | "inactivity" | "cancellation";
  count: number;
  createdAt: Date;
}

export interface ITutorRequest extends Document {
  student: mongoose.Types.ObjectId;
  subject: string;
  budget: number;
  assignedTutor?: mongoose.Types.ObjectId;
  status: "pending" | "assigned" | "rejected";
  createdAt: Date;
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

export interface ITutorProfile extends Document {
  user: mongoose.Types.ObjectId;
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
  availability: {
    day: string;
    slots: string[];
  }[];
  isVerified: boolean;
  payoutDetails?: {
    method: "JazzCash" | "Easypaisa" | "Bank Transfer";
    accountTitle: string;
    accountNumber: string; // Phone number for JazzCash/Easypaisa, Account number for Bank
    bankName?: string;
    iban?: string;
  };
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
  status: "pending" | "paid" | "failed";
  paymentMethod: string;
  transactionId: string;
  paidAt: Date;
  createdAt: Date;
}