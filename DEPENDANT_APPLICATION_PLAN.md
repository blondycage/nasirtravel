# Dependant Application System - Implementation Plan

## Overview
This plan outlines the implementation of a comprehensive dependant management and application form system for bookings. The system allows users to add dependants to bookings, fill out detailed application forms (similar to visa applications), upload required documents, and have admins review and accept applications.

## Current State Analysis

### ✅ Already Implemented:
- Basic Dependant model with name, relationship, dateOfBirth, passportNumber
- Document upload system for dependants (generic documents)
- Cloudinary integration for image uploads
- Basic CRUD operations for dependants
- Admin view of dependants and documents

### ❌ Missing/Needs Enhancement:
- Full application form fields (personal details, passport details, address, travel dates)
- Application form submission tracking
- Specific document types (personal passport picture, international passport, supporting documents)
- Application status management (submitted, reviewed, accepted, closed)
- Admin review and acceptance workflow
- Form validation and data structure matching visa application requirements

---

## Implementation Plan

### Phase 1: Data Model Updates

#### 1.1 Update Dependant Model (`lib/models/Dependant.ts`)
Add comprehensive fields matching the application form:

**Personal Information:**
- `countryOfNationality` (required)
- `firstName` (required) - First Name or Given Name (English)
- `fatherName` (optional) - Father Name or Middle Name
- `lastName` (required) - Last Name or Family Name (English)
- `gender` (required)
- `maritalStatus` (required)
- `dateOfBirth` (required)
- `countryOfBirth` (required)
- `cityOfBirth` (required)
- `profession` (required)

**Passport Details:**
- `applicationNumber` (auto-generated, unique)
- `passportType` (required) - e.g., "Regular Passport"
- `passportNumber` (required)
- `passportIssuePlace` (required) - Country or City
- `passportIssueDate` (required)
- `passportExpiryDate` (required) - Must be valid 6+ months from submission

**Travel Information:**
- `expectedArrivalDate` (required) - Within visa validity (1 year from submission)
- `expectedDepartureDate` (required) - Visa valid 1 year, stay 90 days

**Current Residence Address:**
- `residenceCountry` (required)
- `residenceCity` (required)
- `residenceZipCode` (optional)
- `residenceAddress` (required)

**Application Status:**
- `applicationFormSubmitted` (boolean, default: false)
- `applicationFormSubmittedAt` (Date, optional)
- `applicationStatus` (enum: 'pending', 'submitted', 'under_review', 'accepted', 'rejected')
- `applicationReviewedAt` (Date, optional)
- `applicationReviewedBy` (ObjectId ref: User, optional)

**Documents (Enhanced):**
- `personalPassportPicture` (Document object)
- `internationalPassport` (Document object)
- `supportingDocuments` (Array of Document objects with custom names)

#### 1.2 Update Booking Model (`lib/models/Booking.ts`)
Add application workflow tracking:
- `applicationClosed` (boolean, default: false) - Admin closes application process
- `applicationClosedAt` (Date, optional)
- `applicationClosedBy` (ObjectId ref: User, optional)
- `userApplicationFormSubmitted` (boolean, default: false)
- `userApplicationFormSubmittedAt` (Date, optional)

#### 1.3 Update User Model (`lib/models/User.ts`)
Add user application form data (same structure as dependant):
- `applicationFormData` (Object, optional) - Same structure as dependant application
- `applicationFormSubmitted` (boolean, default: false)
- `applicationFormSubmittedAt` (Date, optional)

---

### Phase 2: API Routes

#### 2.1 Dependant Application Form API
**POST `/api/dependants/[id]/application`**
- Submit application form for a dependant
- Validate all required fields
- Validate passport expiry (6+ months from submission)
- Validate travel dates (within visa validity)
- Set `applicationFormSubmitted = true`
- Set `applicationStatus = 'submitted'`

**GET `/api/dependants/[id]/application`**
- Get application form data for a dependant

**PATCH `/api/dependants/[id]/application`**
- Update application form (only if not reviewed/accepted)

#### 2.2 User Application Form API
**POST `/api/bookings/[id]/user-application`**
- Submit application form for the main user
- Same validation as dependant form
- Update booking `userApplicationFormSubmitted = true`

**GET `/api/bookings/[id]/user-application`**
- Get user application form data

**PATCH `/api/bookings/[id]/user-application`**
- Update user application form

#### 2.3 Enhanced Document Upload API
**POST `/api/dependants/[id]/documents`**
Update to support specific document types:
- `documentType` (enum: 'personal_passport_picture', 'international_passport', 'supporting_document')
- `documentName` (required for supporting documents)
- Validate document type requirements

**POST `/api/bookings/[id]/user-documents`**
Similar endpoint for user documents with specific types

#### 2.4 Admin Application Management API
**GET `/api/admin/bookings/[id]/applications`**
- Get all application data (user + all dependants)
- Include application statuses

**PATCH `/api/admin/bookings/[id]/applications/close`**
- Close application process (prevents adding new dependants)
- Set `applicationClosed = true`

**PATCH `/api/admin/dependants/[id]/application-status`**
- Update dependant application status (under_review, accepted, rejected)
- Set `applicationReviewedAt` and `applicationReviewedBy`

**PATCH `/api/admin/bookings/[id]/user-application-status`**
- Update user application status

---

### Phase 3: Frontend Components

#### 3.1 ApplicationForm Component
Create a reusable form component matching the visa application form:
- Personal Information section
- Passport Details section
- Travel Dates section
- Current Residence Address section
- Form validation
- Date pickers with proper UX
- Country/city dropdowns
- Auto-generate application number

**Props:**
- `applicantType`: 'user' | 'dependant'
- `applicantId`: string (bookingId for user, dependantId for dependant)
- `initialData`: optional existing form data
- `onSubmit`: callback function
- `readOnly`: boolean (for admin review)

#### 3.2 DocumentUpload Component
Enhanced document upload with specific types:
- Personal Passport Picture upload
- International Passport upload
- Supporting Documents (with custom naming)
- Preview uploaded documents
- Delete documents
- Show upload progress

#### 3.3 DependantManagement Component
Enhanced dependant management:
- Add dependant (only if `applicationClosed = false`)
- Remove dependant (only if `applicationClosed = false`)
- View dependant details
- Link to application form
- Show application status
- Show document upload status

#### 3.4 AdminApplicationReview Component
Admin interface for reviewing applications:
- View all applications (user + dependants)
- View application forms
- View all documents
- Accept/reject applications
- Close application process
- Download/export application data

---

### Phase 4: User Flow Pages

#### 4.1 Booking Application Page (`/dashboard/bookings/[id]/application`)
Main page for users to:
1. View booking details
2. Add/remove dependants (if not closed)
3. Fill application form for self
4. Fill application forms for each dependant
5. Upload required documents
6. Submit applications
7. View application status

**Flow:**
```
Payment Complete → 
  ↓
View Booking → 
  ↓
Add Dependants (if needed) → 
  ↓
Fill Your Application Form → 
  ↓
Fill Each Dependant's Application Form → 
  ↓
Upload Documents (Personal Passport, International Passport, Supporting Docs) → 
  ↓
Submit Applications → 
  ↓
Wait for Admin Review
```

#### 4.2 Dependant Application Page (`/dashboard/bookings/[id]/dependants/[dependantId]/application`)
Dedicated page for filling a specific dependant's application form

#### 4.3 Admin Application Review Page (`/admin/bookings/[id]/applications`)
Admin page to:
- View all applications
- Review forms
- Review documents
- Accept/reject applications
- Close application process

---

### Phase 5: Validation & Business Rules

#### 5.1 Form Validation Rules
- All required fields must be filled
- Names must match passport exactly (English only)
- Passport expiry must be 6+ months from submission date
- Expected arrival date must be within visa validity (1 year from submission)
- Expected departure date must be within 90 days of arrival
- Date of birth validation
- Email format validation
- Phone number validation

#### 5.2 Business Rules
- Dependants can only be added if `applicationClosed = false`
- Dependants can only be removed if `applicationClosed = false`
- Application forms can be edited if status is 'pending' or 'submitted' (not yet reviewed)
- Once admin reviews/accepts, form becomes read-only
- All required documents must be uploaded before submission
- Application can only be submitted once (can update before admin review)

---

### Phase 6: UI/UX Enhancements

#### 6.1 Status Indicators
- Visual status badges (pending, submitted, under review, accepted, rejected)
- Progress indicators for application completion
- Document upload progress
- Form completion percentage

#### 6.2 User Experience
- Step-by-step wizard for application process
- Save draft functionality
- Form auto-save
- Clear error messages
- Success confirmations
- Helpful tooltips and instructions
- Mobile-responsive design

#### 6.3 Admin Experience
- Bulk actions for applications
- Filter and search applications
- Export application data
- Print application forms
- Email notifications for status changes

---

## Technical Implementation Details

### Document Upload Structure
```typescript
interface Document {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  documentType: 'personal_passport_picture' | 'international_passport' | 'supporting_document';
  uploadedAt: Date;
}
```

### Application Form Data Structure
```typescript
interface ApplicationFormData {
  // Personal Information
  countryOfNationality: string;
  firstName: string;
  fatherName?: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: string;
  dateOfBirth: Date;
  countryOfBirth: string;
  cityOfBirth: string;
  profession: string;
  
  // Passport Details
  applicationNumber: string; // Auto-generated
  passportType: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: Date;
  passportExpiryDate: Date;
  
  // Travel Information
  expectedArrivalDate: Date;
  expectedDepartureDate: Date;
  
  // Address
  residenceCountry: string;
  residenceCity: string;
  residenceZipCode?: string;
  residenceAddress: string;
}
```

### Cloudinary Folder Structure
```
naasirtravel/
  ├── bookings/
  │   └── [bookingId]/
  │       ├── user/
  │       │   ├── personal_passport_picture/
  │       │   ├── international_passport/
  │       │   └── supporting_documents/
  │       └── dependants/
  │           └── [dependantId]/
  │               ├── personal_passport_picture/
  │               ├── international_passport/
  │               └── supporting_documents/
```

---

## Implementation Order

1. **Update Data Models** (Phase 1)
   - Dependant model
   - Booking model
   - User model

2. **Create Application Form Component** (Phase 3.1)
   - Build reusable form component
   - Add validation

3. **Create API Routes** (Phase 2)
   - Application form submission
   - Document upload with types
   - Admin review endpoints

4. **Update Document Upload** (Phase 3.2)
   - Specific document types
   - Enhanced UI

5. **Build User Flow Pages** (Phase 4)
   - Main application page
   - Dependant management
   - Form submission flow

6. **Build Admin Review Interface** (Phase 4.3)
   - Review page
   - Status management
   - Close application

7. **Add Validation & Business Rules** (Phase 5)
   - Form validation
   - Business logic
   - Error handling

8. **UI/UX Polish** (Phase 6)
   - Status indicators
   - Progress tracking
   - Mobile responsiveness

---

## Testing Checklist

- [ ] Add dependant to booking
- [ ] Remove dependant from booking
- [ ] Fill user application form
- [ ] Fill dependant application form
- [ ] Upload personal passport picture
- [ ] Upload international passport
- [ ] Upload supporting documents with custom names
- [ ] Submit application forms
- [ ] Edit application form (before review)
- [ ] Prevent editing after admin review
- [ ] Admin view all applications
- [ ] Admin review and accept/reject
- [ ] Admin close application process
- [ ] Prevent adding dependants after closure
- [ ] Form validation (all fields)
- [ ] Passport expiry validation (6+ months)
- [ ] Travel date validation
- [ ] Document type validation
- [ ] Mobile responsiveness

---

## Notes

- All documents are images uploaded to Cloudinary
- Application numbers should be auto-generated and unique
- Forms should match the exact structure shown in the provided images
- The system should be seamless and intuitive for users
- Admin should have full visibility and control over the application process
- All changes should respect the existing booking and payment flow
