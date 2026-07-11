'use client';

import React from 'react';
import { MessageCircle, DollarSign } from 'lucide-react';
import { generateWhatsAppContactUrl } from '@/lib/whatsapp';

interface TutorPaymentAssistanceCardProps {
  userData?: {
    name?: string;
    email?: string;
  };
}

export const TutorPaymentAssistanceCard: React.FC<TutorPaymentAssistanceCardProps> = ({ userData = {} }) => {
  const contactUrl = generateWhatsAppContactUrl({
    ...userData,
    customMessage: `Hello Ravencrest Academy,

I need assistance with payment-related issues.

Name: ${userData.name || ''}
Email: ${userData.email || ''}

Thank you.`
  });

  return (
    <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-none">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-none flex items-center justify-center flex-shrink-0">
          <DollarSign size={20} className="text-blue-700" />
        </div>
        <h3 className="text-xl font-bold text-blue-800 uppercase tracking-tight">
          Need Payment Assistance?
        </h3>
      </div>

      <p className="text-sm text-blue-700 mb-6 leading-relaxed">
        For account verification, withdrawals, payment issues, or financial inquiries, please contact the Ravencrest Academy administrator on WhatsApp.
      </p>

      {contactUrl !== '#' && (
        <a
          href={contactUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact Admin for Payment Assistance on WhatsApp"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-500 text-white font-bold text-sm uppercase tracking-widest border-2 border-blue-600 hover:bg-blue-600 hover:border-blue-700 transition-all shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <MessageCircle size={18} />
          Contact Admin
        </a>
      )}
    </div>
  );
};
