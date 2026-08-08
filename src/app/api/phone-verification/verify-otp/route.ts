import { NextRequest, NextResponse } from "next/server";
import MobileVerification from "@/database/models/mobile-verification.model";
import { auth } from "@clerk/nextjs/server";
import { smsProvider, fullPhoneNumber } from "@/lib/sms-service";
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
    const { otp } = body;
    if (!otp || otp.length < 4) {
      return NextResponse.json({ success: false, error: "Invalid OTP format" }, { status: 400 });
    }

    const verification = await MobileVerification.findOne({ user: user._id });
    if (!verification) {
      return NextResponse.json(
        { success: false, error: "No OTP sent for this user yet" },
        { status: 404 }
      );
    }

    if (verification.isVerified) {
      return NextResponse.json({
        success: true,
        message: "Phone already verified",
        verified: true,
      });
    }

    if (verification.otpExpiresAt && verification.otpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: "OTP expired. Please send a new code." },
        { status: 410 }
      );
    }

    // Verify via provider abstraction
    const fullNum = fullPhoneNumber(verification.countryCode, verification.mobileNumber);
    const verified = await smsProvider.verifyOtp(fullNum, otp);
    if (!verified.success) {
      return NextResponse.json(
        { success: false, error: verified.error || "Invalid OTP" },
        { status: 401 }
      );
    }

    // Mark verified
    verification.isVerified = true;
    verification.verifiedAt = new Date();
    verification.verificationMethod = "otp";
    verification.otp = undefined;
    verification.otpExpiresAt = undefined;
    await verification.save();

    logger.info("Phone verified successfully", { userId: user._id.toString() });

    return NextResponse.json({
      success: true,
      verified: true,
      verification: {
        countryCode: verification.countryCode,
        countryName: verification.countryName,
        mobileNumber: verification.mobileNumber,
        whatsappNumber: verification.whatsappNumber,
        whatsappSameAsMobile: verification.whatsappSameAsMobile,
        verifiedAt: verification.verifiedAt,
      },
    });
  } catch (err) {
    logger.error("verify-otp error", { error: err });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/** GET: Check user's phone verification status */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUserRecord(userId);
    if (!user?._id) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const verification = await MobileVerification.findOne({ user: user._id });
    return NextResponse.json({
      success: true,
      data: verification
        ? {
            isVerified: verification.isVerified,
            isConfirmed:
              verification.isVerified ||
              verification.confirmationState === "confirmed" ||
              verification.confirmationState === "verified",
            confirmedAt: verification.confirmedAt,
            verifiedAt: verification.verifiedAt,
            countryCode: verification.countryCode,
            countryName: verification.countryName,
            mobileNumber: verification.mobileNumber,
            whatsappNumber: verification.whatsappNumber,
            whatsappSameAsMobile: verification.whatsappSameAsMobile,
            confirmationState: verification.confirmationState,
          }
        : { isVerified: false, isConfirmed: false },
    });
  } catch (err) {
    logger.error("phone-verification status error", { error: err });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
