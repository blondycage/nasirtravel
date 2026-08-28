import mongoose, { Schema, Document } from 'mongoose';

export interface IChatQuestion extends Document {
  message?: string;
  normalizedQuery: string;
  matchedEntries: {
    id: string;
    category: string;
    lexicalScore?: number;
    combinedScore?: number;
    score?: number;
  }[];
  evidenceSufficient?: boolean;
  evidenceReason?: string;
  guardrailAllowed?: boolean;
  guardrailReason?: string;
  handoffOffered?: boolean;
  model?: string;
  latencyMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatQuestionSchema = new Schema<IChatQuestion>(
  {
    message: { type: String, trim: true, maxlength: 1000 },
    normalizedQuery: { type: String, required: true, trim: true, maxlength: 1000 },
    matchedEntries: {
      type: [
        {
          id: { type: String, required: true },
          category: { type: String, required: true },
          lexicalScore: { type: Number },
          combinedScore: { type: Number },
          score: { type: Number },
        },
      ],
      default: [],
    },
    evidenceSufficient: { type: Boolean },
    evidenceReason: { type: String, trim: true },
    guardrailAllowed: { type: Boolean },
    guardrailReason: { type: String, trim: true },
    handoffOffered: { type: Boolean },
    model: { type: String, trim: true },
    latencyMs: { type: Number },
  },
  { timestamps: true }
);

ChatQuestionSchema.index({ createdAt: -1 });
ChatQuestionSchema.index({ 'matchedEntries.category': 1, createdAt: -1 });

export default mongoose.models.ChatQuestion ||
  mongoose.model<IChatQuestion>('ChatQuestion', ChatQuestionSchema);
