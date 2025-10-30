# Backend Setup Guide

## Overview
Full-stack travel booking system with MongoDB, Stripe payments, Cloudinary image storage, and email notifications.

## Environment Setup

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure your environment variables:

### MongoDB
- Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a cluster and get your connection string
- Replace `MONGODB_URI` in `.env.local`

### Stripe (Sandbox)
- Sign up at [Stripe](https://stripe.com)
- Get your test API keys from Dashboard
- Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Set up webhook endpoint for `/api/payment/webhook`
- Add `STRIPE_WEBHOOK_SECRET`

### Cloudinary
- Sign up at [Cloudinary](https://cloudinary.com)
- Get your cloud name, API key, and API secret from Dashboard
- Add to `.env.local`

### Gmail SMTP
- Enable 2-factor authentication on your Gmail account
- Generate an App Password: Google Account → Security → App Passwords
- Add your email and app password to `.env.local`

## API Endpoints

### Public Routes

**Tours**
- `GET /api/tours` - Get all published tours (filter by category)
- `GET /api/tours/[id]` - Get single tour

**Bookings**
- `POST /api/bookings` - Create booking (sends confirmation email)
- `GET /api/bookings?userId=[id]` - Get user bookings

**Reviews**
- `GET /api/reviews?tourId=[id]` - Get approved reviews
- `POST /api/reviews` - Create review (requires auth)

**Auth**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

**Payment**
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/webhook` - Stripe webhook (handle payment events)

**Upload**
- `POST /api/upload` - Upload image to Cloudinary

### Admin Routes (Require Admin Token)

**Tours**
- `GET /api/admin/tours` - Get all tours (including drafts)
- `POST /api/admin/tours` - Create tour

**Bookings**
- `GET /api/admin/bookings` - Get all bookings

**Users**
- `GET /api/admin/users` - Get all users

**Reviews**
- `GET /api/admin/reviews` - Get all reviews (including pending)

**Stats**
- `GET /api/admin/stats` - Get dashboard statistics

## Database Models

### Tour
- title, category, image, departure, accommodation, dates, price
- description, itinerary, gallery, inclusions, exclusions
- status: draft | published | archived

### User
- name, email, password (hashed), phone
- role: user | admin

### Booking
- tourId, userId, customer details, numberOfTravelers, totalAmount
- paymentStatus: pending | paid | failed | refunded
- bookingStatus: pending | confirmed | cancelled
- paymentIntentId (Stripe)

### Review
- tourId, userId, userName, rating (1-5), comment
- status: pending | approved | rejected

## Features Implemented

✅ Tour Management (CRUD with admin auth)
✅ Booking Engine (with email confirmation)
✅ Stripe Payment Integration (sandbox mode)
✅ Cloudinary Image Upload
✅ User Authentication (JWT)
✅ Admin Dashboard APIs
✅ Reviews & Ratings System
✅ Email Notifications (booking & payment)

## Testing

1. Start development server:
```bash
npm run dev
```

2. Create an admin user:
```bash
# Use POST /api/auth/register with role: "admin" (manually in DB)
```

3. Test Stripe payments:
- Use test card: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC

## Notes

- Schema validation is minimal (as requested)
- Stripe webhook requires HTTPS (use ngrok for local testing)
- Gmail may block less secure apps - use App Passwords
- Remember to add `.env.local` to `.gitignore`
