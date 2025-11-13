# Quick Start - Test Data Seed

## Run the Seed Script

```bash
npm run seed:test
```

This will:
- ✅ Preserve all tours/packages (does NOT delete them)
- 🗑️ Clear all bookings, users, and dependants
- 📦 Create comprehensive test data for 8 different scenarios

## Test Scenarios Overview

### Scenario 1: Payment Pending
- **User**: john@example.com
- **Booking**: Payment pending, no application access
- **Test**: Verify application process is blocked until payment

### Scenario 2: User App Submitted
- **User**: sarah@example.com  
- **Booking**: Paid, user application submitted, documents uploaded
- **Test**: View/edit submitted application, document management

### Scenario 3: Complete Success
- **User**: ahmed@example.com
- **Booking**: Paid, user + 2 dependants, all applications accepted
- **Test**: Complete workflow, read-only forms after acceptance

### Scenario 4: Under Review
- **User**: fatima@example.com
- **Booking**: Paid, user under review, 1 dependant pending
- **Test**: Admin review process, dependant can still submit

### Scenario 5: Application Closed
- **User**: michael@example.com
- **Booking**: Paid, application closed, all accepted
- **Test**: Cannot add/remove dependants when closed

### Scenario 6: Rejected Application
- **User**: aisha@example.com
- **Booking**: Paid, user rejected, 1 dependant submitted
- **Test**: Rejected application handling, cannot edit

### Scenario 7: Fresh Start
- **User**: john@example.com
- **Booking**: Paid, no applications, 3 dependants added
- **Test**: Complete workflow from scratch

### Scenario 8: Failed Payment
- **User**: sarah@example.com
- **Booking**: Payment failed
- **Test**: No application access with failed payment

## Login Credentials

All passwords: `password123`

- **Admin**: admin@naasirtravel.com
- **User 1**: john@example.com (Bookings: 1, 7)
- **User 2**: sarah@example.com (Bookings: 2, 8)
- **User 3**: ahmed@example.com (Booking: 3)
- **User 4**: fatima@example.com (Booking: 4)
- **User 5**: michael@example.com (Booking: 5)
- **User 6**: aisha@example.com (Booking: 6)

## What Gets Created

- **8 Bookings** covering all scenarios
- **7 Users** (1 admin + 6 regular users)
- **7 Dependants** across different bookings
- **Documents** using public image URLs (no Cloudinary needed)
- **Application forms** in various states (pending, submitted, under_review, accepted, rejected)

## Next Steps

1. Run the seed: `npm run seed:test`
2. Review `TEST_PLAN.md` for detailed test cases
3. Start testing each scenario systematically
4. Use the test plan checklist to track progress

## Notes

- All document images use public URLs (Unsplash placeholders)
- Application numbers are auto-generated
- Dates are set to future dates for realistic testing
- All test data is designed to test edge cases and validation
