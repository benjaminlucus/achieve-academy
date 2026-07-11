interface WhatsAppContactParams {
  name?: string;
  email?: string;
  customMessage?: string;
}

export function generateWhatsAppContactUrl({ 
  name = '', 
  email = '', 
  customMessage 
}: WhatsAppContactParams = {}): string {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  
  if (!phoneNumber) {
    console.warn('NEXT_PUBLIC_WHATSAPP_NUMBER is not set');
    return '#';
  }
  
  const message = customMessage || `Hello Ravencrest Academy,

I need assistance regarding my account.

Name: ${name}
Email: ${email}

Thank you.`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
}

export function generateWhatsAppCommunityUrl(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL || '#';
}
