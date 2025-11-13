import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDependantProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  countryOfNationality?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  profession?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserDependantProfileSchema = new Schema<IUserDependantProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String },
    countryOfNationality: { type: String },
    firstName: { type: String },
    fatherName: { type: String },
    lastName: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    maritalStatus: { type: String },
    countryOfBirth: { type: String },
    cityOfBirth: { type: String },
    profession: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.UserDependantProfile || mongoose.model<IUserDependantProfile>('UserDependantProfile', UserDependantProfileSchema);
