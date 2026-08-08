import { NextRequest, NextResponse } from "next/server";
import MobileVerification from "@/database/models/mobile-verification.model";
import { auth } from "@clerk/nextjs/server";
import { smsProvider, fullPhoneNumber } from "@/lib/sms-service";
import { logger } from "@/lib/logger";
import crypto from "crypto";
import { getOrCreateUserRecord } from "@/lib/get-or-create-user";

const MAX_OTP_REQUESTS = 5;
const OTP_WINDOW_MS = 15 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const MIN_RESEND_MS = 60 * 1000;

function countWindowedAttempts(attempts: number, lastSentAt: Date | null | undefined): number {
  if (!lastSentAt) return attempts > 0 ? 1 : 0;
  const now = Date.now();
  if (now - lastSentAt.getTime() >= OTP_WINDOW_MS) return 0;
  return Math.min(attempts, MAX_OTP_REQUESTS);
}

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
    const { countryCode, countryName, mobileNumber, whatsappNumber, whatsappSameAsMobile = true } = body;

    if (!countryCode || !countryName || !mobileNumber) {
      return NextResponse.json(
        { success: false, error: "Country code, country name and mobile number are required" },
        { status: 400 }
      );
    }

    const fullNum = fullPhoneNumber(countryCode, mobileNumber);
    const now = Date.now();

    // Find existing record
    let verification = await MobileVerification.findOne({
      user: user._id,
    });

    // Check if this number is already verified by another user
    const duplicate = await MobileVerification.findOne({
      countryCode,
      mobileNumber,
      isVerified: true,
      user: { $ne: user._id },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "This phone number is already verified by another account" },
        { status: 409 }
      );
    }

    const lastSent = verification?.lastOtpSentAt ? verification.lastOtpSentAt.getTime() : 0;
    if (lastSent && now - lastSent < MIN_RESEND_MS) {
      const seconds = Math.ceil((MIN_RESEND_MS - (now - lastSent)) / 1000);
      return NextResponse.json(
        { success: false, error: `Please wait ${seconds} seconds before requesting a new code` },
        { status: 429 }
      );
    }
    const windowedAttempts = countWindowedAttempts(verification?.otpAttempts ?? 0, verification?.lastOtpSentAt);
    const newAttemptCount = windowedAttempts === 0 ? 1 : (verification?.otpAttempts ?? 0) + 1;
    if (windowedAttempts >= MAX_OTP_REQUESTS) {
      return NextResponse.json(
        { success: false, error: "Too many OTP requests. Try again later." },
        { status: 429 }
      );
    }

    const rawOtp = "123456";
    const otpHash = crypto
      .createHash("sha256")
      .update(rawOtp + (process.env.OTP_PEPPER || "ravencrest-dev"))
      .digest("hex");
    const otpExpires = new Date(now + OTP_TTL_MS);

    const sent = await smsProvider.sendOtp(fullNum);
    if (!sent.success) {
      logger.error("smsProvider.sendOtp failed", { error: sent.error, provider: sent.provider });
      return NextResponse.json(
        {
          success: false,
          error: sent.error || "Failed to send OTP. Check SMS provider config.",
          provider: sent.provider,
        },
        { status: 502 }
      );
    }

    verification = await MobileVerification.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          countryCode,
          countryName,
          mobileNumber,
          whatsappNumber: whatsappSameAsMobile
            ? fullPhoneNumber(countryCode, mobileNumber).replace("+", "")
            : whatsappNumber,
          whatsappSameAsMobile,
          otp: otpHash,
          otpExpiresAt: otpExpires,
          otpAttempts: newAttemptCount,
          lastOtpSentAt: new Date(now),
          isDuplicate: !!duplicate,
          verificationMethod: "otp",
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      provider: sent.provider,
      mockOtp: sent.mockOtp, // Only in mock mode
      expiresAt: otpExpires.toISOString(),
      verification: {
        countryCode: verification.countryCode,
        mobileNumber: verification.mobileNumber,
        whatsappSameAsMobile: verification.whatsappSameAsMobile,
      },
    });
  } catch (err) {
    logger.error("send-otp error", { error: err });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
