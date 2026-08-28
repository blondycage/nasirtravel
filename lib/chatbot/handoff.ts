export interface HandoffAction {
  type: 'whatsapp';
  label: string;
  url: string;
}

function normalizeWhatsAppNumber(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function getWhatsAppHandoffAction(message?: string): HandoffAction | null {
  const rawNumber = process.env.SUPPORT_WHATSAPP_NUMBER;
  if (!rawNumber) return null;

  const phone = normalizeWhatsAppNumber(rawNumber);
  if (!phone) return null;

  const text = message
    ? `Hello Naasir Travel, I need help with: ${message}`
    : 'Hello Naasir Travel, I need help with my travel enquiry.';

  return {
    type: 'whatsapp',
    label: 'Chat with our travel team on WhatsApp',
    url: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
  };
}

export function shouldOfferHumanHandoff(message: string, evidenceSufficient: boolean) {
  const normalized = message.toLowerCase();

  return !evidenceSufficient ||
    /human|agent|person|someone|staff|representative|complaint|dispute|problem|booking status|specific booking/.test(normalized);
}
