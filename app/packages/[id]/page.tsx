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
  image: string;
  price: string;
  dates: string;
  accommodation: string;
  departure?: string;
  packageType: 'umrah' | 'standard';
  status: 'draft' | 'published' | 'archived';
  itinerary?: { day: number; title: string; description: string }[];
  inclusions?: string[];
  exclusions?: string[];
  gallery?: string[];
}

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
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

  // Parse price - could be string like "$4,585" or "4585"
  const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleanPrice = priceStr.replace(/[$,]/g, '');
    return parseFloat(cleanPrice) || 0;
  };

  const pricePerPerson = parsePrice(tour.price);

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
            {/* Left Column - Package Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Package Image */}
              <div className="relative h-96 sm:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={tour.image || '/placeholder-tour.jpg'}
                  alt={tour.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
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
              {tour.price && (
                <div className="mb-6">
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary-blue mb-2">
                    {tour.price}
                  </p>
                  <p className="text-gray-600 text-sm">Per Person</p>
                </div>
              )}

              {/* Package Details */}
              <div className="space-y-4 mb-6">
                {/* Dates */}
                <div className="bg-blue-50 border-l-4 border-primary-blue p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-900">
                    📅 Dates: <span className="text-primary-orange">{tour.dates}</span>
                  </p>
                </div>

                {/* Accommodation */}
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-900">
                    🏨 Accommodation: <span className="text-gray-700">{tour.accommodation}</span>
                  </p>
                </div>

                {/* Departure */}
                {tour.departure && (
                  <div className="bg-orange-50 border-l-4 border-primary-orange p-4 rounded-lg">
                    <p className="text-base font-bold text-gray-900">
                      ✈️ Departure: <span className="text-primary-orange">{tour.departure}</span>
                    </p>
                  </div>
                )}

                {/* Category */}
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-base font-bold text-gray-900">
                    🏷️ Category: <span className="text-green-700">{tour.category}</span>
                  </p>
                </div>
              </div>

              {/* Cash Discount Notice */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-700">
                  💰 <span className="font-bold">Contact us to inquire about our cash discount!</span>
                </p>
              </div>

              {/* Scroll to booking form */}
              {tour.price && (
                <button
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-section');
                    bookingSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-2xl hover:scale-105"
                >
                  Book Now
                </button>
              )}
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

                {/* Price Includes/Excludes */}
                {(tour.inclusions || tour.exclusions) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {tour.inclusions && tour.inclusions.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          ✓ Inclusions
                        </h3>
                        <ul className="space-y-2">
                          {tour.inclusions.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700">
                              <span className="text-green-500 font-bold mt-1">✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tour.exclusions && tour.exclusions.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          ✗ Exclusions
                        </h3>
                        <ul className="space-y-2">
                          {tour.exclusions.map((item, index) => (
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
                          <p className="font-bold text-gray-900 mb-1">Day {day.day}: {day.title}</p>
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
          {tour.price && pricePerPerson > 0 && (
            <motion.div
              id="booking-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Complete Your Booking</h2>
              <BookingForm
                tourId={packageId}
                tourTitle={tour.title}
                pricePerPerson={pricePerPerson}
              />
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
