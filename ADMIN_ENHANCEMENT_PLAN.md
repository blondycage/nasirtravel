# Admin Side Enhancement - Implementation Plan

> **Date**: 2026-02-01
> **Status**: Ready for Implementation
> **Requirements Confirmed**: Yes

---

## 🎯 Requirements Summary

### Confirmed Decisions
- ✅ **Rejection/Revision**: Option A - Add `rejection_reason` field + `needs_revision` status
- ✅ **Package Dashboard**: Show ALL bookings under package with application details
- ✅ **User Editing**: Edit all fields EXCEPT password (name, email, phone, role)
- ✅ **Audit Trail**: NOT needed (no tracking of who/when)
- ✅ **Email Notifications**: YES - Send emails for `needs_revision` and `rejected` status

---

## 📋 Features to Implement

### Feature 1: Enhanced Booking Detail Page (Admin)
**Location**: `/admin/bookings/[id]`

**What to Add**:
- Application Management section showing:
  - Primary user application (status, app number, action buttons)
  - All dependant applications (status, app number, action buttons)
  - Quick links to view/review each application
  - Application process status (open/closed)

### Feature 2: Application Review with Rejection Reason
**Location**: `/admin/applications/user/[bookingId]` & `/admin/applications/dependant/[dependantId]`

**What to Add**:
- Status dropdown with new statuses: `needs_revision`, `rejected`
- Rejection/revision reason text field (required for rejection/revision)
- Save button to update status + send email
- Display rejection reason if exists

### Feature 3: User Management - CRUD Operations
**New Pages**:
- `/admin/users/new` - Create user manually
- `/admin/users/[userId]` - View user profile with bookings & applications
- `/admin/users/[userId]/edit` - Edit user (name, email, phone, role)

**Updates**:
- `/admin/users` - Add "Add User" button, Edit/View actions per user

### Feature 4: Package Dashboard
**New Page**: `/admin/tours/[tourId]/dashboard`

**What to Show**:
- Tour overview stats (total bookings, paid bookings, pending apps)
- Complete list of ALL bookings for this tour
- For each booking:
  - Booking info (customer, status, amount)
  - Application summary (how many apps, statuses)
  - Expandable/collapsible list of individual applications
  - Quick links to booking detail and application reviews

### Feature 5: Email Notifications
**When to Send**:
- Status changed to `needs_revision` → Send email with revision notes
- Status changed to `rejected` → Send email with rejection reason

---

## 🗄️ Database Changes

### Booking Model Updates
```typescript
// Add to IBooking interface
userApplicationRejectionReason?: string;
```

### Dependant Model Updates
```typescript
// Add to IDependant interface
applicationRejectionReason?: string;
```

### User Model
No changes needed (already has all required fields)

---

## 🔌 API Endpoints

### NEW Endpoints

#### User Management
```
POST   /api/admin/users              - Create user manually
GET    /api/admin/users/[id]         - Get user profile with bookings & apps
PUT    /api/admin/users/[id]         - Update user (name, email, phone, role)
DELETE /api/admin/users/[id]         - Delete user (optional)
```

#### Package Dashboard
```
GET    /api/admin/tours/[tourId]/dashboard    - Get tour stats + all bookings with apps
```

#### Application Review Enhancement
```
PATCH  /api/admin/bookings/[id]/user-application-status    - Update with reason
PATCH  /api/admin/dependants/[id]/application-status       - Update with reason
```

### UPDATED Endpoints

#### Booking Detail Enhancement
```
GET    /api/bookings/[id]    - Include application summaries in response
```

---

## 📧 Email Templates

### Email 1: Application Needs Revision
**Subject**: Application Revision Required - Naasir Travel
**Trigger**: Status changed to `needs_revision`
**Content**:
- Customer name
- Tour title
- Application type (user/dependant)
- Revision notes from admin
- Link to edit application
- Contact info

### Email 2: Application Rejected
**Subject**: Application Status Update - Naasir Travel
**Trigger**: Status changed to `rejected`
**Content**:
- Customer name
- Tour title
- Application type (user/dependant)
- Rejection reason from admin
- Contact info for questions

---

## 🎨 UI Components to Create

### 1. ApplicationCard Component
Reusable card showing:
- Applicant name (user or dependant)
- Application number
- Status badge
- Package type badge
- Action buttons (View, Review)

### 2. ApplicationReviewForm Component
Form for changing status:
- Status dropdown (all statuses)
- Conditional reason field (shown for needs_revision/rejected)
- Save button
- Cancel button

### 3. UserForm Component
Form for create/edit user:
- Name input
- Email input
- Phone input
- Role dropdown
- Password input (only on create)
- Submit button

### 4. PackageDashboardStats Component
Stats cards showing:
- Total bookings
- Paid bookings
- Pending payments
- Total applications
- Pending applications
- Accepted applications

### 5. BookingApplicationsList Component
Expandable list of bookings with applications:
- Booking header (customer, amount, status)
- Applications list (user + dependants)
- Expand/collapse functionality

---

## 🚀 Implementation Order

### Phase 1: Database & Backend (Foundation)
**Priority**: Highest
**Estimated Time**: 2-3 hours

1. ✅ Update Booking model (add `userApplicationRejectionReason`)
2. ✅ Update Dependant model (add `applicationRejectionReason`)
3. ✅ Create email templates (needs_revision, rejected)
4. ✅ Update application status APIs (add reason parameter)
5. ✅ Create user CRUD APIs
6. ✅ Create package dashboard API
7. ✅ Update booking detail API (include app summaries)

### Phase 2: Reusable Components
**Priority**: High
**Estimated Time**: 2 hours

1. ✅ Create ApplicationCard component
2. ✅ Create ApplicationReviewForm component
3. ✅ Create UserForm component
4. ✅ Create PackageDashboardStats component
5. ✅ Create BookingApplicationsList component

### Phase 3: Application Review Enhancement
**Priority**: High
**Estimated Time**: 1 hour

1. ✅ Update user application review page (add reason field)
2. ✅ Update dependant application review page (add reason field)
3. ✅ Test email sending on status change

### Phase 4: Booking Detail Enhancement
**Priority**: High
**Estimated Time**: 1.5 hours

1. ✅ Update admin booking detail page
2. ✅ Add Application Management section
3. ✅ Integrate ApplicationCard components
4. ✅ Test navigation to application reviews

### Phase 5: User Management
**Priority**: Medium
**Estimated Time**: 2-3 hours

1. ✅ Create add user page
2. ✅ Create user profile view page
3. ✅ Create edit user page
4. ✅ Update users list page (add buttons/actions)
5. ✅ Test CRUD operations

### Phase 6: Package Dashboard
**Priority**: Medium
**Estimated Time**: 2-3 hours

1. ✅ Create package dashboard page
2. ✅ Add stats section
3. ✅ Add bookings list with applications
4. ✅ Add navigation link from tours page
5. ✅ Test with multiple bookings

### Phase 7: Testing & Polish
**Priority**: Medium
**Estimated Time**: 1-2 hours

1. ✅ End-to-end testing of all features
2. ✅ Email testing (revision, rejection)
3. ✅ Responsive design check
4. ✅ Error handling verification
5. ✅ Update PROJECT_OVERVIEW.md

---

## 📊 New Application Status Flow

```
pending
   ↓
submitted (user submits form)
   ↓
under_review (admin starts reviewing)
   ↓
   ├─→ needs_revision (+ email with notes) → user can re-submit → back to submitted
   ├─→ rejected (+ email with reason) → FINAL
   └─→ accepted → FINAL
```

---

## 🎨 UI/UX Guidelines

### Status Colors
- `pending` → 🟡 Yellow (#FEF3C7 bg, #92400E text)
- `submitted` → 🔵 Blue (#DBEAFE bg, #1E40AF text)
- `under_review` → 🟠 Orange (#FED7AA bg, #9A3412 text)
- `needs_revision` → 🟣 Purple (#E9D5FF bg, #6B21A8 text)
- `accepted` → 🟢 Green (#D1FAE5 bg, #065F46 text)
- `rejected` → 🔴 Red (#FEE2E2 bg, #991B1B text)

### Button Styles
- Primary Action → Blue gradient
- Secondary Action → Gray
- Destructive Action → Red
- Success Action → Green

### Layout Consistency
- All admin pages use same header with back button
- Cards with rounded corners, shadow
- Consistent spacing (p-6 for cards, gap-4 for grids)

---

## 🧪 Testing Checklist

### Application Review
- [ ] Change status to needs_revision with reason → email sent
- [ ] Change status to rejected with reason → email sent
- [ ] Reason field required for revision/rejection
- [ ] Status badge updates correctly
- [ ] Reason displayed on application view

### User Management
- [ ] Create user with all fields
- [ ] Edit user (name, email, phone, role)
- [ ] View user profile with bookings
- [ ] View user profile with applications
- [ ] Delete user (if implemented)

### Package Dashboard
- [ ] Shows correct tour information
- [ ] Lists all bookings for tour
- [ ] Shows application counts correctly
- [ ] Application statuses display correctly
- [ ] Links work (to booking, to applications)

### Booking Detail
- [ ] Application Management section appears
- [ ] User application shown correctly
- [ ] All dependant applications shown
- [ ] Links to applications work
- [ ] Application closed status shown

### Emails
- [ ] Needs revision email sent with correct info
- [ ] Rejected email sent with correct info
- [ ] Email contains correct tour/booking details
- [ ] Links in email work

---

## 📝 File Structure

### New Files to Create
```
app/
├── admin/
│   ├── users/
│   │   ├── new/
│   │   │   └── page.tsx                          (Create user)
│   │   └── [userId]/
│   │       ├── page.tsx                          (View user profile)
│   │       └── edit/
│   │           └── page.tsx                      (Edit user)
│   └── tours/
│       └── [tourId]/
│           └── dashboard/
│               └── page.tsx                      (Package dashboard)
├── api/
│   └── admin/
│       ├── users/
│       │   ├── route.ts                          (POST - create user)
│       │   └── [id]/
│       │       └── route.ts                      (GET, PUT, DELETE)
│       └── tours/
│           └── [tourId]/
│               └── dashboard/
│                   └── route.ts                  (GET - package stats)
components/
├── admin/
│   ├── ApplicationCard.tsx                       (Application summary card)
│   ├── ApplicationReviewForm.tsx                 (Review form with reason)
│   ├── UserForm.tsx                              (Create/edit user form)
│   ├── PackageDashboardStats.tsx                 (Tour stats cards)
│   └── BookingApplicationsList.tsx               (Bookings with apps)
```

### Files to Update
```
lib/
├── models/
│   ├── Booking.ts                                (Add rejectionReason)
│   └── Dependant.ts                              (Add rejectionReason)
└── utils/
    └── email.ts                                  (Add 2 new email functions)

app/
├── admin/
│   ├── bookings/
│   │   └── [id]/
│   │       └── page.tsx                          (Add app management section)
│   ├── applications/
│   │   ├── user/
│   │   │   └── [bookingId]/
│   │   │       └── page.tsx                      (Add review form)
│   │   └── dependant/
│   │       └── [dependantId]/
│   │           └── page.tsx                      (Add review form)
│   ├── users/
│   │   └── page.tsx                              (Add create/edit buttons)
│   └── tours/
│       └── page.tsx                              (Add dashboard link)
└── api/
    ├── bookings/
    │   └── [id]/
    │       └── route.ts                          (Include app summaries)
    └── admin/
        ├── bookings/
        │   └── [id]/
        │       └── user-application-status/
        │           └── route.ts                  (Add reason param)
        └── dependants/
            └── [id]/
                └── application-status/
                    └── route.ts                  (Add reason param)
```

---

## ✅ Success Criteria

Feature is complete when:

1. ✅ Admin can see all applications under a booking on booking detail page
2. ✅ Admin can reject/request revision with notes
3. ✅ Emails sent automatically on rejection/revision
4. ✅ Admin can create users manually
5. ✅ Admin can edit users (all fields except password)
6. ✅ Admin can view user profile with bookings & applications
7. ✅ Package dashboard shows all bookings with application details
8. ✅ All links and navigation work correctly
9. ✅ Responsive design on mobile/tablet
10. ✅ No breaking changes to existing functionality

---

## 🎯 Next Steps

1. Start with Phase 1 (Database & Backend)
2. Proceed through phases in order
3. Test each phase before moving to next
4. Update PROJECT_OVERVIEW.md when complete

---

**Ready to implement!** 🚀
