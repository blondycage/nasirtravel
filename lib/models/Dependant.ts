import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  name: string;
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface IDependant extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  passportNumber?: string;
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

const DependantSchema = new Schema<IDependant>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String },
    documents: [DocumentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Dependant || mongoose.model<IDependant>('Dependant', DependantSchema);
