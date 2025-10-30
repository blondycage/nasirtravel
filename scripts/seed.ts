import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hashPassword } from '../lib/utils/auth';

// Try .env.local first, fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// Define schemas inline to avoid import issues
const TourSchema = new mongoose.Schema({
  title: String,
  category: String,
  image: String,
  departure: String,
  accommodation: String,
  dates: String,
  price: String,
  isComing: Boolean,
  description: String,
  itinerary: [{
    day: Number,
    title: String,
    description: String,
  }],
  gallery: [String],
  inclusions: [String],
  exclusions: [String],
  status: { type: String, default: 'published' },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: { type: String, default: 'user' },
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
  tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  rating: Number,
  comment: String,
  status: { type: String, default: 'approved' },
}, { timestamps: true });

const Tour = mongoose.models.Tour || mongoose.model('Tour', TourSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    const hashedPassword = await hashPassword('password123');

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@naasirtravel.com',
      password: hashedPassword,
      phone: '+1-555-0100',
      role: 'admin',
    });

    const users = await User.insertMany([
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '+1-555-0101',
        role: 'user',
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@example.com',
        password: hashedPassword,
        phone: '+1-555-0102',
        role: 'user',
      },
      {
        name: 'Ahmed Hassan',
        email: 'ahmed@example.com',
        password: hashedPassword,
        phone: '+1-555-0103',
        role: 'user',
      },
      {
        name: 'Fatima Ali',
        email: 'fatima@example.com',
        password: hashedPassword,
        phone: '+1-555-0104',
        role: 'user',
      },
    ]);

    console.log(`✅ Created ${users.length + 1} users (including admin)`);

    // Create Tours
    console.log('🌍 Creating tours...');
    const tours = await Tour.insertMany([
      {
        title: 'Winter Break Istanbul & Umrah Package A',
        category: 'Hajj / Umrah',
        image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
        departure: 'Vancouver',
        accommodation: '4 Star Accommodations',
        dates: 'December 18 - January 1 (Tentative)',
        price: '4585',
        status: 'published',
        description: 'Experience the spiritual journey of Umrah combined with the beauty of Istanbul. This package includes guided tours, comfortable accommodation, and all necessary arrangements for a memorable pilgrimage.',
        itinerary: [
          { day: 1, title: 'Departure & Arrival Istanbul', description: 'Depart from Vancouver and arrive in Istanbul. Transfer to hotel and rest.' },
          { day: 2, title: 'Istanbul City Tour', description: 'Visit Blue Mosque, Hagia Sophia, and Grand Bazaar.' },
          { day: 3, title: 'Travel to Mecca', description: 'Flight to Jeddah and transfer to Mecca hotel.' },
          { day: 4, title: 'Umrah Rituals', description: 'Perform Umrah with guided assistance.' },
          { day: 5, title: 'Mecca & Medina', description: 'Continue spiritual journey and travel to Medina.' },
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
        category: 'Hajj / Umrah',
        image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80',
        departure: 'Vancouver',
        accommodation: '4 Star Accommodations',
        dates: 'December 18 - January 1 (Tentative)',
        price: '4275',
        status: 'published',
        description: 'Affordable Umrah package with Istanbul stopover. Perfect for families and groups seeking a spiritual journey with cultural exploration.',
        itinerary: [
          { day: 1, title: 'Departure to Istanbul', description: 'Fly from Vancouver to Istanbul.' },
          { day: 2, title: 'Istanbul Exploration', description: 'Half-day city tour.' },
          { day: 3, title: 'Arrive in Mecca', description: 'Transfer to Mecca for Umrah rituals.' },
        ],
        inclusions: ['Flights', 'Accommodation', 'Breakfast', 'Transfers'],
        exclusions: ['Lunch & Dinner', 'Personal shopping'],
      },
      {
        title: 'Winter Break Istanbul & Umrah Land Only Package',
        category: 'Hajj / Umrah',
        image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
        accommodation: '4 Star Accommodations',
        dates: 'December 18 - January 1 (Tentative)',
        price: '2350',
        status: 'published',
        description: 'Land-only package for those arranging their own flights. Includes all ground services and accommodation.',
        inclusions: ['Hotel accommodation', 'Ground transportation', 'Guided tours', 'Breakfast'],
        exclusions: ['Flights', 'Visa fees', 'Travel insurance'],
      },
      {
        title: 'Winter Break Umrah Land Only Package',
        category: 'Hajj / Umrah',
        image: '/kba.jpg',
        accommodation: '4 Star Accommodations',
        dates: 'December 22 - January 1 (Tentative)',
        price: '1550',
        status: 'published',
        description: 'Budget-friendly Umrah land package. Perfect for those seeking affordable pilgrimage options.',
        inclusions: ['Accommodation', 'Breakfast', 'Local transport'],
        exclusions: ['Flights', 'Lunch & Dinner'],
      },
      {
        title: 'Explore Uzbekistan: The Land of Imam Bukhari',
        category: 'Asia',
        image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
        accommodation: '5 Star Hotels',
        dates: 'March 15 - March 25, 2025',
        price: '3200',
        status: 'published',
        description: 'Journey through the historic Silk Road cities of Uzbekistan. Visit Samarkand, Bukhara, and pay respects at the tomb of Imam Bukhari.',
        itinerary: [
          { day: 1, title: 'Arrive in Tashkent', description: 'Welcome to Uzbekistan! City orientation tour.' },
          { day: 2, title: 'Tashkent to Samarkand', description: 'High-speed train to Samarkand. Visit Registan Square.' },
          { day: 3, title: 'Samarkand Exploration', description: 'Full day tour of historical sites.' },
          { day: 4, title: 'Travel to Bukhara', description: 'Journey to the ancient city of Bukhara.' },
          { day: 5, title: 'Bukhara Heritage', description: 'Explore UNESCO World Heritage sites.' },
        ],
        inclusions: ['Flights', 'Hotels', 'All meals', 'Guided tours', 'Train tickets', 'Entrance fees'],
        exclusions: ['Personal expenses', 'Tips'],
        gallery: [
          'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
        ],
      },
      {
        title: 'Morocco Desert & Imperial Cities',
        category: 'Africa',
        image: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80',
        accommodation: '4 Star Riads',
        dates: 'April 10 - April 20, 2025',
        price: '2800',
        status: 'published',
        description: 'Experience the magic of Morocco from Casablanca to the Sahara Desert. Visit imperial cities and sleep under the stars in the desert.',
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
        category: 'Europe',
        image: 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
        accommodation: '4 Star Hotels',
        dates: 'May 5 - May 18, 2025',
        price: '3950',
        status: 'published',
        description: 'Explore ancient civilizations across Turkey and Greece. From Istanbul to Athens, experience history come alive.',
        itinerary: [
          { day: 1, title: 'Istanbul Arrival', description: 'Welcome to Turkey. Evening Bosphorus cruise.' },
          { day: 2, title: 'Istanbul Highlights', description: 'Full day tour of historical sites.' },
          { day: 3, title: 'Cappadocia', description: 'Hot air balloon ride and cave churches.' },
          { day: 4, title: 'Athens, Greece', description: 'Ferry to Greece. Acropolis visit.' },
        ],
        inclusions: ['Flights', 'Hotels', 'Breakfast', 'Ferry tickets', 'All entrance fees'],
        exclusions: ['Travel insurance', 'Optional tours'],
      },
      {
        title: 'Summer Umrah Express',
        category: 'Hajj / Umrah',
        image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
        accommodation: '3 Star Hotels',
        dates: 'June 15 - June 25, 2025',
        price: '2100',
        status: 'published',
        description: 'Quick 10-day Umrah package perfect for summer break. Includes Mecca and Medina with comfortable accommodation.',
        inclusions: ['Round-trip flights', 'Hotels', 'Breakfast', 'Ziyarat tours'],
        exclusions: ['Lunch & Dinner', 'Personal expenses'],
      },
    ]);

    console.log(`✅ Created ${tours.length} tours`);

    // Create Bookings
    console.log('📋 Creating bookings...');
    const bookings = await Booking.insertMany([
      {
        tour: tours[0]._id,
        user: users[0]._id,
        customerName: users[0].name,
        customerEmail: users[0].email,
        customerPhone: users[0].phone,
        numberOfTravelers: 2,
        totalAmount: 917000,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        bookingDate: new Date('2024-12-18'),
        paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
      },
      {
        tour: tours[1]._id,
        user: users[1]._id,
        customerName: users[1].name,
        customerEmail: users[1].email,
        customerPhone: users[1].phone,
        numberOfTravelers: 4,
        totalAmount: 1710000,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        bookingDate: new Date('2024-12-18'),
        paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
        specialRequests: 'Need wheelchair accessible room',
      },
      {
        tour: tours[4]._id,
        user: users[2]._id,
        customerName: users[2].name,
        customerEmail: users[2].email,
        customerPhone: users[2].phone,
        numberOfTravelers: 1,
        totalAmount: 320000,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        bookingDate: new Date('2025-03-15'),
      },
      {
        tour: tours[5]._id,
        user: users[3]._id,
        customerName: users[3].name,
        customerEmail: users[3].email,
        customerPhone: users[3].phone,
        numberOfTravelers: 3,
        totalAmount: 840000,
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        bookingDate: new Date('2025-04-10'),
        paymentIntentId: 'pi_mock_' + Math.random().toString(36).substring(7),
      },
      {
        tour: tours[7]._id,
        user: users[0]._id,
        customerName: users[0].name,
        customerEmail: users[0].email,
        customerPhone: users[0].phone,
        numberOfTravelers: 2,
        totalAmount: 420000,
        paymentStatus: 'pending',
        bookingStatus: 'pending',
        bookingDate: new Date('2025-06-15'),
        specialRequests: 'Prefer rooms on lower floors',
      },
    ]);

    console.log(`✅ Created ${bookings.length} bookings`);

    // Create Reviews
    console.log('⭐ Creating reviews...');
    const reviews = await Review.insertMany([
      {
        tour: tours[0]._id,
        user: users[0]._id,
        userName: users[0].name,
        rating: 5,
        comment: 'Absolutely amazing experience! The organization was perfect and our guide was very knowledgeable. Highly recommend Naasir Travel for Umrah packages.',
        status: 'approved',
      },
      {
        tour: tours[0]._id,
        user: users[1]._id,
        userName: users[1].name,
        rating: 5,
        comment: 'Best Umrah package we have ever booked. The Istanbul stopover was a beautiful addition. Everything was smooth from start to finish.',
        status: 'approved',
      },
      {
        tour: tours[1]._id,
        user: users[2]._id,
        userName: users[2].name,
        rating: 4,
        comment: 'Great value for money. Hotels were comfortable and the staff was very helpful. Would book again!',
        status: 'approved',
      },
      {
        tour: tours[4]._id,
        user: users[3]._id,
        userName: users[3].name,
        rating: 5,
        comment: 'Uzbekistan was breathtaking! The historical sites were incredible and our tour guide was excellent. This is a must-do trip!',
        status: 'approved',
      },
      {
        tour: tours[5]._id,
        user: users[0]._id,
        userName: users[0].name,
        rating: 5,
        comment: 'Morocco exceeded all expectations. The desert camp was magical and the cities were fascinating. Thank you Naasir Travel!',
        status: 'approved',
      },
      {
        tour: tours[6]._id,
        user: users[1]._id,
        userName: users[1].name,
        rating: 4,
        comment: 'Wonderful tour covering so much history. Turkey and Greece in one trip was perfect. A few minor hiccups but overall excellent.',
        status: 'approved',
      },
    ]);

    console.log(`✅ Created ${reviews.length} reviews`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length + 1} (including 1 admin)`);
    console.log(`   Tours: ${tours.length}`);
    console.log(`   Bookings: ${bookings.length}`);
    console.log(`   Reviews: ${reviews.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@naasirtravel.com / password123');
    console.log('   User: john@example.com / password123');
    console.log('   User: sarah@example.com / password123');
    console.log('   User: ahmed@example.com / password123');
    console.log('   User: fatima@example.com / password123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
