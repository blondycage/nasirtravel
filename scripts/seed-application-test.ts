import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hashPassword } from '../lib/utils/auth';

// Try .env.local first, fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Define schemas inline to avoid import issues
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  documentType: {
    type: String,
    enum: ['personal_passport_picture', 'international_passport', 'supporting_document'],
  },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: true });

const BookingSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  numberOfTravelers: Number,
  totalAmount: Number,
  paymentStatus: { type: String, default: 'pending' },
  paymentIntentId: String,
  bookingStatus: { type: String, default: 'pending' },
  bookingDate: Date,
  specialRequests: String,
  documents: [DocumentSchema],
  applicationClosed: { type: Boolean, default: false },
  applicationClosedAt: Date,
  applicationClosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userApplicationFormSubmitted: { type: Boolean, default: false },
  userApplicationFormSubmittedAt: Date,
  userApplicationFormData: {
    countryOfNationality: String,
    firstName: String,
    fatherName: String,
    lastName: String,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    maritalStatus: String,
    dateOfBirth: Date,
    countryOfBirth: String,
    cityOfBirth: String,
    profession: String,
    applicationNumber: String,
    passportType: String,
    passportNumber: String,
    passportIssuePlace: String,
    passportIssueDate: Date,
    passportExpiryDate: Date,
    expectedArrivalDate: Date,
    expectedDepartureDate: Date,
    residenceCountry: String,
    residenceCity: String,
    residenceZipCode: String,
    residenceAddress: String,
  },
  userPersonalPassportPicture: DocumentSchema,
  userInternationalPassport: DocumentSchema,
  userSupportingDocuments: [DocumentSchema],
  userApplicationStatus: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'accepted', 'rejected'],
    default: 'pending',
  },
  userApplicationReviewedAt: Date,
  userApplicationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const DependantSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  dateOfBirth: Date,
  passportNumber: String,
  countryOfNationality: String,
  firstName: String,
  fatherName: String,
  lastName: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  maritalStatus: String,
  countryOfBirth: String,
  cityOfBirth: String,
  profession: String,
  applicationNumber: String,
  passportType: String,
  passportIssuePlace: String,
  passportIssueDate: Date,
  passportExpiryDate: Date,
  expectedArrivalDate: Date,
  expectedDepartureDate: Date,
  residenceCountry: String,
  residenceCity: String,
  residenceZipCode: String,
  residenceAddress: String,
  documents: [DocumentSchema],
  personalPassportPicture: DocumentSchema,
  internationalPassport: DocumentSchema,
  supportingDocuments: [DocumentSchema],
  applicationFormSubmitted: { type: Boolean, default: false },
  applicationFormSubmittedAt: Date,
  applicationStatus: {
    type: String,
    enum: ['pending', 'submitted', 'under_review', 'accepted', 'rejected'],
    default: 'pending',
  },
  applicationReviewedAt: Date,
  applicationReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const UserDependantProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  dateOfBirth: Date,
  passportNumber: String,
  countryOfNationality: String,
  firstName: String,
  fatherName: String,
  lastName: String,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  maritalStatus: String,
  countryOfBirth: String,
  cityOfBirth: String,
  profession: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Dependant = mongoose.models.Dependant || mongoose.model('Dependant', DependantSchema);
const UserDependantProfile = mongoose.models.UserDependantProfile || mongoose.model('UserDependantProfile', UserDependantProfileSchema);

const MONGODB_URI = process.env.MONGODB_URI || '';

// Public image URLs for documents (using placeholder services)
const DOCUMENT_IMAGES = {
  personalPassport: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
  internationalPassport: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
  visa: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop',
  idCard: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop',
  birthCertificate: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop',
};

function createDocument(name: string, url: string, documentType: string) {
  return {
    name,
    url,
    publicId: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    documentType,
    uploadedAt: new Date(),
  };
}

function generateApplicationNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `${year}${month}${day}${random}`;
}

async function seed() {
  try {
    console.log('🌱 Starting comprehensive application test seed...');

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing tours (DO NOT DELETE)
    const Tour = mongoose.models.Tour || mongoose.model('Tour', new mongoose.Schema({}, { strict: false }));
    const tours = await Tour.find({ status: 'published' }).limit(5);
    
    if (tours.length === 0) {
      console.warn('⚠️  No tours found. Please seed tours first using the main seed script.');
      process.exit(1);
    }

    console.log(`📦 Found ${tours.length} tours (preserved)`);

    // Clear ONLY bookings, users, dependants, and user dependant profiles
    console.log('🗑️  Clearing existing bookings, users, dependants, and profiles...');
    await Booking.deleteMany({});
    await Dependant.deleteMany({});
    await UserDependantProfile.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Cleared bookings, dependants, profiles, and users');

    // Create Users
    console.log('👥 Creating test users...');
    const hashedPassword = await hashPassword('password123');

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@naasirtravel.com',
      password: hashedPassword,
      phone: '+1-555-0000',
      role: 'admin',
    });

    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '+1-555-0101',
        role: 'user',
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        password: hashedPassword,
        phone: '+1-555-0102',
        role: 'user',
      },
      {
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: hashedPassword,
        phone: '+1-555-0103',
        role: 'user',
      },
      {
        name: 'Fatima Ali',
        email: 'fatima@example.com',
        password: hashedPassword,
        phone: '+1-555-0104',
        role: 'user',
      },
      {
        name: 'Michael Johnson',
        email: 'michael@example.com',
        password: hashedPassword,
        phone: '+1-555-0105',
        role: 'user',
      },
      {
        name: 'Aisha Khan',
        email: 'aisha@example.com',
        password: hashedPassword,
        phone: '+1-555-0106',
        role: 'user',
      },
    ]);

    console.log(`✅ Created ${users.length + 1} users (including 1 admin)`);

    // Create User Dependant Profiles (reusable dependants)
    console.log('👨‍👩‍👧 Creating user dependant profiles...');
    const userProfiles = await UserDependantProfile.insertMany([
      {
        userId: users[0]._id, // John Doe
        name: 'Jane Doe',
        relationship: 'Spouse',
        dateOfBirth: new Date('1988-06-20'),
        passportNumber: 'CA123457',
        countryOfNationality: 'Canada',
        firstName: 'Jane',
        lastName: 'Doe',
        gender: 'female',
        maritalStatus: 'Married',
        countryOfBirth: 'Canada',
        cityOfBirth: 'Vancouver',
        profession: 'Nurse',
      },
      {
        userId: users[0]._id, // John Doe
        name: 'Alice Doe',
        relationship: 'Child',
        dateOfBirth: new Date('2018-03-15'),
        passportNumber: 'CA123458',
        countryOfNationality: 'Canada',
        firstName: 'Alice',
        lastName: 'Doe',
        gender: 'female',
        maritalStatus: 'Single',
        countryOfBirth: 'Canada',
        cityOfBirth: 'Vancouver',
        profession: 'None',
      },
      {
        userId: users[2]._id, // Ahmed Hassan
        name: 'Amina Hassan',
        relationship: 'Spouse',
        dateOfBirth: new Date('1987-03-12'),
        passportNumber: 'US789013',
        countryOfNationality: 'USA',
        firstName: 'Amina',
        lastName: 'Hassan',
        gender: 'female',
        maritalStatus: 'Married',
        countryOfBirth: 'USA',
        cityOfBirth: 'New York',
        profession: 'Teacher',
      },
      {
        userId: users[2]._id, // Ahmed Hassan
        name: 'Omar Hassan',
        relationship: 'Child',
        dateOfBirth: new Date('2015-11-05'),
        passportNumber: 'US789014',
        countryOfNationality: 'USA',
        firstName: 'Omar',
        lastName: 'Hassan',
        gender: 'male',
        maritalStatus: 'Single',
        countryOfBirth: 'USA',
        cityOfBirth: 'New York',
        profession: 'None',
      },
      {
        userId: users[3]._id, // Fatima Ali
        name: 'Hassan Ali',
        relationship: 'Spouse',
        dateOfBirth: new Date('1990-12-25'),
        passportNumber: 'GB345679',
        countryOfNationality: 'UK',
        firstName: 'Hassan',
        lastName: 'Ali',
        gender: 'male',
        maritalStatus: 'Married',
        countryOfBirth: 'UK',
        cityOfBirth: 'Manchester',
        profession: 'Engineer',
      },
    ]);
    console.log(`✅ Created ${userProfiles.length} user dependant profiles`);

    // SCENARIO 1: Booking with payment pending - No application process yet
    console.log('📋 Creating Scenario 1: Payment Pending Booking...');
    const booking1 = await Booking.create({
      tour: tours[0]._id,
      user: users[0]._id,
      customerName: users[0].name,
      customerEmail: users[0].email,
      customerPhone: users[0].phone,
      numberOfTravelers: 1,
      totalAmount: 458500,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      bookingDate: new Date('2025-01-15'),
    });

    // SCENARIO 2: Paid booking - User application submitted, no dependants, documents uploaded
    console.log('📋 Creating Scenario 2: Paid - User App Submitted, No Dependants...');
    const booking2 = await Booking.create({
      tour: tours[0]._id,
      user: users[1]._id,
      customerName: users[1].name,
      customerEmail: users[1].email,
      customerPhone: users[1].phone,
      numberOfTravelers: 1,
      totalAmount: 458500,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-02-01'),
      paymentIntentId: 'pi_test_2',
      userApplicationFormSubmitted: true,
      userApplicationFormSubmittedAt: new Date('2025-01-20'),
      userApplicationStatus: 'submitted',
      userApplicationFormData: {
        countryOfNationality: 'Canada',
        firstName: 'Sarah',
        lastName: 'Smith',
        gender: 'female',
        maritalStatus: 'Single',
        dateOfBirth: new Date('1990-05-15'),
        countryOfBirth: 'Canada',
        cityOfBirth: 'Toronto',
        profession: 'Software Engineer',
        applicationNumber: generateApplicationNumber(),
        passportType: 'Regular Passport',
        passportNumber: 'CA123456',
        passportIssuePlace: 'Toronto, Canada',
        passportIssueDate: new Date('2020-01-15'),
        passportExpiryDate: new Date('2030-01-15'),
        expectedArrivalDate: new Date('2025-02-15'),
        expectedDepartureDate: new Date('2025-03-15'),
        residenceCountry: 'Canada',
        residenceCity: 'Toronto',
        residenceZipCode: 'M5H 2N2',
        residenceAddress: '123 Main Street, Toronto',
      },
      userPersonalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      userInternationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      userSupportingDocuments: [
        createDocument('Visa Document', DOCUMENT_IMAGES.visa, 'supporting_document'),
      ],
    });

    // SCENARIO 3: Paid booking - User application accepted, 2 dependants, all applications submitted and accepted
    console.log('📋 Creating Scenario 3: Paid - User Accepted, 2 Dependants, All Accepted...');
    const booking3 = await Booking.create({
      tour: tours[1]._id,
      user: users[2]._id,
      customerName: users[2].name,
      customerEmail: users[2].email,
      customerPhone: users[2].phone,
      numberOfTravelers: 3,
      totalAmount: 1282500,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-02-10'),
      paymentIntentId: 'pi_test_3',
      userApplicationFormSubmitted: true,
      userApplicationFormSubmittedAt: new Date('2025-01-25'),
      userApplicationStatus: 'accepted',
      userApplicationReviewedAt: new Date('2025-01-28'),
      userApplicationReviewedBy: adminUser._id,
      userApplicationFormData: {
        countryOfNationality: 'USA',
        firstName: 'Ahmed',
        fatherName: 'Mohammed',
        lastName: 'Hassan',
        gender: 'male',
        maritalStatus: 'Married',
        dateOfBirth: new Date('1985-08-20'),
        countryOfBirth: 'USA',
        cityOfBirth: 'New York',
        profession: 'Business Manager',
        applicationNumber: generateApplicationNumber(),
        passportType: 'Regular Passport',
        passportNumber: 'US789012',
        passportIssuePlace: 'New York, USA',
        passportIssueDate: new Date('2019-06-10'),
        passportExpiryDate: new Date('2029-06-10'),
        expectedArrivalDate: new Date('2025-03-01'),
        expectedDepartureDate: new Date('2025-03-20'),
        residenceCountry: 'USA',
        residenceCity: 'New York',
        residenceZipCode: '10001',
        residenceAddress: '456 Broadway, New York, NY',
      },
      userPersonalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      userInternationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      userSupportingDocuments: [
        createDocument('Visa Document', DOCUMENT_IMAGES.visa, 'supporting_document'),
        createDocument('ID Card', DOCUMENT_IMAGES.idCard, 'supporting_document'),
      ],
    });

    // Create dependants for booking3
    const dependant3a = await Dependant.create({
      bookingId: booking3._id,
      userId: users[2]._id,
      name: 'Amina Hassan',
      relationship: 'Spouse',
      dateOfBirth: new Date('1987-03-12'),
      countryOfNationality: 'USA',
      firstName: 'Amina',
      lastName: 'Hassan',
      gender: 'female',
      maritalStatus: 'Married',
      countryOfBirth: 'USA',
      cityOfBirth: 'New York',
      profession: 'Teacher',
      applicationNumber: generateApplicationNumber(),
      passportType: 'Regular Passport',
      passportNumber: 'US789013',
      passportIssuePlace: 'New York, USA',
      passportIssueDate: new Date('2019-08-15'),
      passportExpiryDate: new Date('2029-08-15'),
      expectedArrivalDate: new Date('2025-03-01'),
      expectedDepartureDate: new Date('2025-03-20'),
      residenceCountry: 'USA',
      residenceCity: 'New York',
      residenceZipCode: '10001',
      residenceAddress: '456 Broadway, New York, NY',
      applicationFormSubmitted: true,
      applicationFormSubmittedAt: new Date('2025-01-26'),
      applicationStatus: 'accepted',
      applicationReviewedAt: new Date('2025-01-28'),
      applicationReviewedBy: adminUser._id,
      personalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      internationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      supportingDocuments: [
        createDocument('Visa Document', DOCUMENT_IMAGES.visa, 'supporting_document'),
      ],
    });

    const dependant3b = await Dependant.create({
      bookingId: booking3._id,
      userId: users[2]._id,
      name: 'Omar Hassan',
      relationship: 'Child',
      dateOfBirth: new Date('2015-11-05'),
      countryOfNationality: 'USA',
      firstName: 'Omar',
      lastName: 'Hassan',
      gender: 'male',
      maritalStatus: 'Single',
      countryOfBirth: 'USA',
      cityOfBirth: 'New York',
      profession: 'None',
      applicationNumber: generateApplicationNumber(),
      passportType: 'Regular Passport',
      passportNumber: 'US789014',
      passportIssuePlace: 'New York, USA',
      passportIssueDate: new Date('2022-01-10'),
      passportExpiryDate: new Date('2027-01-10'),
      expectedArrivalDate: new Date('2025-03-01'),
      expectedDepartureDate: new Date('2025-03-20'),
      residenceCountry: 'USA',
      residenceCity: 'New York',
      residenceZipCode: '10001',
      residenceAddress: '456 Broadway, New York, NY',
      applicationFormSubmitted: true,
      applicationFormSubmittedAt: new Date('2025-01-26'),
      applicationStatus: 'accepted',
      applicationReviewedAt: new Date('2025-01-28'),
      applicationReviewedBy: adminUser._id,
      personalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      internationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
    });

    // SCENARIO 4: Paid booking - User application under review, 1 dependant pending application
    console.log('📋 Creating Scenario 4: Paid - User Under Review, 1 Dependant Pending...');
    const booking4 = await Booking.create({
      tour: tours[2]?._id || tours[0]._id,
      user: users[3]._id,
      customerName: users[3].name,
      customerEmail: users[3].email,
      customerPhone: users[3].phone,
      numberOfTravelers: 2,
      totalAmount: 917000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-02-20'),
      paymentIntentId: 'pi_test_4',
      userApplicationFormSubmitted: true,
      userApplicationFormSubmittedAt: new Date('2025-02-01'),
      userApplicationStatus: 'under_review',
      userApplicationReviewedAt: new Date('2025-02-02'),
      userApplicationFormData: {
        countryOfNationality: 'UK',
        firstName: 'Fatima',
        lastName: 'Ali',
        gender: 'female',
        maritalStatus: 'Married',
        dateOfBirth: new Date('1992-07-18'),
        countryOfBirth: 'UK',
        cityOfBirth: 'London',
        profession: 'Doctor',
        applicationNumber: generateApplicationNumber(),
        passportType: 'Regular Passport',
        passportNumber: 'GB345678',
        passportIssuePlace: 'London, UK',
        passportIssueDate: new Date('2021-03-20'),
        passportExpiryDate: new Date('2031-03-20'),
        expectedArrivalDate: new Date('2025-03-10'),
        expectedDepartureDate: new Date('2025-04-05'),
        residenceCountry: 'UK',
        residenceCity: 'London',
        residenceZipCode: 'SW1A 1AA',
        residenceAddress: '789 Oxford Street, London',
      },
      userPersonalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      userInternationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
    });

    const dependant4 = await Dependant.create({
      bookingId: booking4._id,
      userId: users[3]._id,
      name: 'Hassan Ali',
      relationship: 'Spouse',
      dateOfBirth: new Date('1990-12-25'),
      countryOfNationality: 'UK',
      firstName: 'Hassan',
      lastName: 'Ali',
      gender: 'male',
      maritalStatus: 'Married',
      countryOfBirth: 'UK',
      cityOfBirth: 'Manchester',
      profession: 'Engineer',
      applicationNumber: generateApplicationNumber(),
      passportType: 'Regular Passport',
      passportNumber: 'GB345679',
      passportIssuePlace: 'Manchester, UK',
      passportIssueDate: new Date('2020-09-15'),
      passportExpiryDate: new Date('2030-09-15'),
      expectedArrivalDate: new Date('2025-03-10'),
      expectedDepartureDate: new Date('2025-04-05'),
      residenceCountry: 'UK',
      residenceCity: 'London',
      residenceZipCode: 'SW1A 1AA',
      residenceAddress: '789 Oxford Street, London',
      applicationFormSubmitted: false,
      applicationStatus: 'pending',
      personalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
    });

    // SCENARIO 5: Paid booking - Application closed by admin, user and dependants accepted
    console.log('📋 Creating Scenario 5: Paid - Application Closed, All Accepted...');
    const booking5 = await Booking.create({
      tour: tours[3]?._id || tours[0]._id,
      user: users[4]._id,
      customerName: users[4].name,
      customerEmail: users[4].email,
      customerPhone: users[4].phone,
      numberOfTravelers: 2,
      totalAmount: 470000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-01-05'),
      paymentIntentId: 'pi_test_5',
      applicationClosed: true,
      applicationClosedAt: new Date('2025-01-15'),
      applicationClosedBy: adminUser._id,
      userApplicationFormSubmitted: true,
      userApplicationFormSubmittedAt: new Date('2025-01-08'),
      userApplicationStatus: 'accepted',
      userApplicationReviewedAt: new Date('2025-01-12'),
      userApplicationReviewedBy: adminUser._id,
      userApplicationFormData: {
        countryOfNationality: 'Canada',
        firstName: 'Michael',
        lastName: 'Johnson',
        gender: 'male',
        maritalStatus: 'Single',
        dateOfBirth: new Date('1988-04-30'),
        countryOfBirth: 'Canada',
        cityOfBirth: 'Vancouver',
        profession: 'Accountant',
        applicationNumber: generateApplicationNumber(),
        passportType: 'Regular Passport',
        passportNumber: 'CA456789',
        passportIssuePlace: 'Vancouver, Canada',
        passportIssueDate: new Date('2022-05-10'),
        passportExpiryDate: new Date('2032-05-10'),
        expectedArrivalDate: new Date('2025-02-01'),
        expectedDepartureDate: new Date('2025-02-20'),
        residenceCountry: 'Canada',
        residenceCity: 'Vancouver',
        residenceZipCode: 'V6B 1A1',
        residenceAddress: '321 Granville Street, Vancouver',
      },
      userPersonalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      userInternationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      userSupportingDocuments: [
        createDocument('Visa Document', DOCUMENT_IMAGES.visa, 'supporting_document'),
      ],
    });

    const dependant5 = await Dependant.create({
      bookingId: booking5._id,
      userId: users[4]._id,
      name: 'Emily Johnson',
      relationship: 'Sibling',
      dateOfBirth: new Date('1995-09-12'),
      countryOfNationality: 'Canada',
      firstName: 'Emily',
      lastName: 'Johnson',
      gender: 'female',
      maritalStatus: 'Single',
      countryOfBirth: 'Canada',
      cityOfBirth: 'Vancouver',
      profession: 'Designer',
      applicationNumber: generateApplicationNumber(),
      passportType: 'Regular Passport',
      passportNumber: 'CA456790',
      passportIssuePlace: 'Vancouver, Canada',
      passportIssueDate: new Date('2021-11-20'),
      passportExpiryDate: new Date('2031-11-20'),
      expectedArrivalDate: new Date('2025-02-01'),
      expectedDepartureDate: new Date('2025-02-20'),
      residenceCountry: 'Canada',
      residenceCity: 'Vancouver',
      residenceZipCode: 'V6B 1A1',
      residenceAddress: '321 Granville Street, Vancouver',
      applicationFormSubmitted: true,
      applicationFormSubmittedAt: new Date('2025-01-09'),
      applicationStatus: 'accepted',
      applicationReviewedAt: new Date('2025-01-13'),
      applicationReviewedBy: adminUser._id,
      personalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      internationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      supportingDocuments: [
        createDocument('Birth Certificate', DOCUMENT_IMAGES.birthCertificate, 'supporting_document'),
      ],
    });

    // SCENARIO 6: Paid booking - User application rejected, 1 dependant submitted
    console.log('📋 Creating Scenario 6: Paid - User Rejected, 1 Dependant Submitted...');
    const booking6 = await Booking.create({
      tour: tours[4]?._id || tours[0]._id,
      user: users[5]._id,
      customerName: users[5].name,
      customerEmail: users[5].email,
      customerPhone: users[5].phone,
      numberOfTravelers: 2,
      totalAmount: 560000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-02-15'),
      paymentIntentId: 'pi_test_6',
      userApplicationFormSubmitted: true,
      userApplicationFormSubmittedAt: new Date('2025-02-05'),
      userApplicationStatus: 'rejected',
      userApplicationReviewedAt: new Date('2025-02-08'),
      userApplicationReviewedBy: adminUser._id,
      userApplicationFormData: {
        countryOfNationality: 'Australia',
        firstName: 'Aisha',
        lastName: 'Khan',
        gender: 'female',
        maritalStatus: 'Married',
        dateOfBirth: new Date('1993-10-08'),
        countryOfBirth: 'Australia',
        cityOfBirth: 'Sydney',
        profession: 'Lawyer',
        applicationNumber: generateApplicationNumber(),
        passportType: 'Regular Passport',
        passportNumber: 'AU567890',
        passportIssuePlace: 'Sydney, Australia',
        passportIssueDate: new Date('2020-12-01'),
        passportExpiryDate: new Date('2025-11-30'), // Expires soon - might be reason for rejection
        expectedArrivalDate: new Date('2025-04-01'),
        expectedDepartureDate: new Date('2025-04-25'),
        residenceCountry: 'Australia',
        residenceCity: 'Sydney',
        residenceZipCode: '2000',
        residenceAddress: '555 George Street, Sydney',
      },
      userPersonalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      userInternationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
    });

    const dependant6 = await Dependant.create({
      bookingId: booking6._id,
      userId: users[5]._id,
      name: 'Zain Khan',
      relationship: 'Spouse',
      dateOfBirth: new Date('1991-02-14'),
      countryOfNationality: 'Australia',
      firstName: 'Zain',
      lastName: 'Khan',
      gender: 'male',
      maritalStatus: 'Married',
      countryOfBirth: 'Australia',
      cityOfBirth: 'Melbourne',
      profession: 'Teacher',
      applicationNumber: generateApplicationNumber(),
      passportType: 'Regular Passport',
      passportNumber: 'AU567891',
      passportIssuePlace: 'Melbourne, Australia',
      passportIssueDate: new Date('2021-04-15'),
      passportExpiryDate: new Date('2031-04-15'),
      expectedArrivalDate: new Date('2025-04-01'),
      expectedDepartureDate: new Date('2025-04-25'),
      residenceCountry: 'Australia',
      residenceCity: 'Sydney',
      residenceZipCode: '2000',
      residenceAddress: '555 George Street, Sydney',
      applicationFormSubmitted: true,
      applicationFormSubmittedAt: new Date('2025-02-06'),
      applicationStatus: 'submitted',
      personalPassportPicture: createDocument('Personal Passport Picture', DOCUMENT_IMAGES.personalPassport, 'personal_passport_picture'),
      internationalPassport: createDocument('International Passport', DOCUMENT_IMAGES.internationalPassport, 'international_passport'),
      supportingDocuments: [
        createDocument('Marriage Certificate', DOCUMENT_IMAGES.birthCertificate, 'supporting_document'),
      ],
    });

    // SCENARIO 7: Paid booking - No application submitted yet, 3 dependants added but no applications
    console.log('📋 Creating Scenario 7: Paid - No Applications, 3 Dependants Added...');
    const booking7 = await Booking.create({
      tour: tours[0]._id,
      user: users[0]._id,
      customerName: users[0].name,
      customerEmail: users[0].email,
      customerPhone: users[0].phone,
      numberOfTravelers: 4,
      totalAmount: 1834000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-03-01'),
      paymentIntentId: 'pi_test_7',
      userApplicationFormSubmitted: false,
      userApplicationStatus: 'pending',
    });

    const dependant7a = await Dependant.create({
      bookingId: booking7._id,
      userId: users[0]._id,
      name: 'Jane Doe',
      relationship: 'Spouse',
      dateOfBirth: new Date('1988-06-20'),
      applicationFormSubmitted: false,
      applicationStatus: 'pending',
    });

    const dependant7b = await Dependant.create({
      bookingId: booking7._id,
      userId: users[0]._id,
      name: 'Alice Doe',
      relationship: 'Child',
      dateOfBirth: new Date('2018-03-15'),
      applicationFormSubmitted: false,
      applicationStatus: 'pending',
    });

    const dependant7c = await Dependant.create({
      bookingId: booking7._id,
      userId: users[0]._id,
      name: 'Bob Doe',
      relationship: 'Child',
      dateOfBirth: new Date('2020-08-10'),
      applicationFormSubmitted: false,
      applicationStatus: 'pending',
    });

    // SCENARIO 8: Failed payment booking
    console.log('📋 Creating Scenario 8: Failed Payment Booking...');
    const booking8 = await Booking.create({
      tour: tours[1]?._id || tours[0]._id,
      user: users[1]._id,
      customerName: users[1].name,
      customerEmail: users[1].email,
      customerPhone: users[1].phone,
      numberOfTravelers: 1,
      totalAmount: 427500,
      paymentStatus: 'failed',
      bookingStatus: 'pending',
      bookingDate: new Date('2025-02-25'),
      paymentIntentId: 'pi_test_8_failed',
    });

    console.log('\n🎉 Comprehensive seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length + 1} (including 1 admin)`);
    console.log(`   User Dependant Profiles: ${userProfiles.length} (reusable across bookings)`);
    console.log(`   Bookings: 8 (covering all scenarios)`);
    console.log(`   Booking Dependants: 7`);
    console.log('\n📋 Test Scenarios Created:');
    console.log('   1. Payment Pending - No application process');
    console.log('   2. Paid - User app submitted, no dependants, documents uploaded');
    console.log('   3. Paid - User accepted, 2 dependants, all accepted');
    console.log('   4. Paid - User under review, 1 dependant pending');
    console.log('   5. Paid - Application closed, all accepted');
    console.log('   6. Paid - User rejected, 1 dependant submitted');
    console.log('   7. Paid - No applications, 3 dependants added');
    console.log('   8. Failed payment - No application process');
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@naasirtravel.com / password123');
    console.log('   User 1: john@example.com / password123 (Booking 1, 7)');
    console.log('   User 2: sarah@example.com / password123 (Booking 2, 8)');
    console.log('   User 3: ahmed@example.com / password123 (Booking 3)');
    console.log('   User 4: fatima@example.com / password123 (Booking 4)');
    console.log('   User 5: michael@example.com / password123 (Booking 5)');
    console.log('   User 6: aisha@example.com / password123 (Booking 6)');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
