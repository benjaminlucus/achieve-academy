import Link from "next/link";
import { generateWhatsAppContactUrl, generateWhatsAppCommunityUrl } from "@/lib/whatsapp";
import { MessageSquare, Users, Phone } from "lucide-react";

interface WhatsAppCardProps {
  userData?: { name?: string; email?: string };
}

export function WhatsAppCard({ userData }: WhatsAppCardProps) {
  const contactUrl = generateWhatsAppContactUrl({
    name: userData?.name || "",
    email: userData?.email || ""
  });
  const communityUrl = generateWhatsAppCommunityUrl();

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
          <Phone size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-dark-navy uppercase tracking-tight">
            Stay Connected
          </h3>
          <p className="text-sm text-steel-blue">
            Get updates & chat with admin
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {communityUrl && communityUrl !== "#" && (
          <Link
            href={communityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest border-2 border-emerald-600 hover:bg-emerald-600 hover:border-emerald-700 transition-all rounded-xl shadow-[2px_2px_0px_0px_rgba(5,150,105,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <Users size={18} />
            Join WhatsApp Channel
          </Link>
        )}

        <Link
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-dark-navy text-white font-bold text-sm uppercase tracking-widest border-2 border-dark-navy hover:bg-dark-navy/90 hover:border-dark-navy/80 transition-all rounded-xl shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <MessageSquare size={18} />
          Contact Admin
        </Link>
      </div>
    </div>
  );
}
