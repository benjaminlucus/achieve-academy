import { NextRequest, NextResponse } from "next/server";
import MobileVerification from "@/database/models/mobile-verification.model";
import { auth } from "@clerk/nextjs/server";
import { fullPhoneNumber } from "@/lib/sms-service";
import { logger } from "@/lib/logger";
import { getOrCreateUserRecord } from "@/lib/get-or-create-user";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUserRecord(userId);
    if (!user?._id) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      countryCode,
      countryName,
      mobileNumber,
      whatsappNumber,
      whatsappSameAsMobile = true,
      confirmedReEntry,
    } = body;

    if (!countryCode || !countryName || !mobileNumber) {
      return NextResponse.json(
        { success: false, error: "Country code, country name and mobile number are required" },
        { status: 400 }
      );
    }

    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mobile number is too short" },
        { status: 400 }
      );
    }

    // Check for duplicate verified numbers by another user
    const duplicate = await MobileVerification.findOne({
      countryCode,
      mobileNumber: cleanedMobile,
      isVerified: true,
      user: { $ne: user._id },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "This phone number is already verified by another account" },
        { status: 409 }
      );
    }

    // Preserve verified state if OTP was previously verified
    const existing = await MobileVerification.findOne({ user: user._id });
    const preserveVerified = existing?.isVerified ?? false;
    const preserveVerifiedAt = existing?.verifiedAt;
    const preserveVerificationMethod = existing?.verificationMethod;
    const confirmationState: "confirmed" | "verified" = preserveVerified ? "verified" : "confirmed";
    const doubleEntryMatched =
      typeof confirmedReEntry === "string"
        ? confirmedReEntry.replace(/\D/g, "") === cleanedMobile
        : undefined;

    const verification = await MobileVerification.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          countryCode,
          countryName,
          mobileNumber: cleanedMobile,
          whatsappNumber: whatsappSameAsMobile
            ? fullPhoneNumber(countryCode, cleanedMobile).replace("+", "")
            : whatsappNumber?.replace(/\D/g, ""),
          whatsappSameAsMobile,
          confirmationState,
          confirmedAt: confirmationState === "confirmed" ? new Date() : existing?.confirmedAt,
          doubleEntryMatched,
          ...(preserveVerified
            ? {
                isVerified: true,
                verifiedAt: preserveVerifiedAt,
                verificationMethod: preserveVerificationMethod ?? "otp",
              }
            : {}),
          verificationMethod:
            preserveVerified ? preserveVerificationMethod ?? "otp" : existing?.verificationMethod ?? "otp",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    logger.info("Phone number confirmed", { userId: user._id.toString(), state: confirmationState });

    return NextResponse.json({
      success: true,
      confirmationState,
      doubleEntryMatched,
      isConfirmed: confirmationState === "confirmed" || confirmationState === "verified",
      verification: {
        countryCode: verification.countryCode,
        countryName: verification.countryName,
        mobileNumber: verification.mobileNumber,
        whatsappNumber: verification.whatsappNumber,
        whatsappSameAsMobile: verification.whatsappSameAsMobile,
        isConfirmed: true,
        isVerified: verification.isVerified,
        confirmedAt: confirmationState === "confirmed" ? verification.confirmedAt : undefined,
        verifiedAt: verification.verifiedAt,
      },
    });
  } catch (err) {
    logger.error("confirm-number error", { error: err });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
