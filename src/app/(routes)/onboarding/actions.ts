"use server";

import { connectDB } from "@/database/connect";
import User from "@/database/models/user.model";
import StudentProfile from "@/database/models/student.model";
import TutorProfile from "@/database/models/tutor.model";
import MobileVerification from "@/database/models/mobile-verification.model";
import Expertise from "@/database/models/expertise.model";
import ExpertiseCategory from "@/database/models/expertise-category.model";
import ExpertiseSubject from "@/database/models/expertise-subject.model";
import EducationLevel from "@/database/models/education-level.model";
import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { onboardingSchema } from "@/lib/validations";

export async function completeOnboarding(rawData: any) {
  const startTime = Date.now();

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");


    // Step 1: Validate incoming data
    const validatedData = onboardingSchema.parse(rawData);

    // Step 2: Parallel fetch Clerk user and connect to DB
    const [clerkUser] = await Promise.all([
      currentUser(),
      connectDB(),
    ]);
    if (!clerkUser) throw new Error("Clerk user not found");

    const role = validatedData.role;

    // Step 3: Admin role check (security critical)
    if (role === "admin") {
      const serverPin = process.env.ADMIN_ONBOARDING_PIN || "123456";
      if (validatedData.secretPin !== serverPin) {
        throw new Error("Invalid admin PIN");
      }
    } else {
      // Step 3b: Phone confirmation required for students/tutors
      const tempUser = await User.findOne({ clerkId: userId }, { _id: 1 });
      let dbConfirmed = false;
      if (tempUser) {
        const verification = await MobileVerification.findOne({ user: tempUser._id });
        dbConfirmed =
          !!verification &&
          (verification.isVerified === true ||
            verification.confirmationState === "confirmed" ||
            verification.confirmationState === "verified");
      }
      const pv = validatedData.phoneVerification;
      const clientConfirmed = !!(pv && (pv.isVerified || pv.isConfirmed));
      if (!dbConfirmed && !clientConfirmed) {
        throw new Error("Phone number confirmation is required before onboarding can complete.");
      }
    }

    // Step 4: Find existing user or get new _id
    const existingUser = await User.findOne({ clerkId: userId }, { _id: 1 });
    const mongoId = existingUser?._id || new mongoose.Types.ObjectId();

    // Step 5: Prepare all data updates
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

    const userUpdatePromise = User.findOneAndUpdate(
      { clerkId: userId },
      {
        _id: mongoId,
        clerkId: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0].emailAddress,
        role,
        profileImage: clerkUser.imageUrl,
        isOnboarded: true,
        country: validatedData.country || "",
        timezone: validatedData.timezone || "",
        status: role === "admin" ? "verified" : "applied",
      },
      { upsert: true, new: true, lean: true } // Use lean for better performance
    );

    const profilePromise =
      role === "student"
        ? StudentProfile.findOneAndUpdate(
            { user: mongoId },
            {
              user: mongoId,
              whichClass: validatedData.whichClass || "",
              subjects:
                typeof validatedData.subjects === "string"
                  ? validatedData.subjects.split(",").map((s: string) => s.trim())
                  : validatedData.subjects || [],
              learningGoals: validatedData.learningGoals || "",
              description: validatedData.description || "",
            },
            { upsert: true }
          )
        : role === "tutor"
        ? (async () => {
            const parsedSubjects: string[] =
              typeof validatedData.subjects === "string"
                ? validatedData.subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
                : (validatedData.subjects || []).map((s: string) => String(s).trim()).filter(Boolean);

            const parsedOnboardingExpertise: string[] = [];
            if (validatedData.onboardingExpertise) {
              for (const part of String(validatedData.onboardingExpertise).split(",")) {
                const trimmed = part.trim();
                if (trimmed) parsedOnboardingExpertise.push(trimmed);
              }
            }

            const mergedSubjects: string[] = [];
            const seen = new Set<string>();
            for (const s of [...parsedSubjects, ...parsedOnboardingExpertise]) {
              const k = s.toLowerCase();
              if (!seen.has(k)) {
                seen.add(k);
                mergedSubjects.push(s);
              }
            }

            const teachingLevelsRaw: string[] = Array.isArray(validatedData.teachingLevels)
              ? validatedData.teachingLevels.map((l) => String(l).trim()).filter(Boolean)
              : [];

            const profile = await TutorProfile.findOneAndUpdate(
              { user: mongoId },
              {
                user: mongoId,
                subjects: mergedSubjects,
                skills:
                  typeof validatedData.skills === "string"
                    ? validatedData.skills.split(",").map((s: string) => s.trim())
                    : validatedData.skills || [],
                experienceYears: Number(validatedData.experienceYears) || 0,
                education: validatedData.education || "",
                hourlyRate: Number(validatedData.hourlyRate) || 0,
                monthlyRate: Number(validatedData.monthlyRate) || 0,
                bio: validatedData.bio || "",
                languages:
                  typeof validatedData.languages === "string"
                    ? validatedData.languages.split(",").map((s: string) => s.trim())
                    : validatedData.languages || [],
                availability: validatedData.availability || [],
                payoutDetails: validatedData.payoutDetails,
                isVerified: false,
                teachingLevels: teachingLevelsRaw,
                teachingLevelsOther: validatedData.teachingLevelsOther || "",
                experienceLevel: validatedData.experienceLevel || "Less than 1 year",
                maxClassSize: validatedData.maxClassSize || 1,
                teachingLanguage:
                  typeof validatedData.teachingLanguage === "string"
                    ? validatedData.teachingLanguage.split(",").map((s: string) => s.trim())
                    : validatedData.teachingLanguage || [],
                hasDegree: validatedData.hasDegree || false,
                degreeName: validatedData.degreeName || "",
                universityName: validatedData.universityName || "",
                graduationYear: validatedData.graduationYear || "",
                degreeDocument: validatedData.degreeDocument,
                certificateDocuments: validatedData.certificateDocuments || [],
                certifications:
                  typeof validatedData.certifications === "string"
                    ? validatedData.certifications.split(",").map((s: string) => s.trim())
                    : validatedData.certifications || [],
              },
              { upsert: true, new: true, lean: false }
            );

            if (validatedData.expertiseEntries && validatedData.expertiseEntries.length > 0) {
              const allEducationLevels = await EducationLevel.find({ isActive: true }).lean();
              const educationLevelIds = new Set(allEducationLevels.map((level: any) => String(level._id)));
              const addedSubjects: string[] = [];

              for (const entry of validatedData.expertiseEntries) {
                const validLevelIds = entry.teachingLevels.filter((id) => educationLevelIds.has(String(id)));
                const subjectDocs = await ExpertiseSubject.find({
                  _id: { $in: entry.subjects },
                  category: entry.category,
                  isActive: true,
                }).select("_id name category").lean();

                for (const subject of subjectDocs as any[]) {
                  await Expertise.findOneAndUpdate(
                    { tutor: mongoId, subject: subject._id },
                    {
                      $setOnInsert: {
                        tutor: mongoId,
                        category: subject.category,
                        subject: subject._id,
                        teachingLevels: validLevelIds,
                        teachingLanguages: entry.teachingLanguages,
                        experience: entry.experience || 0,
                        teachingStrength: entry.teachingStrength || "good",
                        hourlyRate: entry.hourlyRate || undefined,
                        specialNotes: entry.specialNotes || "",
                        visibility: entry.visibility || "public",
                        isActive: true,
                      },
                    },
                    { upsert: true }
                  );
                  addedSubjects.push(subject.name);
                }
              }

              if (addedSubjects.length > 0) {
                await TutorProfile.updateOne(
                  { user: mongoId },
                  { $addToSet: { subjects: { $each: addedSubjects } } }
                );
              }
            } else if (parsedOnboardingExpertise.length > 0) {
              try {
                let defaultCategory = await ExpertiseCategory.findOne({ isActive: true }).sort({ sortOrder: 1 });
                if (!defaultCategory) {
                  defaultCategory = await ExpertiseCategory.findOneAndUpdate(
                    { name: "General" },
                    { name: "General", isActive: true, sortOrder: 0 },
                    { upsert: true, new: true }
                  );
                }

                const allEducationLevels = await EducationLevel.find({ isActive: true }).lean();
                const eduLevelMap = new Map<string, mongoose.Types.ObjectId>();
                for (const el of allEducationLevels as any[]) {
                  eduLevelMap.set(String(el.name).toLowerCase(), el._id);
                }

                const matchedTeachingLevelIds: mongoose.Types.ObjectId[] = [];
                for (const tl of teachingLevelsRaw) {
                  const id = eduLevelMap.get(tl.toLowerCase());
                  if (id) matchedTeachingLevelIds.push(id);
                }

                for (const expertiseName of parsedOnboardingExpertise) {
                  const lowerName = expertiseName.toLowerCase();
                  let expertiseSubjectDoc = await ExpertiseSubject.findOne({
                    name: { $regex: new RegExp(`^${lowerName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
                  });
                  if (!expertiseSubjectDoc) {
                    expertiseSubjectDoc = await ExpertiseSubject.create({
                      category: defaultCategory._id,
                      name: expertiseName,
                      isActive: true,
                      sortOrder: 0,
                    });
                  }

                  const existing = await Expertise.findOne({
                    tutor: mongoId,
                    subject: expertiseSubjectDoc._id,
                  });
                  if (!existing) {
                    await Expertise.create({
                      tutor: mongoId,
                      category: expertiseSubjectDoc.category,
                      subject: expertiseSubjectDoc._id,
                      teachingLevels: matchedTeachingLevelIds,
                      teachingLanguages:
                        Array.isArray(profile.teachingLanguage) && profile.teachingLanguage.length > 0
                          ? profile.teachingLanguage
                          : ["English"],
                      experience: Number(validatedData.experienceYears) || 0,
                      hourlyRate: Number(validatedData.hourlyRate) || undefined,
                      specialNotes: "",
                      isActive: true,
                      visibility: "public",
                    });
                  }
                }
              } catch (err: any) {
                console.error("[Onboarding] Failed to create expertise entries (non-fatal):", err?.message || err);
              }
            }

            return profile;
          })()
        : Promise.resolve();

    const clerkMetadataPromise = clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        isOnboarded: true,
        role: role,
      },
    });

    // Step 6: Run all updates in parallel for speed
    const [updatedUser] = await Promise.all([
      userUpdatePromise,
      profilePromise,
      clerkMetadataPromise,
    ]);


    // Step 7: VERIFY the user was saved correctly (critical!)
    const verifyUser = await getCurrentUser(userId);

    if (!verifyUser) {
      throw new Error("Failed to verify user was created in MongoDB");
    }

    if (!verifyUser.isOnboarded) {
      throw new Error("User was not marked as onboarded in MongoDB");
    }

    if (!verifyUser.role) {
      throw new Error("User role was not saved in MongoDB");
    }

    return { success: true };
  } catch (error: any) {
    console.error("[Onboarding] Error:", error);
    return {
      success: false,
      error: error.message || "Something went wrong",
    };
  }
}

// Helper function to get current user with lean for consistency
async function getCurrentUser(clerkId: string) {
  await connectDB();
  return User.findOne({ clerkId }).lean();
}
