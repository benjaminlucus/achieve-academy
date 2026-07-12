"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import TutorProfile from "@/database/models/tutor.model";
import StudentProfile from "@/database/models/student.model";
import Session from "@/database/models/session.model";
import Payment from "@/database/models/payment.model";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { studentProfileSchema, tutorProfileSchema } from "@/lib/validations";
import { PLATFORM_COMMISSION_RATE } from "@/lib/constants";
import { triggerDashboardUpdate, triggerUserUpdate, triggerSessionUpdate, triggerPaymentUpdate } from "@/lib/realtime-events";

export async function createStudySession(data: {
  tutorId: string;
  studentId: string;
  subject: string;
  startDate: string;
  duration: number; // in minutes
  rate: number;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    // Only tutors can create sessions for now (or admins)
    if (currentUser.role !== "tutor" && currentUser.role !== "admin") {
      throw new Error("Only tutors or admins can schedule sessions");
    }

    const start = new Date(data.startDate);
    const end = new Date(start.getTime() + data.duration * 60000);

    const session = await Session.create({
      student: data.studentId,
      tutor: data.tutorId,
      subject: data.subject,
      startDate: start,
      endDate: end,
      rate: data.rate,
      status: "active"
    });

    await triggerSessionUpdate(session._id.toString(), "created", session);
    await triggerDashboardUpdate(data.tutorId);
    await triggerDashboardUpdate(data.studentId);
    revalidatePath("/dashboard");
    return { success: true, sessionId: session._id.toString() };
  } catch (error: any) {
    console.error("Create Session Error:", error);
    return { success: false, error: error.message };
  }
}


export async function updateSessionAttendance(sessionId: string, attendanceData: { date: string; present: boolean }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    
    const session = await Session.findByIdAndUpdate(sessionId, {
      $push: {
        attendance: {
          date: new Date(attendanceData.date),
          present: attendanceData.present
        }
      }
    }, { new: true });

    if (session) {
      await triggerSessionUpdate(sessionId, "attendance-updated", session);
      await triggerDashboardUpdate(session.student.toString());
      await triggerDashboardUpdate(session.tutor.toString());
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update Attendance Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTutorProfile(userId: string, rawData: any) {
  const { userId: clerkId } = await auth();

  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // 1. Validate data
  const validatedData = tutorProfileSchema.parse(rawData);

  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) {
    throw new Error("Unauthorized");
  }

  await User.findByIdAndUpdate(userId, {
    name: validatedData.name,
    country: validatedData.country,
    timezone: validatedData.timezone,
  });

  await TutorProfile.findOneAndUpdate(
    { user: userId },
    {
      subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
      skills: typeof validatedData.skills === 'string' ? validatedData.skills.split(",").map((s: string) => s.trim()) : validatedData.skills || [],
      languages: typeof validatedData.languages === 'string' ? validatedData.languages.split(",").map((s: string) => s.trim()) : validatedData.languages || [],
      experienceYears: Number(validatedData.experienceYears) || 0,
      education: validatedData.education || "",
      hourlyRate: Number(validatedData.hourlyRate) || 0,
      monthlyRate: Number(validatedData.monthlyRate) || 0,
      bio: validatedData.bio || "",
      availability: validatedData.availability || [],
      payoutDetails: validatedData.payoutDetails,
    }
  );

  await triggerDashboardUpdate(userId);
  await triggerUserUpdate(userId, "profile-updated");
  revalidatePath(`/tutors/${userId}/dashboard`);

  return { success: true };
}

export async function updateStudentProfile(userId: string, rawData: any) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  await connectDB();

  // 1. Validate data
  const validatedData = studentProfileSchema.parse(rawData);

  // Ensure user is updating their own profile
  const user = await User.findById(userId);
  if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

  // Update User fields
  await User.findByIdAndUpdate(userId, {
    name: validatedData.name,
    country: validatedData.country,
    timezone: validatedData.timezone,
  });

  // Update StudentProfile fields
  await StudentProfile.findOneAndUpdate(
    { user: userId },
    {
      whichClass: validatedData.whichClass,
      learningGoals: validatedData.learningGoals,
      subjects: typeof validatedData.subjects === 'string' ? validatedData.subjects.split(",").map((s: string) => s.trim()) : validatedData.subjects || [],
      description: validatedData.description || "",
    }
  );

  await triggerDashboardUpdate(userId);
  await triggerUserUpdate(userId, "profile-updated");
  revalidatePath(`/students/${userId}/dashboard`);
  return { success: true };
}

export async function updateProfileImage(userId: string, imageBase64: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findById(userId);
    if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

    await User.findByIdAndUpdate(userId, { profileImage: imageBase64 });
    
    await triggerDashboardUpdate(userId);
    await triggerUserUpdate(userId, "profile-image-updated");
    // Revalidate multiple possible paths
    revalidatePath(`/tutors/${userId}/dashboard`);
    revalidatePath(`/students/${userId}/dashboard`);
    revalidatePath(`/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Update Profile Image Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateBannerImage(userId: string, imageBase64: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findById(userId);
    if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

    await User.findByIdAndUpdate(userId, { bannerImage: imageBase64 });
    
    await triggerDashboardUpdate(userId);
    await triggerUserUpdate(userId, "banner-updated");
    revalidatePath(`/tutors/${userId}/dashboard`);
    revalidatePath(`/students/${userId}/dashboard`);
    revalidatePath(`/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Update Banner Image Error:", error);
    return { success: false, error: error.message };
  }
}

export async function removeBannerImage(userId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findById(userId);
    if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

    await User.findByIdAndUpdate(userId, { $unset: { bannerImage: "" } });
    
    await triggerDashboardUpdate(userId);
    await triggerUserUpdate(userId, "banner-removed");
    revalidatePath(`/tutors/${userId}/dashboard`);
    revalidatePath(`/students/${userId}/dashboard`);
    revalidatePath(`/dashboard`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Remove Banner Image Error:", error);
    return { success: false, error: error.message };
  }
}

export async function submitPaymentProof(data: {
  paymentId?: string;
  sessionId: string;
  monthNumber: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
  screenshot: string;
}) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const currentUser = await User.findOne({ clerkId });
    if (!currentUser) throw new Error("User not found");

    const session = await Session.findById(data.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.student.toString() !== currentUser._id.toString()) {
      throw new Error("Unauthorized: This session does not belong to you");
    }

    const commission = data.amount * PLATFORM_COMMISSION_RATE;
    const tutorEarning = data.amount - commission;

    let payment;
    
    if (data.paymentId) {
      // Resubmitting rejected payment
      payment = await Payment.findById(data.paymentId);
      if (!payment) throw new Error("Payment not found");
      if (payment.student.toString() !== currentUser._id.toString()) {
        throw new Error("Unauthorized");
      }
      
      payment.status = "submitted";
      payment.amount = data.amount;
      payment.commission = commission;
      payment.tutorEarning = tutorEarning;
      payment.paymentMethod = data.paymentMethod;
      payment.transactionId = data.transactionId;
      payment.notes = data.notes;
      payment.screenshot = data.screenshot;
      payment.rejectionReason = undefined;
      payment.history.push({
        action: "Resubmitted payment proof",
        timestamp: new Date()
      });
    } else {
      // Creating new payment
      payment = await Payment.create({
        session: session._id,
        student: currentUser._id,
        tutor: session.tutor,
        amount: data.amount,
        commission,
        tutorEarning,
        monthNumber: data.monthNumber,
        status: "submitted",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        screenshot: data.screenshot,
        history: [{
          action: "Submitted payment proof",
          timestamp: new Date()
        }]
      });
    }

    await payment.save();

    await triggerPaymentUpdate(payment._id.toString(), data.paymentId ? "resubmitted" : "created", payment);
    await triggerDashboardUpdate(currentUser._id.toString());
    await triggerDashboardUpdate(session.tutor.toString());
    revalidatePath(`/students/${currentUser._id}/dashboard`);
    
    return { success: true, paymentId: payment._id.toString() };
  } catch (error: any) {
    console.error("Submit Payment Proof Error:", error);
    return { success: false, error: error.message };
  }
}

export async function confirmWhatsAppJoined(userId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findById(userId);
    if (!user || user.clerkId !== clerkId) throw new Error("Unauthorized");

    user.hasJoinedWhatsAppCommunity = true;
    await user.save();

    await triggerDashboardUpdate(userId);
    await triggerUserUpdate(userId, "whatsapp-joined");

    revalidatePath(`/tutors/${userId}/dashboard`);
    revalidatePath(`/students/${userId}/dashboard`);
    revalidatePath(`/dashboard`);

    return { success: true };
  } catch (error: any) {
    console.error("Confirm WhatsApp Joined Error:", error);
    return { success: false, error: error.message };
  }
}

