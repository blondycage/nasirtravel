import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: Date;
  specialRequests?: string;
  documents: IDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const BookingSchema = new Schema<IBooking>(
  {
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    numberOfTravelers: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: { type: String },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    bookingDate: { type: Date, required: true },
    specialRequests: { type: String },
    documents: [DocumentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
