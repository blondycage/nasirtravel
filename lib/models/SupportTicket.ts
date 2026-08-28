import mongoose, { Schema, Document } from 'mongoose';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'normal' | 'high';
export type SupportTicketSource = 'chatbot' | 'contact_form';

export interface ISupportTicket extends Document {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  source: SupportTicketSource;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  metadata?: {
    lastUserMessage?: string;
    matchedEntryIds?: string[];
    evidenceSufficient?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    phone: { type: String, trim: true, maxlength: 60 },
    subject: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    source: {
      type: String,
      enum: ['chatbot', 'contact_form'],
      default: 'chatbot',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      required: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'high'],
      default: 'normal',
      required: true,
    },
    metadata: {
      lastUserMessage: { type: String, trim: true, maxlength: 1000 },
      matchedEntryIds: { type: [String], default: [] },
      evidenceSufficient: { type: Boolean },
    },
  },
  { timestamps: true }
);

SupportTicketSchema.index({ status: 1, createdAt: -1 });
SupportTicketSchema.index({ email: 1, createdAt: -1 });
SupportTicketSchema.index({ source: 1, createdAt: -1 });

export default mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
