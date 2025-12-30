import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  name: string;
  url: string;
  publicId: string;
  documentType?: 'personal_passport_picture' | 'international_passport' | 'supporting_document' | 'passport_photo';
  uploadedAt: Date;
}

export interface IBooking extends Document {
  tour: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  packageType: 'umrah' | 'standard';
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
  
  // Application Workflow
  applicationClosed: boolean;
  applicationClosedAt?: Date;
  applicationClosedBy?: mongoose.Types.ObjectId;
  userApplicationFormSubmitted: boolean;
  userApplicationFormSubmittedAt?: Date;
  
  // User Application Form Data (same structure as dependant)
  userApplicationFormData?: {
    // Personal Information
    countryOfNationality?: string;
    firstName?: string;
    fatherName?: string;
    lastName?: string;
    gender?: 'male' | 'female' | 'other';
    maritalStatus?: string;
    dateOfBirth?: Date;
    countryOfBirth?: string;
    cityOfBirth?: string;
    profession?: string;
    
    // Passport Details
    applicationNumber?: string;
    passportType?: string;
    passportNumber?: string;
    passportIssuePlace?: string;
    passportIssueDate?: Date;
    passportExpiryDate?: Date;

    // Current Residence Address
    residenceCountry?: string;
    residenceCity?: string;
    residenceZipCode?: string;
    residenceAddress?: string;
  };
  
  // User Documents (specific types)
  userPersonalPassportPicture?: IDocument;
  userInternationalPassport?: IDocument;
  userPassportPhoto?: IDocument; // For Umrah packages (200x200px, 5-100kb)
  userSupportingDocuments?: IDocument[];
  
  // User Application Status
  userApplicationStatus?: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  userApplicationReviewedAt?: Date;
  userApplicationReviewedBy?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  documentType: {
    type: String,
    enum: ['personal_passport_picture', 'international_passport', 'supporting_document', 'passport_photo'],
  },
  uploadedAt: { type: Date, default: Date.now },
});

const BookingSchema = new Schema<IBooking>(
  {
    tour: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    packageType: { type: String, enum: ['umrah', 'standard'], required: true },
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
    bookingDate: { type: Date },
    specialRequests: { type: String },
    documents: [DocumentSchema],
    
    // Application Workflow
    applicationClosed: { type: Boolean, default: false },
    applicationClosedAt: { type: Date },
    applicationClosedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    userApplicationFormSubmitted: { type: Boolean, default: false },
    userApplicationFormSubmittedAt: { type: Date },
    
    // User Application Form Data
    userApplicationFormData: {
      countryOfNationality: { type: String },
      firstName: { type: String },
      fatherName: { type: String },
      lastName: { type: String },
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
      },
      maritalStatus: { type: String },
      dateOfBirth: { type: Date },
      countryOfBirth: { type: String },
      cityOfBirth: { type: String },
      profession: { type: String },
      applicationNumber: { type: String },
      passportType: { type: String },
      passportNumber: { type: String },
      passportIssuePlace: { type: String },
      passportIssueDate: { type: Date },
      passportExpiryDate: { type: Date },
      residenceCountry: { type: String },
      residenceCity: { type: String },
      residenceZipCode: { type: String },
      residenceAddress: { type: String },
    },
    
    // User Documents
    userPersonalPassportPicture: DocumentSchema,
    userInternationalPassport: DocumentSchema,
    userPassportPhoto: DocumentSchema,
    userSupportingDocuments: [DocumentSchema],
    
    // User Application Status
    userApplicationStatus: {
      type: String,
      enum: ['pending', 'submitted', 'under_review', 'accepted', 'rejected'],
      default: 'pending',
    },
    userApplicationReviewedAt: { type: Date },
    userApplicationReviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
