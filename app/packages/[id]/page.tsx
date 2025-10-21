'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PackageDetail {
  id: number;
  title: string;
  category: string;
  images: string[];
  priceRange: { min: number; max: number };
  dates: string;
  departure?: string;
  airline?: string;
  accommodations: {
    makkah?: string;
    madinah?: string;
    istanbul?: string;
  };
  priceIncludes: string[];
  priceExcludes: string[];
  itinerary: { day: string; description: string }[];
  roomTypes: { type: string; price: number }[];
}

const packageDetails: Record<string, PackageDetail> = {
  '1': {
    id: 1,
    title: 'Winter Break Istanbul & Umrah Package A',
    category: 'Umrah/Hajj',
    images: [
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
    ],
    priceRange: { min: 4585, max: 5135 },
    dates: 'December 18th - January 1st',
    departure: 'Vancouver',
    airline: 'Turkish Airlines',
    accommodations: {
      makkah: 'Anjum Hotel Makkah',
      madinah: 'Jayden Hotel',
      istanbul: 'Premium 4* Hotel',
    },
    priceIncludes: [
      'Roundtrip Airfare',
      'Hotel Accommodations',
      'Ground Transportation',
      'Guided City Tours',
      'Daily Breakfast',
      'Saudi visa processing',
    ],
    priceExcludes: [
      'Lunch & Dinner',
      'Travel Insurance',
      'SIM Card or Mobile Expenses',
      'Personal / Medical Expenses',
      'Any items or services not specifically mentioned in the "Price Includes" section',
    ],
    itinerary: [
      { day: 'December 18 – Departure to Istanbul', description: 'Depart from Vancouver to Istanbul.' },
      { day: 'December 19 – Arrival in Istanbul', description: 'Arrive in Istanbul and transfer to your hotel.' },
      { day: 'December 20 – Free Day in Istanbul', description: 'Enjoy a free day to explore Istanbul at your own pace.' },
      { day: 'December 21 – Istanbul City Tour', description: 'Guided day tour of Istanbul\'s major attractions including Hagia Sophia, Blue Mosque, and Grand Bazaar.' },
      { day: 'December 22 – Transfer from Istanbul to Makkah', description: 'Travel from Istanbul to Makkah and check into your hotel.' },
      { day: 'December 23 – Free Day in Makkah', description: 'Rest or explore Makkah independently.' },
      { day: 'December 24 – Makkah Day Tour', description: 'Visit Mount Arafat, Cave Hira (Jabal Noor), Mina, Muzdalifa, Jamarat, and Jabal Thawr.' },
      { day: 'December 25 – Free Day in Makkah', description: 'Free day for personal activities or worship.' },
      { day: 'December 26 – Jummah Prayer in Makkah', description: 'Attend Jummah (Friday) prayer in Makkah.' },
      { day: 'December 27 – Transfer to Madinah', description: 'Travel from Makkah to Madinah and check into your hotel.' },
      { day: 'December 28 – Free Day in Madinah', description: 'Rest or explore Madinah independently.' },
      { day: 'December 29 – Madinah Day Tour', description: 'Visit Masjid Qiblatain, Masjid Quba, Mount Uhud, and the site of the Battle of the Trench.' },
      { day: 'December 30 – Free Day in Madinah', description: 'Free day for personal activities or worship.' },
      { day: 'December 31 – Free Day in Madinah', description: 'Enjoy your last free day in Madinah.' },
      { day: 'January 1 – Departure', description: 'Check out of the hotel and transfer to the airport for your departure.' },
    ],
    roomTypes: [
      { type: 'Triple Room', price: 4585 },
      { type: 'Double Room', price: 4885 },
      { type: 'Single Room', price: 5135 },
    ],
  },
  '2': {
    id: 2,
    title: 'Winter Break Istanbul & Umrah Package B',
    category: 'Umrah/Hajj',
    images: [
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&q=80',
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&q=80',
    ],
    priceRange: { min: 4275, max: 4825 },
    dates: 'December 18th - January 1st',
    departure: 'Vancouver',
    airline: 'Turkish Airlines',
    accommodations: {
      makkah: 'Elaf Meshal Hotel',
      madinah: 'Al Aqeeq Hotel',
      istanbul: 'Comfort 4* Hotel',
    },
    priceIncludes: [
      'Roundtrip Airfare',
      'Hotel Accommodations',
      'Ground Transportation',
      'Guided City Tours',
      'Daily Breakfast',
      'Saudi visa processing',
      'Airport Transfers',
    ],
    priceExcludes: [
      'Lunch & Dinner',
      'Travel Insurance',
      'SIM Card or Mobile Expenses',
      'Personal / Medical Expenses',
      'Optional Tours',
      'Any items or services not specifically mentioned in the "Price Includes" section',
    ],
    itinerary: [
      { day: 'December 18 – Departure to Istanbul', description: 'Depart from Vancouver to Istanbul via Turkish Airlines.' },
      { day: 'December 19 – Arrival in Istanbul', description: 'Arrive in Istanbul, meet and greet at airport, transfer to hotel.' },
      { day: 'December 20 – Istanbul Exploration', description: 'Free day to explore Istanbul. Optional: Bosphorus Cruise.' },
      { day: 'December 21 – Istanbul Historical Tour', description: 'Guided tour of Topkapi Palace, Hagia Sophia, Blue Mosque, and Spice Bazaar.' },
      { day: 'December 22 – Fly to Jeddah & Transfer to Makkah', description: 'Morning flight to Jeddah, then transfer to Makkah hotel.' },
      { day: 'December 23 – Makkah - Spiritual Day', description: 'Perform Umrah rituals at your own pace.' },
      { day: 'December 24 – Makkah Historical Sites', description: 'Guided tour: Cave Hira, Jabal Thawr, Mina, Muzdalifa, and Jamarat.' },
      { day: 'December 25 – Free Day in Makkah', description: 'Day at leisure for worship and reflection.' },
      { day: 'December 26 – Jummah in Makkah', description: 'Special Jummah prayer in the Grand Mosque.' },
      { day: 'December 27 – Transfer to Madinah', description: 'Travel to Madinah by comfortable coach, check into hotel.' },
      { day: 'December 28 – Madinah - Prophet\'s Mosque', description: 'Spend the day at Masjid Nabawi for prayers and worship.' },
      { day: 'December 29 – Madinah Ziyarat Tour', description: 'Visit Masjid Quba, Masjid Qiblatain, Mount Uhud, and Martyrs Cemetery.' },
      { day: 'December 30 – Madinah Free Day', description: 'Final day for personal worship and shopping.' },
      { day: 'December 31 – Last Day in Madinah', description: 'Free time for final prayers and preparations for departure.' },
      { day: 'January 1 – Return Journey', description: 'Transfer to airport for return flight to Vancouver.' },
    ],
    roomTypes: [
      { type: 'Triple Room', price: 4275 },
      { type: 'Double Room', price: 4575 },
      { type: 'Single Room', price: 4825 },
    ],
  },
  '3': {
    id: 3,
    title: 'Winter Break Istanbul & Umrah Land Only Package',
    category: 'Umrah/Hajj',
    images: [
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&q=80',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=80',
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80',
    ],
    priceRange: { min: 2350, max: 2900 },
    dates: 'December 18th - January 1st',
    accommodations: {
      makkah: 'Anjum Hotel Makkah',
      madinah: 'Jayden Hotel',
      istanbul: 'Premium 4* Hotel',
    },
    priceIncludes: [
      'Hotel Accommodations',
      'Ground Transportation',
      'Guided City Tours',
      'Daily Breakfast',
      'Saudi visa processing',
      'Airport Transfers in Turkey & Saudi Arabia',
      'All entrance fees for guided tours',
    ],
    priceExcludes: [
      'International Airfare',
      'Lunch & Dinner',
      'Travel Insurance',
      'SIM Card or Mobile Expenses',
      'Personal / Medical Expenses',
      'Any items or services not specifically mentioned in the "Price Includes" section',
    ],
    itinerary: [
      { day: 'December 18 – Arrival in Istanbul', description: 'Arrive in Istanbul (flights not included). Transfer to hotel.' },
      { day: 'December 19 – Free Day in Istanbul', description: 'Explore Istanbul at your leisure.' },
      { day: 'December 20 – Istanbul City Tour', description: 'Full-day guided tour of Istanbul\'s iconic landmarks.' },
      { day: 'December 21 – Istanbul to Makkah', description: 'Fly to Jeddah (flight not included), transfer to Makkah hotel.' },
      { day: 'December 22 – Free Day in Makkah', description: 'Perform Umrah and worship at the Grand Mosque.' },
      { day: 'December 23 – Makkah Historical Tour', description: 'Guided visit to significant Islamic historical sites.' },
      { day: 'December 24 – Free Day in Makkah', description: 'Day at leisure for spiritual activities.' },
      { day: 'December 25 – Transfer to Madinah', description: 'Journey to Madinah by luxury coach.' },
      { day: 'December 26 – Madinah - Prophet\'s Mosque', description: 'Spend time at Masjid Nabawi for prayers.' },
      { day: 'December 27 – Madinah Ziyarat', description: 'Visit important sites including Masjid Quba and Mount Uhud.' },
      { day: 'December 28 – Free Day in Madinah', description: 'Personal time for worship and reflection.' },
      { day: 'December 29 – Last Day in Madinah', description: 'Final prayers and preparations for departure.' },
      { day: 'December 30 – Departure Preparation', description: 'Check out and prepare for return journey.' },
      { day: 'December 31 – Return Journey', description: 'Transfer to airport for departure (flights not included).' },
    ],
    roomTypes: [
      { type: 'Triple Room', price: 2350 },
      { type: 'Double Room', price: 2650 },
      { type: 'Single Room', price: 2900 },
    ],
  },
  '4': {
    id: 4,
    title: 'Winter Break Umrah Land Only Package',
    category: 'Umrah/Hajj',
    images: [
      '/kba.jpg',
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
      'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&q=80',
      'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80',
      'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&q=80',
      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&q=80',
      '/kba.jpg',
    ],
    priceRange: { min: 1550, max: 2100 },
    dates: 'December 22nd - January 1st',
    accommodations: {
      makkah: 'Anjum Hotel Makkah',
      madinah: 'Jayden Hotel',
    },
    priceIncludes: [
      'Hotel Accommodations in Makkah & Madinah',
      'Ground Transportation between cities',
      'Guided Ziyarat Tours',
      'Daily Breakfast',
      'Saudi visa processing',
      'Airport Transfers',
    ],
    priceExcludes: [
      'International Airfare',
      'Lunch & Dinner',
      'Travel Insurance',
      'SIM Card or Mobile Expenses',
      'Personal / Medical Expenses',
      'Shopping and Souvenirs',
      'Any items or services not specifically mentioned in the "Price Includes" section',
    ],
    itinerary: [
      { day: 'December 22 – Arrival in Jeddah', description: 'Arrive at King Abdulaziz International Airport (flight not included). Transfer to Makkah hotel.' },
      { day: 'December 23 – First Day in Makkah', description: 'Settle in and perform your first Umrah at the Grand Mosque.' },
      { day: 'December 24 – Makkah Ziyarat Tour', description: 'Full-day guided tour: Cave Hira, Jabal Thawr, Mina, Muzdalifa, and Jamarat.' },
      { day: 'December 25 – Free Day in Makkah', description: 'Day at leisure for worship and spiritual activities.' },
      { day: 'December 26 – Jummah Prayer', description: 'Attend special Jummah prayer at the Grand Mosque.' },
      { day: 'December 27 – Transfer to Madinah', description: 'Travel to the blessed city of Madinah by comfortable coach.' },
      { day: 'December 28 – Madinah - Prophet\'s Mosque', description: 'Spend the day at Masjid Nabawi for prayers and reflection.' },
      { day: 'December 29 – Madinah Ziyarat', description: 'Guided tour: Masjid Quba, Masjid Qiblatain, Mount Uhud, Battle of the Trench site.' },
      { day: 'December 30 – Free Day in Madinah', description: 'Personal time for worship, shopping, and relaxation.' },
      { day: 'December 31 – Last Day in Madinah', description: 'Final prayers and farewell to the blessed city.' },
      { day: 'January 1 – Departure', description: 'Transfer to Madinah Airport for your return flight (flight not included).' },
    ],
    roomTypes: [
      { type: 'Triple Room', price: 1550 },
      { type: 'Double Room', price: 1850 },
      { type: 'Single Room', price: 2100 },
    ],
  },
};

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;
  const packageData = packageDetails[packageId];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package not found</h1>
          <button
            onClick={() => router.push('/packages')}
            className="bg-primary-blue text-white px-6 py-3 rounded-full font-bold"
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedRoomType
    ? packageData.roomTypes.find(rt => rt.type === selectedRoomType)?.price || packageData.priceRange.min
    : packageData.priceRange.min;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-600 mb-6"
          >
            <button onClick={() => router.push('/')} className="hover:text-primary-orange transition-colors">
              Home
            </button>
            <span>/</span>
            <button onClick={() => router.push('/packages')} className="hover:text-primary-orange transition-colors">
              Packages
            </button>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{packageData.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Image */}
              <div className="relative h-96 sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl mb-4">
                <Image
                  src={packageData.images[selectedImage]}
                  alt={`${packageData.title} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-7 gap-2">
                {packageData.images.map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative h-16 sm:h-20 rounded-xl overflow-hidden ${
                      selectedImage === index
                        ? 'ring-4 ring-primary-orange shadow-lg'
                        : 'ring-2 ring-gray-200 opacity-70 hover:opacity-100'
                    } transition-all duration-300`}
                  >
                    <Image src={image} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Booking Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                {packageData.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-blue mb-2">
                  ${currentPrice.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  Price range: ${packageData.priceRange.min.toLocaleString()} through $
                  {packageData.priceRange.max.toLocaleString()}
                </p>
              </div>

              {/* Dates */}
              <div className="bg-blue-50 border-l-4 border-primary-blue p-4 rounded-lg mb-6">
                <p className="text-lg font-bold text-gray-900">
                  📅 Dates: <span className="text-primary-orange">{packageData.dates}</span>
                </p>
              </div>

              {/* Room Type Selection */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">Room Type</label>
                <select
                  value={selectedRoomType}
                  onChange={(e) => setSelectedRoomType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none text-gray-900 font-medium"
                >
                  <option value="">Choose an option</option>
                  {packageData.roomTypes.map((room) => (
                    <option key={room.type} value={room.type}>
                      {room.type} - ${room.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                <button className="text-primary-orange text-sm mt-2 hover:underline">Clear</button>
              </div>

              {/* Cash Discount Notice */}
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-700">
                  💰 <span className="font-bold">Contact us to inquire about our cash discount!</span>
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-xl transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border-2 border-gray-300 rounded-xl py-2 font-bold text-lg"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              {selectedRoomType ? (
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-2xl"
                  >
                    Book Now
                  </motion.button>
                </Link>
              ) : (
                <motion.button
                  disabled
                  className="w-full py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  Select Room Type
                </motion.button>
              )}

              {/* Meta Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Category:</span> {packageData.category}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            {/* Tab Headers */}
            <div className="flex gap-4 border-b-2 border-gray-200 mb-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-6 py-3 font-bold text-lg transition-all duration-300 ${
                  activeTab === 'info'
                    ? 'text-primary-orange border-b-4 border-primary-orange -mb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Package Information
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-bold text-lg transition-all duration-300 ${
                  activeTab === 'reviews'
                    ? 'text-primary-orange border-b-4 border-primary-orange -mb-0.5'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews (0)
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-lg"
              >
                {/* Package Description */}
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    ❄️ Winter Break: Istanbul & Umrah
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Embark on a spiritually enriching and culturally vibrant journey this winter break with our
                    exclusive Istanbul and Umrah package. Begin your adventure in the historic city of Istanbul,
                    where East meets West, exploring magnificent landmarks, bustling bazaars, and iconic mosques.
                    Then, travel to the holy cities of Makkah and Madinah for a deeply meaningful Umrah experience,
                    visiting sacred sites and performing rituals in the heart of Islam.
                  </p>
                </div>

                {/* Flight Details */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    ✈️ Flight Details
                  </h3>
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-2xl">
                    <p className="text-gray-700 mb-2">
                      <span className="font-bold">Departure From:</span> {packageData.departure}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-bold">Airlines:</span> {packageData.airline}
                    </p>
                  </div>
                </div>

                {/* Accommodations */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🏨 Accommodations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packageData.accommodations.makkah && (
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="font-bold text-primary-blue mb-1">Makkah:</p>
                        <p className="text-gray-700">{packageData.accommodations.makkah}</p>
                      </div>
                    )}
                    {packageData.accommodations.madinah && (
                      <div className="bg-orange-50 p-4 rounded-xl">
                        <p className="font-bold text-primary-orange mb-1">Madinah:</p>
                        <p className="text-gray-700">{packageData.accommodations.madinah}</p>
                      </div>
                    )}
                    {packageData.accommodations.istanbul && (
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <p className="font-bold text-gray-900 mb-1">Istanbul:</p>
                        <p className="text-gray-700">{packageData.accommodations.istanbul}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 italic mt-3">Or similar accommodations.</p>
                </div>

                {/* Price Includes/Excludes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      💼 Price Includes
                    </h3>
                    <ul className="space-y-2">
                      {packageData.priceIncludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-green-500 font-bold mt-1">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🚫 Price Does Not Include
                    </h3>
                    <ul className="space-y-2">
                      {packageData.priceExcludes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-500 font-bold mt-1">✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Itinerary */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    🗓️ Itinerary
                  </h3>
                  <div className="space-y-4">
                    {packageData.itinerary.map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-xl border-l-4 border-primary-blue hover:shadow-md transition-shadow"
                      >
                        <p className="font-bold text-gray-900 mb-1">{day.day}</p>
                        <p className="text-gray-700">{day.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    📄 Terms & Conditions
                  </h3>
                  <p className="text-gray-700">
                    Please review our full Terms and Conditions for important information regarding your booking.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-lg text-center"
              >
                <p className="text-gray-600 text-lg">No reviews yet. Be the first to review this package!</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
