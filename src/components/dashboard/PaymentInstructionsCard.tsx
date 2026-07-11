import Link from "next/link";
import { generateWhatsAppContactUrl } from "@/lib/whatsapp";
import { AlertCircle, MessageSquare, Info } from "lucide-react";

interface PaymentInstructionsCardProps {
  userData?: { name?: string; email?: string };
}

export function PaymentInstructionsCard({ userData }: PaymentInstructionsCardProps) {
  const contactUrl = generateWhatsAppContactUrl({
    name: userData?.name || "",
    email: userData?.email || "",
    customMessage: "Hello Ravencrest Academy! I need help with payment information."
  });

  return (
    <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
          <Info size={18} />
        </div>
        <div>
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
            Payment Instructions
          </h3>
          <p className="text-sm text-steel-blue mt-1">
            Contact admin for official payment details
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-amber-100 mb-4">
        <ul className="space-y-2 text-sm text-steel-blue">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
            <span>Contact admin for official bank/easypaisa/jazzcash details</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
            <span>After payment, send screenshot for verification</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
            <span>Bookings are confirmed only after payment verification</span>
          </li>
        </ul>
      </div>

      <Link
        href={contactUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-500 text-white font-bold text-sm uppercase tracking-widest border-2 border-amber-600 hover:bg-amber-600 hover:border-amber-700 transition-all rounded-xl shadow-[2px_2px_0px_0px_rgba(217,119,6,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
      >
        <MessageSquare size={18} />
        Contact Admin on WhatsApp
      </Link>
    </div>
  );
}
