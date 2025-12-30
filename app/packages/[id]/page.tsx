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
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmitEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const enquiryData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: `Package Enquiry: ${tour?.title || 'General'}`,
      message: formData.get('message') as string,
      packageInterest: tour?.title || undefined,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccess(true);
        form.reset();
        setEnquiryModalOpen(false);
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        alert(data.error || 'Failed to send enquiry. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to send enquiry. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

              {/* Action Button */}
              {tour.price && pricePerPerson > 0 ? (
                <button
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-section');
                    bookingSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-2xl hover:scale-105"
                >
                  Book Now
                </button>
              ) : (
                <button
                  onClick={() => setEnquiryModalOpen(true)}
                  className="w-full py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-2xl hover:scale-105"
                >
                  Contact for Details
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
                departureDate={tour.dates.split(' - ')[0].toString()}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Success Toast Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-24 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md"
        >
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <div>
            <p className="font-bold">Enquiry Sent Successfully!</p>
            <p className="text-sm">We&apos;ll get back to you within 24 hours.</p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-auto text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </motion.div>
      )}

      {/* Enquiry Modal */}
      {enquiryModalOpen && tour && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                    Enquire About Package
                  </h3>
                  <p className="text-gray-600">{tour.title}</p>
                </div>
                <button
                  onClick={() => setEnquiryModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Package Details */}
              <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-xl mb-6">
                <div className="space-y-2 text-sm">
                  {tour.departure && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Departure:</span> {tour.departure}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Accommodation:</span> {tour.accommodation}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Dates:</span> {tour.dates}
                  </p>
                </div>
              </div>

              {/* Enquiry Form */}
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="modal-name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="modal-email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="modal-phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                    placeholder="+1 (123) 456-7890"
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label htmlFor="modal-message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Enquiry *
                  </label>
                  <textarea
                    id="modal-message"
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none resize-none"
                    placeholder="Tell us about your travel plans, number of travelers, dates, or any specific requirements..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className={`flex-1 py-3 bg-gradient-to-r from-primary-blue to-primary-orange text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      'Send Enquiry'
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
