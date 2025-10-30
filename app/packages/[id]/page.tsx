'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingForm from '@/components/BookingForm';

interface Tour {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  duration: string;
  maxGroupSize: number;
  startDates: string[];
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  itinerary?: { day: string; description: string }[];
  priceIncludes?: string[];
  priceExcludes?: string[];
  accommodations?: {
    makkah?: string;
    madinah?: string;
    istanbul?: string;
  };
  departure?: string;
  airline?: string;
  roomTypes?: { type: string; price: number }[];
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        const response = await fetch(`/api/tours/${packageId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch tour details');
        }

        setTour(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?tourId=${packageId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setReviews(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };

    if (packageId) {
      fetchTourDetails();
      fetchReviews();
    }
  }, [packageId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading tour details...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Tour not found'}</h1>
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

  // Calculate price range from room types or use base price
  const priceRange = tour.roomTypes && tour.roomTypes.length > 0
    ? {
        min: Math.min(...tour.roomTypes.map(rt => rt.price)),
        max: Math.max(...tour.roomTypes.map(rt => rt.price))
      }
    : { min: tour.price, max: tour.price };

  const currentPrice = selectedRoomType && tour.roomTypes
    ? tour.roomTypes.find(rt => rt.type === selectedRoomType)?.price || priceRange.min
    : priceRange.min;

  // Format start dates
  const formattedDates = tour.startDates && tour.startDates.length > 0
    ? new Date(tour.startDates[0]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Dates to be announced';

  // Approved reviews only
  const approvedReviews = reviews.filter(r => r.status === 'approved');

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
            <span className="text-gray-900 font-semibold">{tour.title}</span>
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
                  src={tour.images && tour.images.length > 0 ? tour.images[selectedImage] : '/placeholder-tour.jpg'}
                  alt={`${tour.title} - Image ${selectedImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Gallery */}
              {tour.images && tour.images.length > 1 && (
                <div className="grid grid-cols-7 gap-2">
                  {tour.images.map((image, index) => (
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
              )}
            </motion.div>

            {/* Right Column - Booking Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
                {tour.title}
              </h1>

              {/* Price */}
              <div className="mb-6">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-blue mb-2">
                  ${currentPrice.toLocaleString()}
                </p>
                {priceRange.min !== priceRange.max && (
                  <p className="text-gray-600">
                    Price range: ${priceRange.min.toLocaleString()} through $
                    {priceRange.max.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="bg-blue-50 border-l-4 border-primary-blue p-4 rounded-lg mb-6">
                <p className="text-lg font-bold text-gray-900">
                  📅 Dates: <span className="text-primary-orange">{formattedDates}</span>
                </p>
              </div>

              {/* Room Type Selection */}
              {tour.roomTypes && tour.roomTypes.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                  <label className="block text-lg font-bold text-gray-900 mb-3">Room Type</label>
                  <select
                    value={selectedRoomType}
                    onChange={(e) => setSelectedRoomType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none text-gray-900 font-medium"
                  >
                    <option value="">Choose an option</option>
                    {tour.roomTypes.map((room) => (
                      <option key={room.type} value={room.type}>
                        {room.type} - ${room.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setSelectedRoomType('')}
                    className="text-primary-orange text-sm mt-2 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

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
              {!tour.roomTypes || tour.roomTypes.length === 0 || selectedRoomType ? (
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
                  <span className="font-semibold">Category:</span> {tour.category}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Duration:</span> {tour.duration}
                </p>
                <p className="mt-2">
                  <span className="font-semibold">Max Group Size:</span> {tour.maxGroupSize} people
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
                Reviews ({approvedReviews.length})
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
                    {tour.title}
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {tour.description}
                  </p>
                </div>

                {/* Flight Details */}
                {(tour.departure || tour.airline) && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      ✈️ Flight Details
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 rounded-2xl">
                      {tour.departure && (
                        <p className="text-gray-700 mb-2">
                          <span className="font-bold">Departure From:</span> {tour.departure}
                        </p>
                      )}
                      {tour.airline && (
                        <p className="text-gray-700">
                          <span className="font-bold">Airlines:</span> {tour.airline}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Accommodations */}
                {tour.accommodations && (tour.accommodations.makkah || tour.accommodations.madinah || tour.accommodations.istanbul) && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🏨 Accommodations
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tour.accommodations.makkah && (
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <p className="font-bold text-primary-blue mb-1">Makkah:</p>
                          <p className="text-gray-700">{tour.accommodations.makkah}</p>
                        </div>
                      )}
                      {tour.accommodations.madinah && (
                        <div className="bg-orange-50 p-4 rounded-xl">
                          <p className="font-bold text-primary-orange mb-1">Madinah:</p>
                          <p className="text-gray-700">{tour.accommodations.madinah}</p>
                        </div>
                      )}
                      {tour.accommodations.istanbul && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="font-bold text-gray-900 mb-1">Istanbul:</p>
                          <p className="text-gray-700">{tour.accommodations.istanbul}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 italic mt-3">Or similar accommodations.</p>
                  </div>
                )}

                {/* Price Includes/Excludes */}
                {(tour.priceIncludes || tour.priceExcludes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {tour.priceIncludes && tour.priceIncludes.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          💼 Price Includes
                        </h3>
                        <ul className="space-y-2">
                          {tour.priceIncludes.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-green-500 font-bold mt-1">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tour.priceExcludes && tour.priceExcludes.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          🚫 Price Does Not Include
                        </h3>
                        <ul className="space-y-2">
                          {tour.priceExcludes.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-red-500 font-bold mt-1">✗</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Itinerary */}
                {tour.itinerary && tour.itinerary.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      🗓️ Itinerary
                    </h3>
                    <div className="space-y-4">
                      {tour.itinerary.map((day, index) => (
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
                )}

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
                className="bg-white p-8 rounded-3xl shadow-lg"
              >
                {approvedReviews.length === 0 ? (
                  <p className="text-gray-600 text-lg text-center">No reviews yet. Be the first to review this package!</p>
                ) : (
                  <div className="space-y-6">
                    {approvedReviews.map((review) => (
                      <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">{review.userName}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Booking Form Section */}
          {(!tour.roomTypes || tour.roomTypes.length === 0 || selectedRoomType) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Booking</h2>
              <BookingForm
                tourId={packageId}
                tourTitle={tour.title}
                pricePerPerson={currentPrice}
              />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
