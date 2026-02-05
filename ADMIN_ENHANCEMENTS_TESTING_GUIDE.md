# Admin Enhancements Testing Guide

> **Date**: 2026-02-01
> **Purpose**: Step-by-step guide to test all newly implemented admin features

---

## 🎯 Overview of New Features

This guide covers testing for:
1. Application Rejection/Revision System
2. User Management System (Create, View, Edit)
3. Package Dashboard
4. Enhanced Booking Details
5. Email Notifications for Revision/Rejection

---

## 📋 Pre-Testing Checklist

### Required Setup
- [ ] Development server running (`npm run dev`)
- [ ] MongoDB connected and seeded with test data
- [ ] Admin account credentials ready (email: `admin@naasirtravel.com`, password: `password123`)
- [ ] Email service configured (check `.env` for Gmail SMTP settings)
- [ ] At least one tour/package created
- [ ] At least one booking with payment completed
- [ ] At least one application submitted (user or dependant)

### Test User Accounts Needed
- **Admin Account**: admin@naasirtravel.com / password123
- **Regular User Account**: john@example.com / password123 (or create new one)

---

## 🧪 Testing Scenarios

---

## **1. Application Rejection/Revision System**

### Test 1.1: Request Application Revision (User Application)

**Objective**: Test the "needs_revision" status and email notification

1. **Login as Admin**
   - Go to `http://localhost:3000/login`
   - Login with admin credentials

2. **Navigate to Applications**
   - Click "Applications" from admin dashboard
   - Or go directly to `http://localhost:3000/admin/applications`

3. **Select a User Application**
   - Click "View" on any application with status "submitted" or "under_review"
   - You should be redirected to `/admin/applications/user/[bookingId]`

4. **Request Revision**
   - Scroll to "Application Status Management" section
   - Select status: `needs_revision`
   - **Important**: A "Revision Notes" textarea should appear
   - Enter revision notes: `"Please update your passport number. The current number appears to be incorrect."`
   - Click "Update Status"

5. **Verify Success**
   - [ ] Success message appears
   - [ ] Application status badge shows "needs_revision" (purple badge)
   - [ ] Revision notes are displayed below status

6. **Check Email**
   - [ ] Check the email inbox for the customer (user's email)
   - [ ] Email subject: "Action Required: Your Visa Application Needs Revision"
   - [ ] Email contains revision notes
   - [ ] Email contains link to edit application
   - [ ] Link format: `http://localhost:3000/dashboard/bookings/[id]/application`

7. **Test User Experience**
   - Logout from admin
   - Login as the user (customer)
   - Go to dashboard → bookings → click on the booking
   - Click "Edit Application"
   - Verify user can edit and resubmit

---

### Test 1.2: Reject Application (Dependant Application)

**Objective**: Test rejection with reason and email notification

1. **Login as Admin** (if not already)

2. **Navigate to Dependant Application**
   - Go to Applications page
   - Find a dependant application with status "submitted"
   - Click "View"
   - Should redirect to `/admin/applications/dependant/[dependantId]`

3. **Reject Application**
   - In "Application Status Management" section
   - Select status: `rejected`
   - **Important**: A "Rejection Reason" textarea should appear
   - Enter reason: `"Incomplete documentation. Missing international passport copy."`
   - Click "Update Status"

4. **Verify Success**
   - [ ] Success message appears
   - [ ] Application status badge shows "rejected" (red badge)
   - [ ] Rejection reason is displayed

5. **Check Email**
   - [ ] Check email inbox for the customer (booking user's email)
   - [ ] Email subject: "Visa Application Update - Application Rejected"
   - [ ] Email contains rejection reason
   - [ ] Email contains contact information for support

---

### Test 1.3: Accept Application (Normal Flow)

**Objective**: Ensure existing accept flow still works

1. **Select Any Application**
   - Navigate to any submitted application

2. **Accept Application**
   - Select status: `accepted`
   - **Important**: Reason field should NOT appear
   - Click "Update Status"

3. **Verify Success**
   - [ ] Success message appears
   - [ ] Status badge shows "accepted" (green badge)
   - [ ] No rejection reason displayed

---

## **2. User Management System**

### Test 2.1: View All Users

**Objective**: Test users list page with new action buttons

1. **Navigate to Users Page**
   - From admin dashboard, click "Users"
   - Or go to `http://localhost:3000/admin/users`

2. **Verify Users List**
   - [ ] Table displays all users
   - [ ] Columns: Name, Email, Phone, Role, Joined, Actions
   - [ ] Stats cards show: Total Users, Admins, Regular Users
   - [ ] "Add New User" button visible in header

3. **Check Action Buttons**
   - [ ] Each user row has "View" and "Edit" buttons
   - [ ] "View" link is blue
   - [ ] "Edit" link is indigo/purple

---

### Test 2.2: Create New User Manually

**Objective**: Test manual user creation from admin panel

1. **Click "Add New User" Button**
   - From `/admin/users` page, click "+ Add New User"
   - Should redirect to `/admin/users/new`

2. **Fill User Form**
   - **Name**: Test User Manual
   - **Email**: testmanual@example.com
   - **Phone**: +1-555-0199
   - **Password**: testpassword123
   - **Role**: Select "user"

3. **Submit Form**
   - Click "Create User"
   - Should redirect back to `/admin/users`

4. **Verify User Created**
   - [ ] New user appears in the list
   - [ ] Success message or user visible in table
   - [ ] User details match what you entered

5. **Test Login with New User**
   - Logout from admin
   - Login with `testmanual@example.com` / `testpassword123`
   - [ ] Login successful
   - [ ] User dashboard accessible

---

### Test 2.3: View User Profile

**Objective**: Test comprehensive user profile page

1. **Login as Admin** (if needed)

2. **Navigate to User Profile**
   - Go to `/admin/users`
   - Click "View" on any user (preferably one with bookings)

3. **Verify Profile Page** (`/admin/users/[userId]`)
   - [ ] Header shows "User Profile"
   - [ ] "Edit User" button visible in header
   - [ ] "Back to Users" link works

4. **Verify Basic Information Section**
   - [ ] Name displayed correctly
   - [ ] Email displayed correctly
   - [ ] Phone displayed correctly (or "N/A")
   - [ ] Role badge (admin = purple, user = blue)
   - [ ] Joined date displayed

5. **Verify Statistics Cards**
   - [ ] Total Bookings count
   - [ ] Total Applications count
   - [ ] Dependants count

6. **Verify Bookings Section**
   - [ ] Lists all user's bookings
   - [ ] Each booking shows: Tour title, Date, Amount, Payment status
   - [ ] "View" button links to `/admin/bookings/[id]`
   - [ ] If no bookings: "No bookings yet" message

7. **Verify Applications Section**
   - [ ] Lists all applications (user applications + dependant applications)
   - [ ] Each application shows: Name/Type, Tour title, Status badge
   - [ ] "View" button links to correct application page
   - [ ] Status badges color-coded correctly
   - [ ] If no applications: "No applications yet" message

---

### Test 2.4: Edit User

**Objective**: Test user editing (all fields except password)

1. **Navigate to Edit Page**
   - From user profile page, click "Edit User"
   - Or from users list, click "Edit"
   - Should go to `/admin/users/[userId]/edit`

2. **Verify Form Pre-filled**
   - [ ] Name field has existing value
   - [ ] Email field has existing value
   - [ ] Phone field has existing value
   - [ ] Role dropdown shows current role
   - [ ] **Password field NOT visible** (important!)

3. **Update User Information**
   - Change name: "Updated Test User"
   - Change phone: "+1-555-0299"
   - Keep email and role same
   - Click "Update User"

4. **Verify Update Success**
   - [ ] Redirects to user profile page
   - [ ] Updated information displayed
   - [ ] Name shows "Updated Test User"
   - [ ] Phone shows "+1-555-0299"

5. **Test Role Change**
   - Go back to edit page
   - Change role from "user" to "admin"
   - Click "Update User"
   - [ ] User profile shows admin badge (purple)
   - Go to users list
   - [ ] User appears in "Admins" count

---

### Test 2.5: Cancel Buttons

**Objective**: Verify cancel functionality doesn't save changes

1. **From Create Page**
   - Go to `/admin/users/new`
   - Fill in some fields
   - Click "Cancel"
   - [ ] Redirects to `/admin/users`
   - [ ] No new user created

2. **From Edit Page**
   - Go to edit any user
   - Change some fields
   - Click "Cancel"
   - [ ] Redirects to user profile page
   - [ ] Changes not saved

---

## **3. Package Dashboard**

### Test 3.1: Access Package Dashboard

**Objective**: Test navigation to package dashboard

1. **Navigate to Tours Page**
   - From admin dashboard, click "Tours"
   - Or go to `http://localhost:3000/admin/tours`

2. **Verify Dashboard Link**
   - [ ] Each tour row has "Dashboard" button (purple color)
   - [ ] Also has "Edit" and "Delete" buttons

3. **Click Dashboard**
   - Click "Dashboard" on any tour
   - Should redirect to `/admin/tours/[tourId]/dashboard`

---

### Test 3.2: Verify Package Dashboard Content

**Objective**: Test all sections of package dashboard

1. **Verify Header**
   - [ ] Tour title displayed prominently
   - [ ] "Package Dashboard" subtitle
   - [ ] "Back to Tours" link works

2. **Verify Package Details Section**
   - [ ] Tour description displayed
   - [ ] Tour price displayed (formatted as CA$X,XXX)

3. **Verify Statistics Cards**
   - [ ] Total Bookings count
   - [ ] Total Revenue (sum of all booking amounts)
   - [ ] Total Applications count
   - [ ] Application status breakdown:
     - Pending
     - Submitted
     - Under Review
     - Accepted
     - Rejected
     - Needs Revision

4. **Verify Bookings List**
   - [ ] Section title: "All Bookings (X)" where X = count
   - [ ] If no bookings: "No bookings for this package yet"

5. **For Each Booking Card** (if bookings exist):

   **Booking Header:**
   - [ ] Customer name displayed
   - [ ] Customer email displayed
   - [ ] Booking date displayed
   - [ ] Total amount displayed (CA$X,XXX)
   - [ ] Payment status badge (green = paid, yellow = pending)
   - [ ] "View Full Booking →" link works

   **Applications Section:**
   - [ ] Shows "Applications (X)" count
   - [ ] Grid layout for application cards
   - [ ] Each application card shows:
     - Type ("User Application" or "Dependant: [name]")
     - Status badge (color-coded)
     - Rejection reason (if rejected/needs_revision)
     - "View Application" button
     - Button links to correct application page

---

### Test 3.3: Package Dashboard with Different Data States

**Objective**: Test edge cases

1. **Tour with No Bookings**
   - Create a new tour (or find one with no bookings)
   - Go to its dashboard
   - [ ] Stats show all zeros
   - [ ] "No bookings for this package yet" message displayed

2. **Tour with Multiple Bookings**
   - Find a tour with 2+ bookings
   - [ ] All bookings listed
   - [ ] Stats correctly calculated
   - [ ] All applications visible

3. **Tour with Various Application Statuses**
   - Find/create a tour with applications in different statuses
   - [ ] Each status badge shows correct color:
     - pending = yellow
     - submitted = blue
     - under_review = orange
     - accepted = green
     - needs_revision = purple
     - rejected = red

---

## **4. Enhanced Booking Details**

### Test 4.1: Application Management Section

**Objective**: Test the new section in booking detail page

1. **Navigate to Booking Detail**
   - Go to `/admin/bookings`
   - Click on any booking with applications
   - Or go directly to `/admin/bookings/[id]`

2. **Locate Application Management Section**
   - Scroll down to find "Application Management" section
   - Should be after booking details and before actions

3. **Verify Primary User Application**
   - [ ] Shows "Primary User Application"
   - [ ] User's name displayed
   - [ ] Status badge (color-coded)
   - [ ] If rejected/needs_revision: Rejection reason displayed
   - [ ] "Review Application" button
   - [ ] Button links to `/admin/applications/user/[bookingId]`

4. **Verify Dependant Applications**
   - [ ] Section title: "Dependant Applications (X)"
   - [ ] If no dependants: "No dependant applications"
   - [ ] For each dependant:
     - Dependant name displayed
     - Status badge (color-coded)
     - Rejection reason (if applicable)
     - "Review Application" button
     - Button links to `/admin/applications/dependant/[dependantId]`

---

### Test 4.2: Navigate from Booking to Applications

**Objective**: Test workflow navigation

1. **From Booking Detail Page**
   - Click "Review Application" for user application
   - [ ] Redirects to user application review page
   - [ ] Application data loads correctly
   - [ ] Can change status from here

2. **Back to Booking**
   - Use "Back to Booking" link (if available) or browser back
   - Click "Review Application" for a dependant
   - [ ] Redirects to dependant application review page
   - [ ] Correct dependant data loads

---

## **5. Email Notifications**

### Test 5.1: Application Needs Revision Email

**Objective**: Verify email content and functionality

1. **Trigger Revision Email**
   - Follow Test 1.1 to request revision on an application

2. **Check Email Inbox**
   - Open the customer's email inbox
   - Find email with subject: "Action Required: Your Visa Application Needs Revision"

3. **Verify Email Content**
   - [ ] Customer name personalized
   - [ ] Tour title mentioned
   - [ ] Application type mentioned (User or Dependant: [name])
   - [ ] Revision notes clearly displayed
   - [ ] "Edit Your Application" button/link present
   - [ ] Link is correct format

4. **Click Email Link**
   - Click the "Edit Your Application" link
   - [ ] Redirects to correct application edit page
   - [ ] User can edit and resubmit
   - [ ] Status changes to "submitted" after resubmit

---

### Test 5.2: Application Rejected Email

**Objective**: Verify rejection email

1. **Trigger Rejection Email**
   - Follow Test 1.2 to reject an application

2. **Check Email Inbox**
   - Find email with subject: "Visa Application Update - Application Rejected"

3. **Verify Email Content**
   - [ ] Customer name personalized
   - [ ] Tour title mentioned
   - [ ] Application type mentioned
   - [ ] Rejection reason clearly displayed
   - [ ] Contact information included
   - [ ] Supportive/professional tone

---

## **6. Integration Tests**

### Test 6.1: Complete User Journey

**Objective**: Test full workflow from user creation to application review

1. **Create User**
   - Admin creates new user: `journey@test.com` / `password123`

2. **User Books Tour**
   - Login as `journey@test.com`
   - Book a tour, complete payment

3. **User Submits Application**
   - Fill and submit user application

4. **Admin Reviews from Package Dashboard**
   - Login as admin
   - Go to tours → click Dashboard on booked tour
   - Find the booking in list
   - Click "View Application" from package dashboard

5. **Admin Requests Revision**
   - Request revision with notes
   - Check email sent

6. **User Edits and Resubmits**
   - Login as user
   - Go to booking, click edit application
   - Make changes, resubmit

7. **Admin Accepts**
   - Login as admin
   - Go to user profile (`/admin/users/[userId]`)
   - Verify application shows in list
   - Click "View" on application
   - Accept application
   - [ ] Status updates throughout all pages

---

### Test 6.2: User Management Integration

**Objective**: Test user management across different pages

1. **Create User from Admin**
   - Create user: `integrate@test.com`

2. **View in Users List**
   - [ ] New user appears in list
   - [ ] Correct stats updated

3. **Edit User**
   - Edit user details from users page
   - [ ] Changes persist

4. **User Creates Booking**
   - Login as `integrate@test.com`
   - Create a booking

5. **View User Profile**
   - Login as admin
   - View user profile
   - [ ] Booking appears in profile
   - [ ] Stats updated (Total Bookings = 1)

6. **Delete User** (Optional - destructive test)
   - Try to delete user with bookings
   - [ ] Should either prevent deletion or ask for confirmation

---

## **7. Error Handling Tests**

### Test 7.1: Validation Errors

1. **Create User - Missing Required Fields**
   - Try to create user without email
   - [ ] Error message displayed
   - [ ] Form not submitted

2. **Create User - Duplicate Email**
   - Try to create user with existing email
   - [ ] Error message: "Email already exists" or similar
   - [ ] User not created

3. **Update Status - Missing Reason**
   - Try to reject application without entering reason
   - [ ] Error message: "Reason is required"
   - [ ] Status not updated

---

### Test 7.2: Authorization Tests

1. **Non-Admin Access**
   - Login as regular user
   - Try to access `/admin/users`
   - [ ] Redirected to login or unauthorized page

2. **Not Logged In**
   - Logout completely
   - Try to access any admin page
   - [ ] Redirected to login

---

## **8. UI/UX Tests**

### Test 8.1: Responsive Design

1. **Mobile View**
   - Resize browser to mobile size (375px width)
   - [ ] Users table readable
   - [ ] Package dashboard cards stack properly
   - [ ] Forms usable on mobile

2. **Tablet View**
   - Resize to tablet size (768px width)
   - [ ] Layouts adjust properly
   - [ ] Navigation works

---

### Test 8.2: Color Coding and Badges

**Verify all status badges have correct colors:**

- [ ] pending = yellow (bg-yellow-100 text-yellow-800)
- [ ] submitted = blue (bg-blue-100 text-blue-800)
- [ ] under_review = orange/yellow
- [ ] accepted = green (bg-green-100 text-green-800)
- [ ] needs_revision = purple (bg-purple-100 text-purple-800)
- [ ] rejected = red (bg-red-100 text-red-800)
- [ ] admin role = purple (bg-purple-100 text-purple-800)
- [ ] user role = blue (bg-blue-100 text-blue-800)
- [ ] paid = green (bg-green-100 text-green-800)
- [ ] pending payment = yellow (bg-yellow-100 text-yellow-800)

---

## **9. Performance Tests**

### Test 9.1: Large Data Sets

1. **Many Users**
   - If you have 50+ users, check users page loads quickly
   - [ ] Pagination or reasonable load time

2. **Many Bookings**
   - Tour with 20+ bookings
   - [ ] Package dashboard loads in < 3 seconds
   - [ ] All applications render

---

## ✅ Final Checklist

After completing all tests above:

- [ ] All user management features work (create, view, edit)
- [ ] Package dashboard displays correctly
- [ ] Application revision system works with emails
- [ ] Application rejection system works with emails
- [ ] All navigation links work
- [ ] All action buttons work
- [ ] Status badges show correct colors
- [ ] Forms validate properly
- [ ] Emails send correctly with proper content
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Responsive design works on mobile/tablet
- [ ] Authorization prevents unauthorized access

---

## 🐛 Bug Tracking

Use this section to note any issues found during testing:

| # | Feature | Issue Description | Severity | Status |
|---|---------|-------------------|----------|--------|
| 1 |         |                   | High/Med/Low | Open/Fixed |
| 2 |         |                   | High/Med/Low | Open/Fixed |
| 3 |         |                   | High/Med/Low | Open/Fixed |

---

## 📝 Notes

- **Email Testing**: If using Gmail SMTP, make sure to check spam folder if emails don't arrive
- **Database**: Consider backing up database before destructive tests (delete user, etc.)
- **Seeding**: Run `npm run seed` to reset test data if needed
- **Browser Console**: Keep browser console open to catch any JavaScript errors
- **Network Tab**: Use browser network tab to debug API calls if issues occur

---

**End of Testing Guide**

> Happy Testing! 🚀
