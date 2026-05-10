import mongoose, { Schema, Document } from 'mongoose';

export interface IStatusHistoryEntry {
  from: string;
  to: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  note?: string;
}

export interface IReferral extends Document {
  referrer: mongoose.Types.ObjectId;
  referred: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  tour: mongoose.Types.ObjectId;
  referralCode: string;
  rewardType: 'fixed' | 'percentage';
  rewardValue: number;
  rewardAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  statusHistory: IStatusHistoryEntry[];
  paidAt?: Date;
  paidBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false } // no separate _id per entry — they're sub-documents
);

const ReferralSchema = new Schema<IReferral>(
  {
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referred: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    referralCode: { type: String, required: true },
    rewardType: { type: String, enum: ['fixed', 'percentage'], required: true },
    rewardValue: { type: Number, required: true },
    rewardAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'paid', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    paidAt: { type: Date },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ReferralSchema.index({ referrer: 1, status: 1 });
ReferralSchema.index({ referralCode: 1 });

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);
