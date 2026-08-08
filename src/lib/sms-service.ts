import { env } from "./env";
import { logger } from "./logger";

export interface SendOtpResult {
  success: boolean;
  provider: string;
  verificationSid?: string;
  otpSent?: boolean;
  mockOtp?: string; // Only in mock mode
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  provider: string;
  error?: string;
}

export interface ISmsProvider {
  name: string;
  sendOtp(phoneNumberWithCountry: string): Promise<SendOtpResult>;
  verifyOtp(phoneNumberWithCountry: string, otpCode: string): Promise<VerifyOtpResult>;
}

/* ===========================
   MOCK SMS PROVIDER (for dev)
   =========================== */
class MockSmsProvider implements ISmsProvider {
  name = "mock";

  async sendOtp(phoneNumberWithCountry: string): Promise<SendOtpResult> {
    const mockOtp = "123456"; // Fixed mock OTP for dev
    logger.warn(`[Mock SMS] Would send OTP ${mockOtp} to ${phoneNumberWithCountry} — Replace with real provider in production.`);
    return {
      success: true,
      provider: "mock",
      otpSent: true,
      mockOtp,
    };
  }

  async verifyOtp(phoneNumberWithCountry: string, otpCode: string): Promise<VerifyOtpResult> {
    const success = otpCode === "123456";
    return {
      success,
      provider: "mock",
      error: success ? undefined : "Invalid OTP code (mock mode: use 123456)",
    };
  }
}

/* ===========================
   TWILIO SMS PROVIDER
   =========================== */
type TwilioClient = ReturnType<typeof require> extends never ? any : any;

class TwilioSmsProvider implements ISmsProvider {
  name = "twilio";
  private clientPromise: Promise<TwilioClient> | null = null;

  private async getClient(): Promise<TwilioClient> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const mod = await import("twilio");
        const Twilio = (mod as any).default || mod;
        return new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
      })();
    }
    return this.clientPromise;
  }

  async sendOtp(phoneNumberWithCountry: string): Promise<SendOtpResult> {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      logger.warn("[Twilio] Missing credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN)");
      return { success: false, provider: "twilio", error: "Missing Twilio credentials" };
    }
    if (!env.TWILIO_SERVICE_SID) {
      logger.warn("[Twilio] Missing TWILIO_SERVICE_SID (Verify Service)");
      return { success: false, provider: "twilio", error: "Missing TWILIO_SERVICE_SID" };
    }

    try {
      const client = await this.getClient();
      const verification = await client.verify.v2
        .services(env.TWILIO_SERVICE_SID)
        .verifications.create({ to: phoneNumberWithCountry, channel: "sms" });

      return {
        success: verification.status === "pending" || verification.status === "approved",
        provider: "twilio",
        verificationSid: verification.sid,
        otpSent: true,
      };
    } catch (err) {
      logger.error("Twilio send OTP error", { error: err });
      return { success: false, provider: "twilio", error: (err as any)?.message || "Unknown Twilio error" };
    }
  }

  async verifyOtp(phoneNumberWithCountry: string, otpCode: string): Promise<VerifyOtpResult> {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      return { success: false, provider: "twilio", error: "Missing Twilio credentials" };
    }
    if (!env.TWILIO_SERVICE_SID) {
      return { success: false, provider: "twilio", error: "Missing TWILIO_SERVICE_SID" };
    }

    try {
      const client = await this.getClient();
      const check = await client.verify.v2
        .services(env.TWILIO_SERVICE_SID)
        .verificationChecks.create({ to: phoneNumberWithCountry, code: otpCode });

      return {
        success: check.status === "approved",
        provider: "twilio",
        error: check.status === "approved" ? undefined : "Invalid OTP",
      };
    } catch (err) {
      logger.error("Twilio verify OTP error", { error: err });
      return { success: false, provider: "twilio", error: (err as any)?.message || "Invalid OTP" };
    }
  }
}

/* ===========================
   FACTORY
   =========================== */
function getProvider(): ISmsProvider {
  switch (env.SMS_PROVIDER) {
    case "twilio":
      return new TwilioSmsProvider();
    case "mock":
      return new MockSmsProvider();
    case "none":
    default:
      // None acts like mock but logs that it's disabled
      return new MockSmsProvider();
  }
}

export const smsProvider = getProvider();

export function fullPhoneNumber(countryCode: string, mobileNumber: string): string {
  const cleanedCode = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
  const cleanedNum = mobileNumber.replace(/\D/g, "");
  return `${cleanedCode}${cleanedNum}`;
}
