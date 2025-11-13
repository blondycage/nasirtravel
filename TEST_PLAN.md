# Comprehensive Test Plan - Dependant Application System

## Overview
This test plan covers all scenarios for the dependant application system, including user flows, admin flows, edge cases, and validation testing.

## Test Data Summary

### Users Created
- **Admin**: admin@naasirtravel.com / password123
- **User 1**: john@example.com / password123 (Bookings: 1, 7)
- **User 2**: sarah@example.com / password123 (Bookings: 2, 8)
- **User 3**: ahmed@example.com / password123 (Booking: 3)
- **User 4**: fatima@example.com / password123 (Booking: 4)
- **User 5**: michael@example.com / password123 (Booking: 5)
- **User 6**: aisha@example.com / password123 (Booking: 6)

### Test Scenarios Created

#### Scenario 1: Payment Pending Booking
- **Booking ID**: Booking 1
- **User**: john@example.com
- **Status**: Payment pending, booking pending
- **Application**: Not started
- **Dependants**: None
- **Purpose**: Test that application process is not accessible until payment is complete

#### Scenario 2: Paid - User App Submitted, No Dependants
- **Booking ID**: Booking 2
- **User**: sarah@example.com
- **Status**: Payment paid, booking confirmed
- **Application**: User application submitted, documents uploaded
- **Dependants**: None
- **Purpose**: Test user application form submission, document upload, and viewing submitted application

#### Scenario 3: Paid - User Accepted, 2 Dependants, All Accepted
- **Booking ID**: Booking 3
- **User**: ahmed@example.com
- **Status**: Payment paid, booking confirmed
- **Application**: User application accepted, 2 dependants (spouse + child), all accepted
- **Dependants**: 
  - Amina Hassan (Spouse) - Accepted
  - Omar Hassan (Child) - Accepted
- **Purpose**: Test complete workflow with dependants, all applications accepted, view read-only forms

#### Scenario 4: Paid - User Under Review, 1 Dependant Pending
- **Booking ID**: Booking 4
- **User**: fatima@example.com
- **Status**: Payment paid, booking confirmed
- **Application**: User application under review, 1 dependant pending application
- **Dependants**: 
  - Hassan Ali (Spouse) - Pending (form not submitted)
- **Purpose**: Test admin review process, dependant can still submit application

#### Scenario 5: Paid - Application Closed, All Accepted
- **Booking ID**: Booking 5
- **User**: michael@example.com
- **Status**: Payment paid, booking confirmed, **Application CLOSED**
- **Application**: User application accepted, application process closed by admin
- **Dependants**: 
  - Emily Johnson (Sibling) - Accepted
- **Purpose**: Test that dependants cannot be added/removed when application is closed

#### Scenario 6: Paid - User Rejected, 1 Dependant Submitted
- **Booking ID**: Booking 6
- **User**: aisha@example.com
- **Status**: Payment paid, booking confirmed
- **Application**: User application rejected, 1 dependant submitted
- **Dependants**: 
  - Zain Khan (Spouse) - Submitted
- **Purpose**: Test rejected application scenario, user cannot edit rejected application

#### Scenario 7: Paid - No Applications, 3 Dependants Added
- **Booking ID**: Booking 7
- **User**: john@example.com
- **Status**: Payment paid, booking confirmed
- **Application**: No applications submitted yet
- **Dependants**: 
  - Jane Doe (Spouse) - Pending
  - Alice Doe (Child) - Pending
  - Bob Doe (Child) - Pending
- **Purpose**: Test adding multiple dependants, filling forms for all, document uploads

#### Scenario 8: Failed Payment Booking
- **Booking ID**: Booking 8
- **User**: sarah@example.com
- **Status**: Payment failed, booking pending
- **Application**: Not accessible
- **Dependants**: None
- **Purpose**: Test that failed payment bookings cannot access application process

---

## Test Cases

### 1. User Flow - Payment Pending

#### TC-1.1: Access Application Process with Pending Payment
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 1 details
  3. Try to access application form
- **Expected**: Application process section should not be visible or should show "Payment required" message
- **Status**: ⬜ Not Tested

#### TC-1.2: Add Dependant with Pending Payment
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 1 documents page
  3. Try to add dependant
- **Expected**: Should show error "Payment must be completed before adding dependants"
- **Status**: ⬜ Not Tested

---

### 2. User Flow - Application Form Submission

#### TC-2.1: Fill User Application Form
- **Steps**:
  1. Login as sarah@example.com
  2. Navigate to Booking 2 details
  3. Click "View/Edit Your Application Form"
  4. Verify form is pre-filled with submitted data
  5. Try to edit form
- **Expected**: Form should be viewable, can edit if status is "submitted" (not reviewed)
- **Status**: ⬜ Not Tested

#### TC-2.2: Submit New User Application Form
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7 details
  3. Click "Fill Your Application Form"
  4. Fill all required fields
  5. Submit form
- **Expected**: Form submits successfully, status changes to "submitted"
- **Status**: ⬜ Not Tested

#### TC-2.3: Form Validation - Passport Expiry
- **Steps**:
  1. Fill application form
  2. Enter passport expiry date less than 6 months from today
  3. Submit form
- **Expected**: Should show error "Passport must be valid at least 6 months from the visa application submission date"
- **Status**: ⬜ Not Tested

#### TC-2.4: Form Validation - Travel Dates
- **Steps**:
  1. Fill application form
  2. Enter departure date before arrival date
  3. Submit form
- **Expected**: Should show error "Expected departure date must be after arrival date"
- **Status**: ⬜ Not Tested

#### TC-2.5: Form Validation - Stay Duration
- **Steps**:
  1. Fill application form
  2. Enter travel dates with more than 90 days difference
  3. Submit form
- **Expected**: Should show error "The period of stay cannot exceed 90 days"
- **Status**: ⬜ Not Tested

#### TC-2.6: Form Validation - Required Fields
- **Steps**:
  1. Fill application form
  2. Leave required fields empty
  3. Submit form
- **Expected**: Should show validation errors for all required fields
- **Status**: ⬜ Not Tested

---

### 3. User Flow - Document Upload

#### TC-3.1: Upload Personal Passport Picture
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7 documents page
  3. Upload personal passport picture
- **Expected**: Document uploads successfully, appears in documents list
- **Status**: ⬜ Not Tested

#### TC-3.2: Upload International Passport
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7 documents page
  3. Upload international passport
- **Expected**: Document uploads successfully, replaces old one if exists
- **Status**: ⬜ Not Tested

#### TC-3.3: Upload Supporting Document with Custom Name
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7 documents page
  3. Enter document name "Visa Document"
  4. Upload supporting document
- **Expected**: Document uploads with custom name, appears in supporting documents list
- **Status**: ⬜ Not Tested

#### TC-3.4: Delete Document
- **Steps**:
  1. Navigate to documents page
  2. Click delete on a document
  3. Confirm deletion
- **Expected**: Document is deleted successfully
- **Status**: ⬜ Not Tested

#### TC-3.5: Replace Document (Upload New Over Old)
- **Steps**:
  1. Upload personal passport picture
  2. Upload new personal passport picture
- **Expected**: Old document is replaced, only one personal passport picture exists
- **Status**: ⬜ Not Tested

---

### 4. User Flow - Dependant Management

#### TC-4.1: Add Dependant
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7 documents page
  3. Click "Add Dependant"
  4. Fill dependant details (name, relationship)
  5. Submit
- **Expected**: Dependant is added successfully, appears in dependants list
- **Status**: ⬜ Not Tested

#### TC-4.2: Add Dependant When Application Closed
- **Steps**:
  1. Login as michael@example.com
  2. Navigate to Booking 5 documents page
  3. Try to add dependant
- **Expected**: Should show error "Application process has been closed. Cannot add new dependants."
- **Status**: ⬜ Not Tested

#### TC-4.3: Remove Dependant
- **Steps**:
  1. Navigate to documents page
  2. Click delete on a dependant
  3. Confirm deletion
- **Expected**: Dependant and all their documents are deleted
- **Status**: ⬜ Not Tested

#### TC-4.4: Remove Dependant When Application Closed
- **Steps**:
  1. Login as michael@example.com
  2. Navigate to Booking 5 documents page
  3. Try to remove dependant
- **Expected**: Should show error "Application process has been closed. Cannot remove dependants."
- **Status**: ⬜ Not Tested

#### TC-4.5: Fill Dependant Application Form
- **Steps**:
  1. Navigate to dependant card
  2. Click "Fill Application"
  3. Fill all required fields
  4. Submit
- **Expected**: Form submits successfully, dependant status changes to "submitted"
- **Status**: ⬜ Not Tested

#### TC-4.6: Upload Documents for Dependant
- **Steps**:
  1. Navigate to dependant card
  2. Upload personal passport picture
  3. Upload international passport
  4. Upload supporting document with name
- **Expected**: All documents upload successfully, appear in dependant's document list
- **Status**: ⬜ Not Tested

---

### 5. User Flow - Application Status

#### TC-5.1: View Submitted Application
- **Steps**:
  1. Login as sarah@example.com
  2. Navigate to Booking 2 application page
- **Expected**: Form displays in read-only mode if under review, editable if just submitted
- **Status**: ⬜ Not Tested

#### TC-5.2: Edit Submitted Application (Before Review)
- **Steps**:
  1. Login as sarah@example.com
  2. Navigate to Booking 2 application page
  3. Edit form fields
  4. Submit
- **Expected**: Form updates successfully if status is "submitted" (not reviewed)
- **Status**: ⬜ Not Tested

#### TC-5.3: Edit Accepted Application
- **Steps**:
  1. Login as ahmed@example.com
  2. Navigate to Booking 3 application page
  3. Try to edit form
- **Expected**: Form should be read-only, cannot edit
- **Status**: ⬜ Not Tested

#### TC-5.4: Edit Rejected Application
- **Steps**:
  1. Login as aisha@example.com
  2. Navigate to Booking 6 application page
  3. Try to edit form
- **Expected**: Form should be read-only, cannot edit
- **Status**: ⬜ Not Tested

---

### 6. Admin Flow - View Applications

#### TC-6.1: View All Applications for Booking
- **Steps**:
  1. Login as admin@naasirtravel.com
  2. Navigate to admin bookings
  3. Open Booking 3 details
  4. View applications
- **Expected**: Should see user application and all dependant applications with statuses
- **Status**: ⬜ Not Tested

#### TC-6.2: View Application Forms
- **Steps**:
  1. Admin views Booking 3
  2. Click on user application
  3. Click on dependant applications
- **Expected**: All application forms should be viewable in read-only mode
- **Status**: ⬜ Not Tested

#### TC-6.3: View All Documents
- **Steps**:
  1. Admin views Booking 3
  2. View user documents
  3. View dependant documents
- **Expected**: All documents should be viewable with download links
- **Status**: ⬜ Not Tested

---

### 7. Admin Flow - Review Applications

#### TC-7.1: Accept User Application
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 4
  3. Change user application status to "accepted"
- **Expected**: Status updates to "accepted", user cannot edit form anymore
- **Status**: ⬜ Not Tested

#### TC-7.2: Reject User Application
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 4
  3. Change user application status to "rejected"
- **Expected**: Status updates to "rejected", user cannot edit form anymore
- **Status**: ⬜ Not Tested

#### TC-7.3: Accept Dependant Application
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 4
  3. Change dependant application status to "accepted"
- **Expected**: Status updates to "accepted", dependant cannot edit form anymore
- **Status**: ⬜ Not Tested

#### TC-7.4: Reject Dependant Application
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 4
  3. Change dependant application status to "rejected"
- **Expected**: Status updates to "rejected", dependant cannot edit form anymore
- **Status**: ⬜ Not Tested

#### TC-7.5: Set Application to Under Review
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 4
  3. Change application status to "under_review"
- **Expected**: Status updates to "under_review"
- **Status**: ⬜ Not Tested

---

### 8. Admin Flow - Application Closure

#### TC-8.1: Close Application Process
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 7
  3. Close application process
- **Expected**: Application is closed, users cannot add/remove dependants
- **Status**: ⬜ Not Tested

#### TC-8.2: Reopen Application Process
- **Steps**:
  1. Login as admin
  2. Navigate to Booking 5
  3. Reopen application process
- **Expected**: Application is reopened, users can add/remove dependants again
- **Status**: ⬜ Not Tested

#### TC-8.3: Add Dependant After Closure
- **Steps**:
  1. Login as michael@example.com
  2. Navigate to Booking 5
  3. Try to add dependant
- **Expected**: Should show error that application is closed
- **Status**: ⬜ Not Tested

---

### 9. Edge Cases & Validation

#### TC-9.1: Multiple Supporting Documents
- **Steps**:
  1. Upload multiple supporting documents with different names
- **Expected**: All documents should be saved and displayed separately
- **Status**: ⬜ Not Tested

#### TC-9.2: Application Number Generation
- **Steps**:
  1. Submit multiple application forms
- **Expected**: Each form should get unique application number (YYMMDD + 6 digits)
- **Status**: ⬜ Not Tested

#### TC-9.3: Date Validation - Arrival Within 1 Year
- **Steps**:
  1. Fill form with arrival date more than 1 year from now
  2. Submit
- **Expected**: Should show error "Expected arrival date should be within 1 year from submission date"
- **Status**: ⬜ Not Tested

#### TC-9.4: Access Other User's Booking
- **Steps**:
  1. Login as john@example.com
  2. Try to access Booking 2 (belongs to sarah@example.com)
- **Expected**: Should show access denied or 403 error
- **Status**: ⬜ Not Tested

#### TC-9.5: Access Other User's Dependant
- **Steps**:
  1. Login as john@example.com
  2. Try to access dependant from Booking 3
- **Expected**: Should show access denied or 403 error
- **Status**: ⬜ Not Tested

---

### 10. Complete Workflow Tests

#### TC-10.1: Complete Happy Path
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7
  3. Fill user application form
  4. Upload all required documents
  5. Add 3 dependants
  6. Fill each dependant's application form
  7. Upload documents for each dependant
  8. Submit all applications
  9. Login as admin
  10. Review and accept all applications
  11. Close application process
- **Expected**: Complete workflow executes successfully
- **Status**: ⬜ Not Tested

#### TC-10.2: Partial Workflow - Some Dependants Missing Applications
- **Steps**:
  1. Login as john@example.com
  2. Navigate to Booking 7
  3. Fill user application form
  4. Add 3 dependants
  5. Fill application for only 2 dependants
  6. Submit user and 2 dependant applications
- **Expected**: User and 2 dependants have submitted applications, 1 dependant still pending
- **Status**: ⬜ Not Tested

---

## Test Execution Checklist

### Pre-Testing Setup
- [ ] Run seed script: `npm run seed:test` or `ts-node scripts/seed-application-test.ts`
- [ ] Verify all 8 bookings are created
- [ ] Verify all users are created
- [ ] Verify all dependants are created
- [ ] Verify documents are using public image URLs

### User Testing
- [ ] Test all user flow scenarios (TC-1 through TC-5)
- [ ] Test all validation scenarios (TC-9)
- [ ] Test complete workflows (TC-10)

### Admin Testing
- [ ] Test all admin view scenarios (TC-6)
- [ ] Test all admin review scenarios (TC-7)
- [ ] Test application closure scenarios (TC-8)

### Edge Cases
- [ ] Test access control (TC-9.4, TC-9.5)
- [ ] Test date validations (TC-9.3)
- [ ] Test document management edge cases

---

## Test Results Template

```
Test Case: TC-X.X
Status: ✅ Pass / ❌ Fail / ⚠️ Partial
Notes: [Any observations or issues]
Screenshots: [If applicable]
```

---

## Known Issues to Watch For

1. **Application Number Uniqueness**: Ensure no duplicate application numbers
2. **Document Deletion**: Verify Cloudinary cleanup (though using public URLs in test)
3. **Date Validation**: Check timezone handling for date comparisons
4. **Form State**: Ensure forms are properly locked after admin review
5. **Dependant Count**: Verify numberOfTravelers matches actual dependants + 1 (user)

---

## Performance Testing (Optional)

- [ ] Load test with 50+ dependants
- [ ] Test form submission with large documents
- [ ] Test admin review page with many applications

---

## Browser Compatibility Testing

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## Notes

- All test data uses public image URLs from Unsplash/placeholder services
- Application numbers are auto-generated in format: YYMMDD + 6 random digits
- All passwords for test users: `password123`
- Test data covers all payment statuses, application statuses, and edge cases
