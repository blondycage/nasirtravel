import mongoose, { Schema, Document } from 'mongoose';

export interface IHajjInterestDependant {
  name: string;
  phoneNumber?: string;
  email?: string;
}

export interface IHajjInterest extends Document {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  partySize: '1' | '2' | '3' | '4+';
  packageType: 'luxury' | 'premium' | 'standard';
  accommodationType: 'non-shifting' | 'shifting';
  roomPreference: 'quad' | 'triple' | 'double';
  departurePort: string;
  planningToGo: 'yes' | 'no';
  dependants: IHajjInterestDependant[];
  createdAt: Date;
  updatedAt: Date;
}

const DependantSchema = new Schema<IHajjInterestDependant>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true },
  },
  { _id: false }
);

const HajjInterestSchema = new Schema<IHajjInterest>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    partySize: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '4+'],
    },
    packageType: {
      type: String,
      required: true,
      enum: ['luxury', 'premium', 'standard'],
    },
    accommodationType: {
      type: String,
      required: true,
      enum: ['non-shifting', 'shifting'],
    },
    roomPreference: {
      type: String,
      required: true,
      enum: ['quad', 'triple', 'double'],
    },
    departurePort: { type: String, required: true, trim: true },
    planningToGo: {
      type: String,
      required: true,
      enum: ['yes', 'no'],
    },
    dependants: {
      type: [DependantSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.HajjInterest || mongoose.model<IHajjInterest>('HajjInterest', HajjInterestSchema);
