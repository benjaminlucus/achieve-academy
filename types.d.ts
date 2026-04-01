import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "student" | "tutor" | "admin";
  status: "active" | "blocked";
  profileImage?: string;
  country?: string;
  timezone?: string;
  lastLogin?: Date;
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
  durationType: "monthly";
  status: "active" | "completed" | "cancelled";
  price: number;
  monthsCompleted: number;
  lastPaymentDate?: Date;
  createdAt: Date;
}

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  gradeLevel: string;
  interests: string[];
  preferredSubjects: string[];
  learningGoals: string;
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
  bio: string;
  languages: string[];
  rating: number;
  totalStudents: number;
  availability: {
    day: string;
    slots: string[];
  }[];
  isVerified: boolean;
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
