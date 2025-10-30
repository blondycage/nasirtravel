import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
