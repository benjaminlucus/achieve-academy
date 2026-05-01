import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Payment from "@/database/models/payment.model";
import Session from "@/database/models/session.model";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transactionId, sessionId } = await req.json();

    if (!transactionId || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // 1. Verify payment with your provider (Stripe/PayPal/etc.)
    // For now, we simulate a successful verification
    const isPaymentValid = true; 

    if (!isPaymentValid) {
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    // 2. Find the session
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 3. Create a verified payment record
    const payment = await Payment.create({
      session: sessionId,
      student: session.student,
      tutor: session.tutor,
      amount: session.rate,
      commission: 20, // 20% default
      tutorEarning: session.rate * 0.8,
      monthNumber: session.monthsCompleted + 1,
      status: "paid",
      transactionId: transactionId,
      paidAt: new Date(),
    });

    // 4. Update session status
    await Session.findByIdAndUpdate(sessionId, {
      status: "active",
      lastPaymentDate: new Date(),
      $inc: { monthsCompleted: 1 }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Payment verified and recorded",
      paymentId: payment._id 
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
