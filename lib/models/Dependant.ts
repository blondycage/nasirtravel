import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  name: string;
  url: string;
  publicId: string;
  documentType?: 'personal_passport_picture' | 'international_passport' | 'supporting_document';
  uploadedAt: Date;
}

export interface IDependant extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  
  // Basic Info (kept for backward compatibility)
  name: string;
  relationship: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  
  // Personal Information
  countryOfNationality?: string;
  firstName?: string; // First Name or Given Name (English)
  fatherName?: string; // Father Name or Middle Name (Optional)
  lastName?: string; // Last Name or Family Name (English)
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  profession?: string;
  
  // Passport Details
  applicationNumber?: string; // Auto-generated, unique
  passportType?: string; // e.g., "Regular Passport"
  passportIssuePlace?: string; // Country or City
  passportIssueDate?: Date;
  passportExpiryDate?: Date;
  
  // Travel Information
  expectedArrivalDate?: Date;
  expectedDepartureDate?: Date;
  
  // Current Residence Address
  residenceCountry?: string;
  residenceCity?: string;
  residenceZipCode?: string;
  residenceAddress?: string;
  
  // Documents
  documents: IDocument[];
  personalPassportPicture?: IDocument;
  internationalPassport?: IDocument;
  supportingDocuments?: IDocument[];
  
  // Application Status
  applicationFormSubmitted: boolean;
  applicationFormSubmittedAt?: Date;
  applicationStatus: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  applicationReviewedAt?: Date;
  applicationReviewedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  documentType: {
    type: String,
    enum: ['personal_passport_picture', 'international_passport', 'supporting_document'],
  },
  uploadedAt: { type: Date, default: Date.now },
});

const DependantSchema = new Schema<IDependant>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Basic Info
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String },
    
    // Personal Information
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
    
    // Passport Details
    applicationNumber: { type: String, unique: true, sparse: true },
    passportType: { type: String },
    passportIssuePlace: { type: String },
    passportIssueDate: { type: Date },
    passportExpiryDate: { type: Date },
    
    // Travel Information
    expectedArrivalDate: { type: Date },
    expectedDepartureDate: { type: Date },
    
    // Current Residence Address
    residenceCountry: { type: String },
    residenceCity: { type: String },
    residenceZipCode: { type: String },
    residenceAddress: { type: String },
    
    // Documents
    documents: [DocumentSchema],
    personalPassportPicture: DocumentSchema,
    internationalPassport: DocumentSchema,
    supportingDocuments: [DocumentSchema],
    
    // Application Status
    applicationFormSubmitted: { type: Boolean, default: false },
    applicationFormSubmittedAt: { type: Date },
    applicationStatus: {
      type: String,
      enum: ['pending', 'submitted', 'under_review', 'accepted', 'rejected'],
      default: 'pending',
    },
    applicationReviewedAt: { type: Date },
    applicationReviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Generate application number before saving
DependantSchema.pre('save', async function (next) {
  if (this.isNew && !this.applicationNumber) {
    // Generate unique application number: YYMMDD + random 6 digits
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(100000 + Math.random() * 900000).toString();
    this.applicationNumber = `${year}${month}${day}${random}`;
  }
  next();
});

export default mongoose.models.Dependant || mongoose.model<IDependant>('Dependant', DependantSchema);
