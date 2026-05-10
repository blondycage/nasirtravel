import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';

// Load test env — override: true ensures this wins over any shell env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.test.local'), override: true });

const uri = process.env.MONGODB_URI || '';
if (!uri.includes('naasirtravel_test')) {
  console.error('❌ Safety check failed: MONGODB_URI must target naasirtravel_test database.');
  console.error('   Current URI:', uri);
  process.exit(1);
}

// ── Schemas (inline to avoid Next.js model caching issues) ─────────────────
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, default: 'user' },
  referralCode: { type: String, unique: true, sparse: true },
  referralBalance: { type: Number, default: 0 },
}, { timestamps: true });

const TourSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true, sparse: true },
  category: String,
  packageType: { type: String, enum: ['umrah', 'standard'], default: 'standard' },
  image: String,
  departure: String,
  accommodation: String,
  dates: String,
  price: String,
  isComing: { type: Boolean, default: false },
  description: String,
  itinerary: [{ day: Number, title: String, description: String }],
  gallery: [String],
  inclusions: [String],
  exclusions: [String],
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  referralRewardType: { type: String, enum: ['none', 'fixed', 'percentage'], default: 'none' },
  referralRewardValue: { type: Number, default: 0 },
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  packageType: { type: String, enum: ['umrah', 'standard'] },
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
  referralCode: String,
  referral: { type: mongoose.Schema.Types.ObjectId, ref: 'Referral' },
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: Number,
  comment: String,
  status: { type: String, default: 'approved' },
}, { timestamps: true });

const ReferralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referred: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', unique: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  referralCode: String,
  rewardType: { type: String, enum: ['fixed', 'percentage'] },
  rewardValue: Number,
  rewardAmount: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'paid', 'cancelled'], default: 'pending' },
  statusHistory: [{
    _id: false,
    from: String,
    to: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    note: String,
  }],
  paidAt: Date,
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const User     = mongoose.models.User     || mongoose.model('User', UserSchema);
const Tour     = mongoose.models.Tour     || mongoose.model('Tour', TourSchema);
const Booking  = mongoose.models.Booking  || mongoose.model('Booking', BookingSchema);
const Review   = mongoose.models.Review   || mongoose.model('Review', ReviewSchema);
const Referral = mongoose.models.Referral || mongoose.model('Referral', ReferralSchema);

// ── Helpers ─────────────────────────────────────────────────────────────────
function mockPaymentIntent() {
  return 'pi_test_' + Math.random().toString(36).substring(2, 12);
}

async function seed() {
  console.log('\n🌱 Naasir Travel — Test DB Seed');
  console.log('📦 Target:', uri.replace(/\/\/.*@/, '//***@'));

  await mongoose.connect(uri);
  console.log('✅ Connected to naasirtravel_test\n');

  // ── Wipe ──────────────────────────────────────────────────────────────────
  console.log('🗑️  Clearing test data...');
  await Promise.all([
    User.deleteMany({}),
    Tour.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Referral.deleteMany({}),
  ]);

  // ── Users ─────────────────────────────────────────────────────────────────
  console.log('👥 Creating users...');
  const pw = await bcrypt.hash('password123', 10);

  const admin = await User.create({
    name: 'Naasir Admin',
    email: 'admin@naasirtravel.com',
    password: pw,
    phone: '+1-604-555-0100',
    role: 'admin',
  });

  const [john, sarah, ahmed, fatima, omar] = await User.insertMany([
    {
      name: 'John Doe',
      email: 'john@example.com',
      password: pw,
      phone: '+1-604-555-0101',
      role: 'user',
      referralCode: 'NAAS-JOHAB1C2',
      referralBalance: 150,
    },
    {
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      password: pw,
      phone: '+1-604-555-0102',
      role: 'user',
      referralCode: 'NAAS-SARXK9M3',
    },
    {
      name: 'Ahmed Hassan',
      email: 'ahmed@example.com',
      password: pw,
      phone: '+1-604-555-0103',
      role: 'user',
      referralCode: 'NAAS-AHMPQ4R5',
    },
    {
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      password: pw,
      phone: '+1-604-555-0104',
      role: 'user',
      referralCode: 'NAAS-FATYZ6S7',
    },
    {
      name: 'Omar Khalid',
      email: 'omar@example.com',
      password: pw,
      phone: '+1-778-555-0105',
      role: 'user',
    },
  ]);

  console.log(`   ✓ 6 users (1 admin + 5 regular)\n`);

  // ── Tours ─────────────────────────────────────────────────────────────────
  console.log('🌍 Creating tours...');
  const [
    pkgA, pkgB, pkgLandFull, pkgLandOnly,
    uzbekistan, morocco, turkeyGreece, summerUmrah, egypt, canada,
  ] = await Tour.insertMany([
    {
      title: 'Winter Break Istanbul & Umrah Package A',
      slug: 'winter-istanbul-umrah-a',
      category: 'Hajj / Umrah',
      packageType: 'umrah',
      image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
      departure: 'Vancouver',
      accommodation: '4 Star Accommodations',
      dates: 'December 18 – January 1',
      price: '4585',
      status: 'published',
      referralRewardType: 'fixed',
      referralRewardValue: 150,
      description: 'Experience Umrah combined with the beauty of Istanbul. Guided tours, comfortable accommodation, and all arrangements for a memorable pilgrimage.',
      itinerary: [
        { day: 1, title: 'Departure & Arrival Istanbul', description: 'Depart Vancouver, arrive Istanbul. Transfer to hotel and rest.' },
        { day: 2, title: 'Istanbul City Tour', description: 'Visit Blue Mosque, Hagia Sophia, and Grand Bazaar.' },
        { day: 3, title: 'Travel to Mecca', description: 'Fly to Jeddah, transfer to Mecca hotel.' },
        { day: 4, title: 'Umrah Rituals', description: 'Perform Umrah with guided assistance.' },
        { day: 5, title: 'Medina Visit', description: 'Travel to Medina. Masjid al-Nabawi visit.' },
      ],
      inclusions: ['Round-trip flights', 'Hotel accommodation', 'Daily breakfast', 'Guided tours', 'Visa assistance'],
      exclusions: ['Personal expenses', 'Travel insurance', 'Optional activities'],
      gallery: [
        'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
        'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80',
      ],
    },
    {
      title: 'Winter Break Istanbul & Umrah Package B',
      slug: 'winter-istanbul-umrah-b',
      category: 'Hajj / Umrah',
      packageType: 'umrah',
      image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80',
      departure: 'Vancouver',
      accommodation: '4 Star Accommodations',
      dates: 'December 18 – January 1',
      price: '4275',
      status: 'published',
      referralRewardType: 'fixed',
      referralRewardValue: 100,
      description: 'Affordable Umrah package with Istanbul stopover. Perfect for families seeking spiritual journey with cultural exploration.',
      inclusions: ['Flights', 'Accommodation', 'Breakfast', 'Transfers'],
      exclusions: ['Lunch & Dinner', 'Personal shopping'],
    },
    {
      title: 'Winter Break Istanbul & Umrah Land Only Package',
      slug: 'winter-istanbul-umrah-land',
      category: 'Hajj / Umrah',
      packageType: 'umrah',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
      accommodation: '4 Star Accommodations',
      dates: 'December 18 – January 1',
      price: '2350',
      status: 'published',
      referralRewardType: 'percentage',
      referralRewardValue: 5,
      description: 'Land-only package for those arranging their own flights. Includes all ground services.',
      inclusions: ['Hotel accommodation', 'Ground transportation', 'Guided tours', 'Breakfast'],
      exclusions: ['Flights', 'Visa fees', 'Travel insurance'],
    },
    {
      title: 'Winter Break Umrah Land Only Package',
      slug: 'winter-umrah-land-only',
      category: 'Hajj / Umrah',
      packageType: 'umrah',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      accommodation: '4 Star Accommodations',
      dates: 'December 22 – January 1',
      price: '1550',
      status: 'published',
      description: 'Budget-friendly Umrah land package. Accommodation, breakfast, and local transport included.',
      inclusions: ['Accommodation', 'Breakfast', 'Local transport'],
      exclusions: ['Flights', 'Lunch & Dinner'],
    },
    {
      title: 'Explore Uzbekistan: The Land of Imam Bukhari',
      slug: 'uzbekistan-imam-bukhari',
      category: 'Asia',
      packageType: 'standard',
      image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
      accommodation: '5 Star Hotels',
      dates: 'March 15 – March 25, 2026',
      price: '3200',
      status: 'published',
      referralRewardType: 'fixed',
      referralRewardValue: 200,
      description: 'Journey through Silk Road cities. Visit Samarkand, Bukhara, and pay respects at the tomb of Imam Bukhari.',
      itinerary: [
        { day: 1, title: 'Arrive in Tashkent', description: 'Welcome to Uzbekistan! City orientation tour.' },
        { day: 2, title: 'Tashkent to Samarkand', description: 'High-speed train. Visit Registan Square.' },
        { day: 3, title: 'Samarkand Exploration', description: 'Full day of historical sites.' },
        { day: 4, title: 'Travel to Bukhara', description: 'Journey to ancient Bukhara.' },
        { day: 5, title: 'Imam Bukhari Mausoleum', description: 'Visit the mausoleum and surrounding complex.' },
      ],
      inclusions: ['Flights', 'Hotels', 'All meals', 'Guided tours', 'Train tickets', 'Entrance fees'],
      exclusions: ['Personal expenses', 'Tips'],
    },
    {
      title: 'Morocco Desert & Imperial Cities',
      slug: 'morocco-desert-imperial',
      category: 'Africa',
      packageType: 'standard',
      image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80',
      accommodation: '4 Star Riads',
      dates: 'April 10 – April 20, 2026',
      price: '2800',
      status: 'published',
      description: 'Casablanca to the Sahara. Imperial cities, desert camps, and the magic of Marrakech.',
      itinerary: [
        { day: 1, title: 'Arrive Casablanca', description: 'Transfer to Rabat for city tour.' },
        { day: 2, title: 'Fes Exploration', description: 'Discover the ancient medina of Fes.' },
        { day: 3, title: 'Sahara Desert', description: 'Camel trek and overnight in desert camp.' },
        { day: 4, title: 'Marrakech', description: 'Explore the red city of Marrakech.' },
      ],
      inclusions: ['Accommodation', 'Daily breakfast', 'Desert camp', 'Camel ride', 'Guided tours'],
      exclusions: ['International flights', 'Lunch & Dinner'],
    },
    {
      title: 'Turkey & Greece Classical Tour',
      slug: 'turkey-greece-classical',
      category: 'Europe',
      packageType: 'standard',
      image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
      accommodation: '4 Star Hotels',
      dates: 'May 5 – May 18, 2026',
      price: '3950',
      status: 'published',
      referralRewardType: 'percentage',
      referralRewardValue: 3,
      description: 'Ancient civilizations across Turkey and Greece. Istanbul to Athens, history come alive.',
      itinerary: [
        { day: 1, title: 'Istanbul Arrival', description: 'Welcome to Turkey. Evening Bosphorus cruise.' },
        { day: 2, title: 'Istanbul Highlights', description: 'Full day historical tour.' },
        { day: 3, title: 'Cappadocia', description: 'Hot air balloon ride and cave churches.' },
        { day: 4, title: 'Athens, Greece', description: 'Ferry to Greece. Acropolis visit.' },
      ],
      inclusions: ['Flights', 'Hotels', 'Breakfast', 'Ferry tickets', 'All entrance fees'],
      exclusions: ['Travel insurance', 'Optional tours'],
    },
    {
      title: 'Summer Umrah Express',
      slug: 'summer-umrah-express',
      category: 'Hajj / Umrah',
      packageType: 'umrah',
      image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
      accommodation: '3 Star Hotels',
      dates: 'June 15 – June 25, 2026',
      price: '2100',
      status: 'published',
      description: '10-day Umrah package. Mecca and Medina with comfortable accommodation.',
      inclusions: ['Round-trip flights', 'Hotels', 'Breakfast', 'Ziyarat tours'],
      exclusions: ['Lunch & Dinner', 'Personal expenses'],
    },
    {
      title: 'Egypt: Pharaohs & Nile Cruise',
      slug: 'egypt-pharaohs-nile',
      category: 'Africa',
      packageType: 'standard',
      image: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80',
      accommodation: '5 Star Nile Cruise + Hotel',
      dates: 'July 1 – July 12, 2026',
      price: '3400',
      status: 'draft',
      description: 'Cairo, Luxor, Aswan, and a 4-night Nile cruise. Pyramids, temples, and timeless wonders.',
      inclusions: ['Flights', 'Nile cruise cabin', 'Hotels', 'All meals on cruise', 'Guided tours', 'Entrance fees'],
      exclusions: ['Visa fee', 'Travel insurance', 'Personal shopping'],
    },
    {
      title: 'Canada Rockies Summer Adventure',
      slug: 'canada-rockies-summer',
      category: 'North America',
      packageType: 'standard',
      image: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=800&q=80',
      accommodation: 'Mountain Lodges',
      dates: 'August 5 – August 12, 2026',
      price: '1800',
      status: 'published',
      isComing: false,
      description: 'Banff, Jasper, and Lake Louise. Rocky Mountain wilderness at its finest.',
      inclusions: ['Accommodation', 'Breakfast', 'Park passes', 'Guided hikes'],
      exclusions: ['Flights', 'Lunch & Dinner', 'Optional activities'],
    },
  ]);

  console.log(`   ✓ 10 tours (8 published, 1 draft, 1 published)\n`);

  // ── Bookings ──────────────────────────────────────────────────────────────
  console.log('📋 Creating bookings...');
  const bookings = await Booking.insertMany([
    {
      tour: pkgA._id,
      user: john._id,
      packageType: 'umrah',
      customerName: john.name,
      customerEmail: john.email,
      customerPhone: john.phone,
      numberOfTravelers: 2,
      totalAmount: 917000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-12-18'),
      paymentIntentId: mockPaymentIntent(),
    },
    {
      tour: pkgB._id,
      user: sarah._id,
      packageType: 'umrah',
      customerName: sarah.name,
      customerEmail: sarah.email,
      customerPhone: sarah.phone,
      numberOfTravelers: 4,
      totalAmount: 1710000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2025-12-18'),
      paymentIntentId: mockPaymentIntent(),
      specialRequests: 'Need wheelchair accessible room',
      referralCode: john.referralCode,
    },
    {
      tour: uzbekistan._id,
      user: ahmed._id,
      packageType: 'standard',
      customerName: ahmed.name,
      customerEmail: ahmed.email,
      customerPhone: ahmed.phone,
      numberOfTravelers: 1,
      totalAmount: 320000,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      bookingDate: new Date('2026-03-15'),
    },
    {
      tour: morocco._id,
      user: fatima._id,
      packageType: 'standard',
      customerName: fatima.name,
      customerEmail: fatima.email,
      customerPhone: fatima.phone,
      numberOfTravelers: 3,
      totalAmount: 840000,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingDate: new Date('2026-04-10'),
      paymentIntentId: mockPaymentIntent(),
      referralCode: sarah.referralCode,
    },
    {
      tour: summerUmrah._id,
      user: omar._id,
      packageType: 'umrah',
      customerName: omar.name,
      customerEmail: omar.email,
      customerPhone: omar.phone,
      numberOfTravelers: 2,
      totalAmount: 420000,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
      bookingDate: new Date('2026-06-15'),
      specialRequests: 'Prefer rooms on lower floors',
    },
    {
      tour: turkeyGreece._id,
      user: john._id,
      packageType: 'standard',
      customerName: john.name,
      customerEmail: john.email,
      customerPhone: john.phone,
      numberOfTravelers: 2,
      totalAmount: 790000,
      paymentStatus: 'paid',
      bookingStatus: 'cancelled',
      bookingDate: new Date('2026-05-05'),
      paymentIntentId: mockPaymentIntent(),
    },
  ]);

  console.log(`   ✓ ${bookings.length} bookings\n`);

  // ── Referrals ─────────────────────────────────────────────────────────────
  console.log('🎁 Creating referrals...');
  // booking[1]: sarah used john's code to book pkgB (fixed $100 reward)
  const ref1 = await Referral.create({
    referrer: john._id,
    referred: sarah._id,
    booking: bookings[1]._id,
    tour: pkgB._id,
    referralCode: john.referralCode,
    rewardType: 'fixed',
    rewardValue: 100,
    rewardAmount: 100,
    status: 'confirmed',
    statusHistory: [
      { from: 'pending', to: 'confirmed', note: 'Auto-confirmed on booking payment', changedAt: new Date('2025-12-18') },
    ],
  });
  await Booking.findByIdAndUpdate(bookings[1]._id, { referral: ref1._id });

  // booking[3]: fatima used sarah's code to book morocco (no reward configured = skip reward)
  const ref2 = await Referral.create({
    referrer: sarah._id,
    referred: fatima._id,
    booking: bookings[3]._id,
    tour: morocco._id,
    referralCode: sarah.referralCode,
    rewardType: 'fixed',
    rewardValue: 0,
    rewardAmount: 0,
    status: 'pending',
    statusHistory: [],
  });
  await Booking.findByIdAndUpdate(bookings[3]._id, { referral: ref2._id });

  console.log(`   ✓ 2 referrals (1 confirmed, 1 pending)\n`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  console.log('⭐ Creating reviews...');
  await Review.insertMany([
    {
      tour: pkgA._id,
      user: john._id,
      userName: john.name,
      rating: 5,
      comment: 'Absolutely amazing experience! Perfect organisation and knowledgeable guide. Highly recommend Naasir Travel for Umrah.',
      status: 'approved',
    },
    {
      tour: pkgA._id,
      user: sarah._id,
      userName: sarah.name,
      rating: 5,
      comment: 'Best Umrah package we have ever booked. The Istanbul stopover was a beautiful addition.',
      status: 'approved',
    },
    {
      tour: pkgB._id,
      user: ahmed._id,
      userName: ahmed.name,
      rating: 4,
      comment: 'Great value for money. Hotels were comfortable and staff very helpful. Would book again!',
      status: 'approved',
    },
    {
      tour: uzbekistan._id,
      user: fatima._id,
      userName: fatima.name,
      rating: 5,
      comment: 'Uzbekistan was breathtaking! The Imam Bukhari mausoleum was deeply moving. This trip changed me.',
      status: 'approved',
    },
    {
      tour: morocco._id,
      user: john._id,
      userName: john.name,
      rating: 5,
      comment: 'Morocco exceeded all expectations. The desert camp was magical. Thank you Naasir Travel!',
      status: 'approved',
    },
    {
      tour: turkeyGreece._id,
      user: sarah._id,
      userName: sarah.name,
      rating: 4,
      comment: 'Wonderful tour covering so much history. Turkey and Greece in one trip is perfect.',
      status: 'approved',
    },
    {
      tour: summerUmrah._id,
      user: omar._id,
      userName: omar.name,
      rating: 5,
      comment: 'Short but impactful Umrah trip. Well organised, great value.',
      status: 'pending',
    },
  ]);

  console.log(`   ✓ 7 reviews (6 approved, 1 pending)\n`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('━'.repeat(50));
  console.log('🎉 Test DB seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('   Users    : 6  (1 admin, 5 regular)');
  console.log('   Tours    : 10 (8 published, 1 draft)');
  console.log('   Bookings : 6  (2 paid+confirmed, 1 paid+cancelled, 2 pending, 1 pending)');
  console.log('   Referrals: 2  (1 confirmed, 1 pending)');
  console.log('   Reviews  : 7  (6 approved, 1 pending)\n');
  console.log('🔐 Credentials (all use password123):');
  console.log('   admin@naasirtravel.com  — Admin');
  console.log('   john@example.com        — has referral code NAAS-JOHAB1C2, balance $150');
  console.log('   sarah@example.com       — has referral code NAAS-SARXK9M3');
  console.log('   ahmed@example.com       — has referral code NAAS-AHMPQ4R5');
  console.log('   fatima@example.com      — has referral code NAAS-FATYZ6S7');
  console.log('   omar@example.com        — no referral code yet\n');
  console.log('🗄️  Database: naasirtravel_test (isolated from production)\n');
}

seed()
  .catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); })
  .finally(async () => { await mongoose.disconnect(); process.exit(0); });
