import mongoose, { Schema } from "mongoose";
import type { IMobileVerification } from "../../../types";

const MobileVerificationSchema = new Schema<IMobileVerification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    countryCode: { type: String, required: true },
    countryName: { type: String, required: true },
    mobileNumber: { type: String, required: true, index: true },
    whatsappNumber: { type: String },
    whatsappSameAsMobile: { type: Boolean, default: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    otpAttempts: { type: Number, default: 0 },
    lastOtpSentAt: { type: Date },
    isVerified: { type: Boolean, default: false, index: true },
    verifiedAt: { type: Date },
    verificationMethod: {
      type: String,
      enum: ["otp", "manual", "admin"],
      required: true,
      default: "otp",
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isDuplicate: { type: Boolean, default: false },
    confirmationState: {
      type: String,
      enum: ["none", "confirmed", "verified"],
      required: true,
      default: "none",
    },
    confirmedAt: { type: Date },
    doubleEntryMatched: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate verified numbers
MobileVerificationSchema.index(
  { countryCode: 1, mobileNumber: 1, isVerified: 1 },
  { unique: true, partialFilterExpression: { isVerified: true } }
);

export default mongoose.models.MobileVerification ||
  mongoose.model<IMobileVerification>("MobileVerification", MobileVerificationSchema);
