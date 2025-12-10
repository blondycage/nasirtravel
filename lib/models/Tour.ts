import mongoose, { Schema, Document } from 'mongoose';

export interface ITour extends Document {
  title: string;
  category: string;
  packageType: 'umrah' | 'standard';
  image: string;
  departure?: string;
  accommodation: string;
  dates: string;
  price: string;
  isComing?: boolean;
  description?: string;
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  gallery?: string[];
  inclusions?: string[];
  exclusions?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const TourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    packageType: { type: String, enum: ['umrah', 'standard'], required: true, default: 'standard' },
    image: { type: String, required: true },
    departure: { type: String },
    accommodation: { type: String, required: true },
    dates: { type: String, required: true },
    price: { type: String },
    isComing: { type: Boolean, default: false },
    description: { type: String },
    itinerary: [
      {
        day: { type: Number },
        title: { type: String },
        description: { type: String },
      },
    ],
    gallery: [{ type: String }],
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

export default mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema);
