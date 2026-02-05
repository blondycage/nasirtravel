# Naasir Travel - Project Overview & Reference

> **Last Updated**: 2026-02-01
> **Purpose**: Comprehensive reference for AI assistants across sessions
> **Status**: Active Development - Ready for Major Updates

---

## 🎯 Project Summary

**Naasir Travel** is a full-stack travel booking platform specializing in Hajj, Umrah, and worldwide tour packages. The platform provides a complete booking workflow from tour browsing to payment processing and visa application management.

### Core Purpose
- Enable customers to browse and book travel packages
- Manage bookings, payments, and visa applications
- Provide admin tools for tour management and application processing
- Automate email notifications throughout the booking lifecycle

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript 5.5.0
- **Styling**: Tailwind CSS 3.4.4
- **Animations**: Framer Motion 11.3.0
- **UI Components**: Custom React components
- **State Management**: React hooks + localStorage for auth

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: MongoDB 8.19.2 with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 3.0.2
- **Payment**: Stripe 19.2.0 (Sandbox mode)
- **File Storage**: Cloudinary 2.8.0
- **Email**: Nodemailer 7.0.10 (Gmail SMTP)

### Development Tools
- **Build**: Next.js build system
- **Type Checking**: TypeScript with strict mode
- **Package Manager**: npm
- **Scripts**: tsx for database seeding

---

## 📁 Project Structure

```
Naasirtravel/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── tours/                # Tour management
│   │   ├── bookings/             # Booking operations
│   │   │   └── [id]/
│   │   │       ├── dependants/   # Dependant management
│   │   │       ├── documents/    # Document uploads
│   │   │       └── user-application/ # User applications
│   │   ├── dependants/           # Dependant operations
│   │   │   └── [id]/
│   │   │       ├── application/
│   │   │       └── documents/
│   │   ├── payment/              # Stripe integration
│   │   │   ├── create-intent/
│   │   │   └── webhook/
│   │   ├── reviews/              # Review system
│   │   ├── upload/               # Cloudinary uploads
│   │   ├── contact/              # Contact form
│   │   └── admin/                # Admin-only endpoints
│   │       ├── tours/
│   │       ├── bookings/
│   │       ├── users/
│   │       ├── reviews/
│   │       ├── stats/
│   │       └── applications/
│   ├── dashboard/                # User dashboard pages
│   │   ├── bookings/
│   │   │   └── [id]/
│   │   │       ├── application/
│   │   │       ├── documents/
│   │   │       └── dependants/[dependantId]/application/
│   │   ├── invoices/
│   │   ├── profile/
│   │   └── reviews/
│   ├── admin/                    # Admin pages
│   │   ├── tours/
│   │   ├── bookings/
│   │   ├── users/
│   │   ├── reviews/
│   │   └── applications/
│   ├── packages/                 # Public package listings
│   │   └── [id]/
│   ├── login/
│   ├── register/
│   ├── contact/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── payment/[id]/
│   ├── booking-confirmation/
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── components/                   # React components
│   ├── Header.tsx               # Main navigation
│   ├── Hero.tsx                 # Homepage hero
│   ├── Features.tsx             # Services showcase
│   ├── Testimonials.tsx         # Customer reviews
│   ├── Footer.tsx               # Footer
│   ├── Packages.tsx             # Tour listings
│   ├── BookingForm.tsx          # Booking creation
│   ├── PaymentForm.tsx          # Stripe payment
│   ├── ApplicationForm.tsx      # Visa application form
│   ├── ReviewForm.tsx           # Review submission
│   ├── TourForm.tsx             # Admin tour editor
│   ├── Toast.tsx                # Notifications
│   └── Captcha.tsx              # Security captcha
├── lib/                         # Shared utilities
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Tour.ts
│   │   ├── Booking.ts
│   │   ├── Dependant.ts
│   │   └── Review.ts
│   ├── utils/                   # Helper functions
│   │   ├── auth.ts              # JWT & password hashing
│   │   ├── email.ts             # Email templates
│   │   ├── stripe.ts            # Payment processing
│   │   ├── cloudinary.ts        # Image uploads
│   │   └── clientAuth.ts        # Client-side auth
│   └── mongodb.ts               # Database connection
├── scripts/                     # Utility scripts
│   ├── seed.ts                  # Database seeder
│   └── seed-application-test.ts # Test data generator
├── public/                      # Static assets
├── .env                         # Environment variables (not in git)
├── .env.example                 # Environment template
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── next.config.mjs              # Next.js config
├── tailwind.config.js           # Tailwind config
└── README.md                    # Project readme
```

---

## 🗃️ Database Models

### User
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed with bcrypt)
  phone?: string
  role: 'user' | 'admin'
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  timestamps: createdAt, updatedAt
}
```

### Tour
```typescript
{
  title: string
  category: string (Hajj/Umrah, Asia, Africa, Europe)
  packageType: 'umrah' | 'standard'
  image: string (Cloudinary URL)
  departure?: string
  accommodation: string
  dates: string
  price: string
  isComing?: boolean
  description?: string
  itinerary?: Array<{day, title, description}>
  gallery?: string[] (Cloudinary URLs)
  inclusions?: string[]
  exclusions?: string[]
  status: 'draft' | 'published' | 'archived'
  timestamps: createdAt, updatedAt
}
```

### Booking
```typescript
{
  tour: ObjectId (ref: Tour)
  user: ObjectId (ref: User)
  packageType: 'umrah' | 'standard'
  customerName: string
  customerEmail: string
  customerPhone: string
  numberOfTravelers: number
  totalAmount: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentIntentId?: string (Stripe)
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  bookingDate: Date
  specialRequests?: string
  documents: IDocument[]

  // Application Workflow
  applicationClosed: boolean
  applicationClosedAt?: Date
  applicationClosedBy?: ObjectId
  userApplicationFormSubmitted: boolean
  userApplicationFormSubmittedAt?: Date

  // User Application Form Data
  userApplicationFormData?: {
    countryOfNationality, firstName, fatherName, lastName,
    gender, maritalStatus, dateOfBirth, countryOfBirth,
    cityOfBirth, profession, applicationNumber, passportType,
    passportNumber, passportIssuePlace, passportIssueDate,
    passportExpiryDate, residenceCountry, residenceCity,
    residenceZipCode, residenceAddress
  }

  // User Documents (specific types)
  userPersonalPassportPicture?: IDocument
  userInternationalPassport?: IDocument
  userPassportPhoto?: IDocument (for Umrah: 200x200px, 5-100kb)
  userSupportingDocuments?: IDocument[]

  // User Application Status
  userApplicationStatus: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'needs_revision'
  userApplicationRejectionReason?: string
  userApplicationReviewedAt?: Date
  userApplicationReviewedBy?: ObjectId

  timestamps: createdAt, updatedAt
}
```

### Dependant
```typescript
{
  bookingId: ObjectId (ref: Booking)
  userId: ObjectId (ref: User)

  // Basic Info (backward compatibility)
  name: string
  relationship: string
  dateOfBirth?: Date
  passportNumber?: string

  // Personal Information (full application form)
  countryOfNationality, firstName, fatherName, lastName,
  gender, maritalStatus, countryOfBirth, cityOfBirth,
  profession, applicationNumber, passportType,
  passportIssuePlace, passportIssueDate, passportExpiryDate,
  residenceCountry, residenceCity, residenceZipCode,
  residenceAddress

  // Documents
  documents: IDocument[]
  personalPassportPicture?: IDocument
  internationalPassport?: IDocument
  passportPhoto?: IDocument (for Umrah)
  supportingDocuments?: IDocument[]

  // Application Status
  applicationFormSubmitted: boolean
  applicationFormSubmittedAt?: Date
  applicationStatus: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'needs_revision'
  applicationRejectionReason?: string
  applicationReviewedAt?: Date
  applicationReviewedBy?: ObjectId

  timestamps: createdAt, updatedAt
}
```

### Review
```typescript
{
  tour: ObjectId (ref: Tour)
  user: ObjectId (ref: User)
  userName: string
  rating: number (1-5)
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  timestamps: createdAt, updatedAt
}
```

### IDocument (embedded schema)
```typescript
{
  name: string
  url: string (Cloudinary)
  publicId: string (Cloudinary)
  documentType?: 'personal_passport_picture' | 'international_passport' |
                 'supporting_document' | 'passport_photo'
  uploadedAt: Date
}
```

---

## 🔐 Authentication & Authorization

### JWT Authentication
- **Token Storage**: localStorage (client-side)
- **Token Expiry**: 7 days
- **Password Hashing**: bcrypt with 10 salt rounds
- **Token Format**: `Bearer <token>` in Authorization header

### User Roles
- **user**: Can create bookings, submit applications, write reviews
- **admin**: Full access to all resources + admin endpoints

### Protected Routes
- `/api/auth/me` - Get/update current user
- `/api/bookings` - User's own bookings
- `/api/reviews` - Submit/edit own reviews
- `/api/admin/*` - Admin-only endpoints

---

## 💳 Payment Flow (Stripe)

1. **User creates booking** → Booking created with `paymentStatus: 'pending'`
2. **Frontend requests payment intent** → `/api/payment/create-intent`
3. **User completes payment** → Stripe processes payment
4. **Webhook receives event** → `/api/payment/webhook`
5. **Booking updated** → `paymentStatus: 'paid'`, `bookingStatus: 'confirmed'`
6. **Email sent** → Payment confirmation email

### Stripe Configuration
- **Mode**: Sandbox (test mode)
- **Currency**: CAD (Canadian dollars)
- **Test Card**: 4242 4242 4242 4242

---

## 📧 Email Notifications

All emails use Gmail SMTP with HTML templates:

1. **Signup Confirmation** - Welcome email on registration
2. **Booking Confirmation** - After booking creation
3. **Payment Confirmation** - After successful payment
4. **Password Reset** - For password recovery (1 hour expiry)
5. **Admin Application Notification** - When application submitted
6. **Application Status Update** - When admin reviews application
7. **Application Needs Revision** - When admin requests changes (includes revision notes & edit link)
8. **Application Rejected** - When admin rejects application (includes rejection reason)
9. **Enquiry Notification** - Contact form submissions (admin + customer)

### Email Configuration
- **Service**: Gmail SMTP
- **Authentication**: App Password (not regular password)
- **From Address**: noreply@naasirtravel.com
- **Admin Email**: info@naasirtravel.com

---

## 🎫 Application Management System

### Workflow
1. User books tour → payment required
2. After payment → can add dependants
3. User fills application form (self)
4. Each dependant fills application form
5. Upload documents (3 types):
   - Personal passport picture
   - International passport
   - Supporting documents (optional, multiple)
6. For Umrah packages: Additional passport photo (200x200px, 5-100kb)
7. Submit applications
8. Admin reviews → accept/reject
9. Admin can close application process (prevents adding more dependants)

### Document Types
- **personal_passport_picture**: Personal photo
- **international_passport**: Passport copy
- **supporting_document**: Additional documents (birth certificate, etc.)
- **passport_photo**: Umrah-specific (200x200px, 5-100kb)

### Application Statuses
- **pending**: Form not filled
- **submitted**: Form filled, awaiting review
- **under_review**: Admin reviewing
- **accepted**: Approved by admin
- **needs_revision**: Requires changes (with revision notes)
- **rejected**: Denied by admin (with rejection reason)

### Business Rules
- Cannot add dependants until payment is completed
- Cannot add/remove dependants after application is closed
- Cannot edit application after admin review (accepted/rejected)
- Application numbers auto-generated (YYMMDD + 6 random digits)

---

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/tours` - List published tours
- `GET /api/tours/[id]` - Get tour details
- `GET /api/reviews?tourId=[id]` - Get approved reviews
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/contact` - Submit contact form

### Authenticated Endpoints
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `GET /api/bookings?userId=[id]` - User's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/[id]` - Update own review
- `DELETE /api/reviews/[id]` - Delete own review
- `POST /api/payment/create-intent` - Create payment intent
- `POST /api/bookings/[id]/dependants` - Add dependant
- `PUT /api/dependants/[id]` - Update dependant
- `DELETE /api/dependants/[id]` - Delete dependant
- `POST /api/bookings/[id]/user-application` - Submit user application
- `POST /api/dependants/[id]/application` - Submit dependant application
- `POST /api/bookings/[id]/user-documents` - Upload user documents
- `POST /api/dependants/[id]/documents` - Upload dependant documents

### Admin Endpoints
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/tours` - All tours (including drafts)
- `POST /api/admin/tours` - Create tour
- `PUT /api/admin/tours/[id]` - Update tour
- `DELETE /api/admin/tours/[id]` - Delete tour
- `GET /api/admin/tours/[tourId]/dashboard` - Package dashboard with bookings & applications
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/users` - All users
- `POST /api/admin/users` - Create user manually
- `GET /api/admin/users/[id]` - User profile with bookings & applications
- `PUT /api/admin/users/[id]` - Update user (except password)
- `DELETE /api/admin/users/[id]` - Delete user
- `GET /api/admin/reviews` - All reviews
- `PATCH /api/admin/reviews/[id]` - Approve/reject review
- `GET /api/admin/applications` - All applications
- `GET /api/admin/applications/user/[bookingId]` - User application
- `GET /api/admin/applications/dependant/[dependantId]` - Dependant application
- `PATCH /api/admin/bookings/[id]/user-application-status` - Update user app status (with reason for rejection/revision)
- `PATCH /api/admin/dependants/[id]/application-status` - Update dependant app status (with reason for rejection/revision)
- `PATCH /api/admin/bookings/[id]/applications` - Close/reopen applications

### Webhook Endpoints
- `POST /api/payment/webhook` - Stripe webhook (payment events)

---

## 🎨 Frontend Architecture

### Page Types
1. **Public Pages**: Landing, packages, contact, login, register
2. **User Dashboard**: Bookings, applications, invoices, profile, reviews
3. **Admin Dashboard**: Tours, bookings, users, applications, reviews, stats

### Key Components
- **Header**: Responsive navigation with auth state
- **Hero**: Homepage carousel with Framer Motion
- **Packages**: Tour listings with filtering
- **BookingForm**: Create bookings with validation
- **PaymentForm**: Stripe Elements integration
- **ApplicationForm**: Visa application with validation
- **Toast**: Notification system

### State Management
- **Authentication**: localStorage + useEffect checks
- **Forms**: React useState
- **API Calls**: Fetch API with error handling

---

## 🌍 Environment Variables

Required in `.env` or `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key

# Stripe (Sandbox)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
EMAIL_FROM=info@naasirtravel.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📊 Current Implementation Status

### ✅ Fully Implemented
- User authentication (register, login, JWT, password reset)
- Tour management (CRUD, categories, status)
- Booking system (create, view, payment integration)
- Stripe payment processing (sandbox mode)
- Email notifications (9 types)
- Review system (submit, moderate)
- User dashboard (bookings, profile, invoices, reviews)
- Dependant management (add, edit, delete)
- Application forms (user + dependants, full visa data)
- Document uploads (Cloudinary, 4 types)
- Application workflow (submit, review, approve/reject/needs_revision)
- Admin application review system with rejection/revision reasons
- Application close/reopen functionality
- Admin user management (create, view, edit, delete)
- Package dashboard showing all bookings and applications per tour
- Application management section in booking details
- Reusable admin UI components (ApplicationCard, ApplicationReviewForm, UserForm, PackageDashboardStats)

### 🚧 Partially Implemented
- Advanced search/filtering for tours
- Booking modification/cancellation

### ❌ Not Implemented
- Email verification on signup
- Two-factor authentication
- Booking reminder emails
- Tour wishlist/favorites
- Advanced analytics dashboard
- PDF export for applications/invoices

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Configuration
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database Seeding (Optional)
```bash
npm run seed
```

### Development Server
```bash
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Admin**: admin@naasirtravel.com / password123 (after seeding)
- **User**: john@example.com / password123 (after seeding)

---

## 🧪 Testing

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### Webhook Testing (Local)
```bash
ngrok http 3000
# Update Stripe webhook URL to: https://xxxxx.ngrok.io/api/payment/webhook
```

---

## 📝 Important Notes for Future Development

### Security Considerations
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Minimal validation (as requested)
- Admin endpoints require admin role
- File uploads validated by document type

### Known Limitations
- TypeScript and ESLint errors ignored in build (see next.config.mjs)
- No rate limiting on API endpoints
- localStorage used for auth (not httpOnly cookies)
- Email debugging logs include full credentials (REMOVE IN PRODUCTION)

### Integration Setup
1. **MongoDB Atlas**: Create cluster, whitelist IPs, get connection string
2. **Stripe**: Create account, get test keys, setup webhook
3. **Cloudinary**: Create account, get credentials
4. **Gmail**: Enable 2FA, generate app password

### Package Types
- **Umrah**: Requires special passport photo (200x200px, 5-100kb)
- **Standard**: Regular tour packages

### Application Number Format
- Auto-generated: `YYMMDD` + 6 random digits
- Example: `260201123456`
- Unique constraint on dependants

---

## 📚 Additional Documentation

- `BACKEND_SETUP.md` - Detailed backend setup guide
- `IMPLEMENTATION_SUMMARY.md` - Complete feature documentation
- `IMPLEMENTATION_STATUS.md` - Dependant application system details
- `DEPENDANT_APPLICATION_PLAN.md` - Application system planning
- `TEST_PLAN.md` - Testing checklist
- `SEED_QUICK_START.md` - Database seeding guide
- `EMAIL-DEBUGGING-SUMMARY.md` - Email troubleshooting
- `ADD_TO_ENV.md` - Environment variable notes

---

## 🎯 Key Features by User Role

### For Customers (User Role)
- Browse and view tour packages
- Create account and login
- Book tours with Stripe payment
- Add dependants to bookings
- Fill visa application forms (self + dependants)
- Upload required documents
- Track booking and application status
- Write and manage reviews
- View invoices and payment history

### For Administrators (Admin Role)
- Full tour management (create, edit, delete, publish)
- View all bookings and users
- Review and approve/reject/request revision for applications
- Provide rejection reasons and revision notes
- Close/reopen application process
- Moderate reviews
- View dashboard statistics
- Manage user accounts (create, view, edit, delete)
- Package dashboard to view all bookings and applications per tour
- View user profile with booking and application history

---

## 💡 Recent Changes (as of 2026-02-01)

### Git Status
- Modified: `app/login/page.tsx`
- Modified: `app/register/page.tsx`
- Untracked: `components/Captcha.tsx`

### Latest Admin Enhancements (COMPLETED)
1. **Application Rejection/Revision System**:
   - Added `needs_revision` status for applications
   - Added `rejectionReason`/`applicationRejectionReason` fields to Booking and Dependant models
   - Created email templates for revision requests and rejections
   - Updated application review pages with ApplicationReviewForm component

2. **User Management System**:
   - Full CRUD operations for users from admin panel
   - Create users manually with auto-hashed passwords
   - View user profile with booking and application history
   - Edit user details (all fields except password)
   - Delete users (with booking check)

3. **Package Dashboard**:
   - New `/admin/tours/[tourId]/dashboard` page
   - Shows all bookings for a specific tour/package
   - Displays application summaries for each booking
   - Statistics cards for booking and application metrics
   - Links to individual applications for review

4. **Enhanced Booking Details**:
   - Application Management section showing all applications (user + dependants)
   - Status badges for each application
   - Direct links to review each application
   - Rejection reasons displayed when applicable

5. **Reusable Admin Components**:
   - `ApplicationCard.tsx`: Display application summary with status
   - `ApplicationReviewForm.tsx`: Form for changing application status with conditional reason field
   - `UserForm.tsx`: Dual-mode (create/edit) user form
   - `PackageDashboardStats.tsx`: Stats cards for package dashboard

6. **API Endpoints Created**:
   - `POST /api/admin/users` - Create user
   - `GET /api/admin/users/[id]` - Get user profile with related data
   - `PUT /api/admin/users/[id]` - Update user (except password)
   - `DELETE /api/admin/users/[id]` - Delete user
   - `GET /api/admin/tours/[tourId]/dashboard` - Package dashboard data

7. **Email Enhancements**:
   - `sendApplicationNeedsRevision()` - Sends revision notes with edit link
   - `sendApplicationRejected()` - Sends rejection reason with contact info
   - Updated application status endpoints to trigger emails

### New Features Under Development
- Captcha component (security enhancement)
- Login/register page updates

---

**End of Project Overview**

> This document should be read at the start of each new AI session to maintain context and consistency across development iterations.
