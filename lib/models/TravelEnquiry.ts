import mongoose, { Document, Schema } from 'mongoose';

export type TravelEnquiryStatus = 'new' | 'contacted' | 'quoted' | 'closed';
export type TravelService = 'flights' | 'hotels' | 'existing_package' | 'custom_package';

export interface ITravelEnquiry extends Document {
  reference: string;
  name: string;
  email: string;
  phone: string;
  services: TravelService[];
  purpose: 'umrah' | 'hajj' | 'vacation' | 'business' | 'family_visit' | 'other';
  readiness: 'planning' | 'ready_for_quote' | 'ready_to_book';
  travelers: { adults: number; children: number; infants: number };
  origin: string;
  destination: string;
  departureDate?: Date;
  returnDate?: Date;
  flexibleDates: boolean;
  budget?: string;
  flightPreferences?: {
    cabin?: string;
    preferredAirline?: string;
    stopPreference?: string;
    notes?: string;
  };
  hotelPreferences?: {
    destination?: string;
    checkIn?: Date;
    checkOut?: Date;
    rooms?: number;
    starRating?: string;
    notes?: string;
  };
  package?: mongoose.Types.ObjectId;
  packageTitleSnapshot?: string;
  customRequirements?: string;
  generalNotes?: string;
  status: TravelEnquiryStatus;
  adminNotes?: string;
  notificationStatus: 'pending' | 'sent' | 'failed';
  notificationError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TravelEnquirySchema = new Schema<ITravelEnquiry>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    services: [{ type: String, enum: ['flights', 'hotels', 'existing_package', 'custom_package'] }],
    purpose: { type: String, enum: ['umrah', 'hajj', 'vacation', 'business', 'family_visit', 'other'], required: true },
    readiness: { type: String, enum: ['planning', 'ready_for_quote', 'ready_to_book'], required: true },
    travelers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, required: true, min: 0, default: 0 },
      infants: { type: Number, required: true, min: 0, default: 0 },
    },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departureDate: Date,
    returnDate: Date,
    flexibleDates: { type: Boolean, default: false },
    budget: { type: String, trim: true },
    flightPreferences: {
      cabin: String,
      preferredAirline: String,
      stopPreference: String,
      notes: String,
    },
    hotelPreferences: {
      destination: String,
      checkIn: Date,
      checkOut: Date,
      rooms: { type: Number, min: 1 },
      starRating: String,
      notes: String,
    },
    package: { type: Schema.Types.ObjectId, ref: 'Tour' },
    packageTitleSnapshot: String,
    customRequirements: String,
    generalNotes: String,
    status: { type: String, enum: ['new', 'contacted', 'quoted', 'closed'], default: 'new', index: true },
    adminNotes: { type: String, default: '' },
    notificationStatus: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
    notificationError: String,
  },
  { timestamps: true }
);

export default mongoose.models.TravelEnquiry ||
  mongoose.model<ITravelEnquiry>('TravelEnquiry', TravelEnquirySchema);
