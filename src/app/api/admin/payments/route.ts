import { NextResponse } from "next/server";
import { connectDB } from "@/database/connect";
import Payment from "@/database/models/payment.model";

export async function GET(req: any) {
    try {
        await connectDB();

        const payments = await Payment.find({})
            .populate("student", "name")
            .populate("tutor", "name")
            .sort({ createdAt: -1 });

        // ===== STATS =====
        const totalRevenue = payments
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0);

        const commissionEarned = payments
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.commission, 0);

        const tutorEarnings = payments
            .filter(p => p.status === "paid")
            .reduce((sum, p) => sum + p.tutorEarning, 0);

        const pendingPayouts = payments
            .filter(p => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0);

        // ===== TABLE DATA =====
        const formattedPayments = payments.map(p => ({
            id: p._id,
            user: p.student?.name,
            amount: `$${p.amount}`,
            commission: `$${p.commission}`,
            tutorEarning: `$${p.tutorEarning}`,
            status: p.status,
            date: p.createdAt
        }));

        return NextResponse.json({
            stats: {
                totalRevenue,
                commissionEarned,
                tutorEarnings,
                pendingPayouts
            },
            payments: formattedPayments
        });
    } catch (error) {
            console.error("Error fetching payment data:", error);
            return NextResponse.json({ error: "Failed to fetch payment data" }, { status: 500 });
        }
    };

// data formattedPayment
// {
// id: "P101",
// user: "Alex Rivera",
// amount: "$150.00",
// commission: "$15.00",
//  earnings: "$135.00",
//  status: "Paid",
//  date: "Mar 15, 2024"
//  },