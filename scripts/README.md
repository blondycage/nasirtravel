# Seed Scripts

## Main Seed Script
`seed.ts` - Seeds tours, users, bookings, and reviews (full database seed)

## Application Test Seed Script
`seed-application-test.ts` - Seeds comprehensive test data for application system testing

### Usage

```bash
# Run application test seed (clears bookings, users, dependants only - preserves tours)
npm run seed:test

# Or directly with tsx
tsx scripts/seed-application-test.ts
```

### What It Does

1. **Preserves Tours**: Does NOT delete or modify any tours/packages
2. **Clears**: Removes all bookings, users, and dependants
3. **Creates**: Comprehensive test data covering 8 different scenarios:
   - Payment pending bookings
   - Paid bookings with various application states
   - Bookings with dependants
   - Application closed scenarios
   - Rejected applications
   - Multiple dependants

### Test Users Created

- **Admin**: admin@naasirtravel.com / password123
- **User 1**: john@example.com / password123
- **User 2**: sarah@example.com / password123
- **User 3**: ahmed@example.com / password123
- **User 4**: fatima@example.com / password123
- **User 5**: michael@example.com / password123
- **User 6**: aisha@example.com / password123

### Test Scenarios

See `TEST_PLAN.md` for detailed test scenarios and test cases.

### Document Images

All documents use public image URLs from Unsplash/placeholder services (no Cloudinary uploads needed for testing).
