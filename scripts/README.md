# Database Seed Script

## Overview
This script populates your MongoDB database with mock data for testing and development.

## What Gets Created

### Users (5 total)
- **1 Admin Account**
  - Email: `admin@naasirtravel.com`
  - Password: `password123`
  - Role: admin

- **4 User Accounts**
  - `john@example.com` / password123
  - `sarah@example.com` / password123
  - `ahmed@example.com` / password123
  - `fatima@example.com` / password123

### Tours (8 packages)
- 4 Hajj/Umrah packages
- 1 Asia tour (Uzbekistan)
- 1 Africa tour (Morocco)
- 1 Europe tour (Turkey & Greece)
- 1 Express Umrah package

Each tour includes:
- Complete details (title, category, image, dates, pricing)
- Detailed itinerary
- Inclusions/exclusions lists
- Gallery images
- Published status

### Bookings (5 bookings)
- Mix of confirmed and pending bookings
- Different payment statuses (paid/pending)
- Various tour packages
- Different numbers of travelers
- Some with special requests

### Reviews (6 reviews)
- All approved and visible
- Ratings from 4-5 stars
- Detailed comments
- Distributed across different tours

## How to Run

1. Make sure you have MongoDB URI in `.env.local`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/naasirtravel
```

2. Run the seed script:
```bash
npm run seed
```

## Warning

⚠️ **This script will DELETE all existing data** in the following collections:
- tours
- users
- bookings
- reviews

Make sure you're running this on a development/testing database, NOT production!

## After Seeding

You can login with any of the test accounts:

**Admin Dashboard Access:**
- Email: admin@naasirtravel.com
- Password: password123

**User Dashboard Access:**
- Email: john@example.com (or any other user)
- Password: password123

## Customization

To modify the seed data, edit `/scripts/seed.ts` and change the mock data in the insertMany() calls.
