'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type PackageCategory = 'All' | 'Hajj / Umrah' | 'Asia' | 'Africa' | 'Europe';

interface TourPackage {
  _id: string;
  title: string;
  category: string;
  image: string;
  departure?: string;
  accommodation: string;
  dates: string;
  price: string;
  status: 'draft' | 'published' | 'archived';
}

const categories: PackageCategory[] = ['All', 'Hajj / Umrah', 'Asia', 'Africa', 'Europe'];

export default function PackagesPage() {
  const [selectedCategory, setSelectedCategory] = useState<PackageCategory>('All');
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TourPackage | null>(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tours');
      const data = await response.json();
      setTours(data.data || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEnquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Extract form data
    const enquiryData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('_subject') as string || `Package Enquiry: ${selectedPackage?.title || 'General'}`,
      message: formData.get('message') as string,
      packageInterest: selectedPackage?.title || undefined,
    };

    try {
      // Submit to our API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enquiryData),
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        setShowSuccess(true);

        // Reset form
        form.reset();

        // Close modal
        setEnquiryModalOpen(false);

        // Hide success message after 5 seconds
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

  const openEnquiryModal = (pkg: TourPackage) => {
    setSelectedPackage(pkg);
    setEnquiryModalOpen(true);
  };

  // Filter packages by category and status
  const filteredAvailablePackages = tours.filter(pkg => {
    let matchesCategory = false;

    if (selectedCategory === 'All') {
      matchesCategory = true;
    } else if (selectedCategory === 'Hajj / Umrah') {
      // Match if category contains 'hajj' or 'umrah' (case-insensitive)
      const pkgCategoryLower = pkg.category.toLowerCase();
      matchesCategory = pkgCategoryLower.includes('hajj') || pkgCategoryLower.includes('umrah');
    } else {
      // Exact match for other categories (case-insensitive)
      matchesCategory = pkg.category.toLowerCase() === selectedCategory.toLowerCase();
    }

    const isPublished = pkg.status === 'published';
    return matchesCategory && isPublished;
  });

  // No coming soon packages - all from backend
  const displayComingSoonPackages: TourPackage[] = [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="min-h-screen">
      <Header />

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

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden pt-16 lg:pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
            alt="Tour Packages"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6"
            >
              Explore Our <span className="text-primary-orange">Tour Packages</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-32 h-1.5 bg-gradient-to-r from-primary-blue to-primary-orange mx-auto rounded-full mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-200 leading-relaxed"
            >
              Embark on unforgettable journeys crafted with care and expertise
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-white text-center"
          >
            <div className="w-6 h-10 border-2 border-white rounded-full mx-auto mb-2 flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1 h-3 bg-white rounded-full mt-2"
              />
            </div>
            <p className="text-xs font-semibold">Scroll</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Packages Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-10 sm:mb-12 lg:mb-16"
          >
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm md:text-base font-bold transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-orange"></div>
            </div>
          )}

          {/* Available Packages */}
          {!loading && filteredAvailablePackages.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8 sm:mb-10"
              >
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
                  Available Now
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-blue to-primary-orange rounded-full" />
              </motion.div>

              <motion.div
                key={selectedCategory}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-20 lg:mb-24"
              >
                {filteredAvailablePackages.map((pkg) => (
              <motion.div
                key={pkg._id}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-2 h-12 sm:h-14">
                    {pkg.title}
                  </h3>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 flex-grow">
                    {pkg.departure && (
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">🛫</span>
                        <span>Departure: {pkg.departure}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">🏨</span>
                      <span>{pkg.accommodation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">📅</span>
                      <span className="line-clamp-1">{pkg.dates}</span>
                    </div>
                  </div>

                  {/* Price */}
                  {pkg.price ? (
                    <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-auto">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Starting From</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-primary-blue">
                        ${pkg.price}
                        <span className="text-xs sm:text-sm font-normal text-gray-600"> Per Person</span>
                      </p>
                    </div>
                  ) : (
                    <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-auto">
                      <p className="text-sm sm:text-base text-gray-600 italic">
                        Price available on enquiry
                      </p>
                    </div>
                  )}

                  {/* Button */}
                  {pkg.price ? (
                    <Link href={`/packages/${pkg._id}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-lg"
                      >
                        View Details
                      </motion.button>
                    </Link>
                  ) : (
                    <motion.button
                      onClick={() => openEnquiryModal(pkg)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-lg"
                    >
                      Enquire Now
                    </motion.button>
                  )}
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-primary-orange transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
            </>
          )}

          {/* Coming Soon Packages - Always show all */}
          {displayComingSoonPackages.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8 sm:mb-10 mt-16 sm:mt-20"
              >
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2">
                  <span className="text-gray-900">Coming </span>
                  <span className="text-primary-orange">Soon</span>
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-primary-blue to-primary-orange rounded-full" />
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
              >
                {displayComingSoonPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Coming Soon Badge */}
                  {pkg.isComing && (
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-primary-orange text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 flex flex-col flex-grow">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-2 h-12 sm:h-14">
                    {pkg.title}
                  </h3>

                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 flex-grow">
                    {pkg.departure && (
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg">🛫</span>
                        <span>Departure: {pkg.departure}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">🏨</span>
                      <span>{pkg.accommodation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base sm:text-lg">📅</span>
                      <span className="line-clamp-1">{pkg.dates}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-auto">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Starting From</p>
                    <p className="text-xl sm:text-2xl font-extrabold text-primary-blue">
                      {pkg.price}
                    </p>
                  </div>

                  {/* Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 sm:py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 bg-gray-200 text-gray-500 cursor-not-allowed"
                    disabled
                  >
                    Coming Soon
                  </motion.button>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-primary-orange transition-all duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
            </>
          )}

          {/* No Results - Only shown when no available packages match filter */}
          {!loading && filteredAvailablePackages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <p className="text-xl sm:text-2xl text-gray-600">No available packages found in this category.</p>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Please check back later for new tours!</p>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12 sm:mt-16 lg:mt-20"
          >
            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 sm:mb-6 px-4">
              Can&apos;t find what you&apos;re looking for?
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(30, 64, 175, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-blue hover:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 shadow-xl"
              >
                Plan a Custom Journey
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gray-900">Have a </span>
              <span className="text-primary-orange">Question?</span>
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-blue to-primary-orange mx-auto rounded-full mb-6" />
            <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
              Send us your enquiry and we&apos;ll get back to you as soon as possible
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12"
          >
            <form
              onSubmit={handleSubmitEnquiry}
              className="space-y-6"
            >
              {/* Hidden fields for FormSubmit configuration */}
              <input type="hidden" name="_subject" value="New Package Enquiry from Website" />
              <input type="hidden" name="_captcha" value="false" />
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_next" value="https://naasirtravel.com/packages?success=true" />
              <input type="text" name="_honey" style={{ display: 'none' }} />

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone Field (Optional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                  placeholder="+1 (123) 456-7890"
                />
              </div>

              {/* Package Interest */}
              <div>
                <label htmlFor="package" className="block text-sm font-semibold text-gray-700 mb-2">
                  Package of Interest
                </label>
                <select
                  id="package"
                  name="package"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none"
                >
                  <option value="">Select a package type</option>
                  <option value="Hajj / Umrah">Hajj / Umrah</option>
                  <option value="Asia">Asia</option>
                  <option value="Africa">Africa</option>
                  <option value="Europe">Europe</option>
                  <option value="Custom Package">Custom Package</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Enquiry *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all outline-none resize-none"
                  placeholder="Tell us about your travel plans, dates, number of travelers, or any specific requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={`w-full py-4 bg-gradient-to-r from-primary-blue to-primary-orange text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
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

              <p className="text-xs text-gray-500 text-center mt-4">
                By submitting this form, you agree to our privacy policy. We&apos;ll respond to your enquiry within 24 hours.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
              <span className="text-gray-900">Trusted by </span>
              <span className="text-primary-orange">Thousands</span>
              <span className="text-gray-900"> of Travelers</span>
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary-blue to-primary-orange mx-auto rounded-full mb-6" />
            <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
              Hear from our satisfied customers who experienced unforgettable journeys with us
            </p>
          </motion.div>

          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {[
              {
                name: 'Zaid Elmi',
                text: 'MashaAllah Tabarakallah it was an amazing umrah experience. Customer service was exceptional and every detail was taken care of. My family and I had an outstanding experience and would definitely recommend it to others.',
                rating: 5,
              },
              {
                name: 'Yahya Abdi Hadi',
                text: 'I have used Naasir Travel for Umrah many times now and I am pleased with the service and the attention to detail each time. The hotels are comfortable and the trip is overall very smooth. I highly recommend Naasir Travel for your Hajj and Umrah needs.',
                rating: 5,
              },
              {
                name: 'Omar Sheikh',
                text: 'Hands down one of the best travel agencies for Umrah. Their accommodation at Pullman Zamzam Madinah and Makkah is absolutely amazing. Only a 2-minute walk to Masjid Nabawi/Kabah. Would recommend anyone to go with them. The agency staff explain clearly the process of Umrah.',
                rating: 5,
              },
              {
                name: 'Shazad Mansoory',
                text: 'Alhamdolillah, TABARRUK Allah, the best service provider for Hajj and Umrah in Canada. Excellent customer service and attention to details. BR. Abdul Nasir readily available at all times.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -8 }}
                className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                      className="text-primary-orange text-xl sm:text-2xl"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed text-sm sm:text-base flex-grow">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center mt-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary-blue to-primary-orange rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-base sm:text-lg">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden">
            {[
              {
                name: 'Zaid Elmi',
                text: 'MashaAllah Tabarakallah it was an amazing umrah experience. Customer service was exceptional and every detail was taken care of. My family and I had an outstanding experience and would definitely recommend it to others.',
                rating: 5,
              },
              {
                name: 'Yahya Abdi Hadi',
                text: 'I have used Naasir Travel for Umrah many times now and I am pleased with the service and the attention to detail each time. The hotels are comfortable and the trip is overall very smooth. I highly recommend Naasir Travel for your Hajj and Umrah needs.',
                rating: 5,
              },
              {
                name: 'Omar Sheikh',
                text: 'Hands down one of the best travel agencies for Umrah. Their accommodation at Pullman Zamzam Madinah and Makkah is absolutely amazing. Only a 2-minute walk to Masjid Nabawi/Kabah. Would recommend anyone to go with them.',
                rating: 5,
              },
              {
                name: 'Shazad Mansoory',
                text: 'Alhamdolillah, TABARRUK Allah, the best service provider for Hajj and Umrah in Canada. Excellent customer service and attention to details. BR. Abdul Nasir readily available at all times.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-3xl shadow-lg mb-6 border border-gray-100"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary-orange text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed text-sm">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-primary-orange rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-xs text-gray-600">Verified Customer</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      {enquiryModalOpen && selectedPackage && (
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
                  <p className="text-gray-600">{selectedPackage.title}</p>
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
                  {selectedPackage.departure && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold">Departure:</span> {selectedPackage.departure}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Accommodation:</span> {selectedPackage.accommodation}
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Dates:</span> {selectedPackage.dates}
                  </p>
                </div>
              </div>

              {/* Enquiry Form */}
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                {/* Hidden fields for FormSubmit configuration */}
                <input type="hidden" name="_subject" value={`Package Enquiry: ${selectedPackage.title}`} />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_next" value="https://naasirtravel.com/packages?success=true" />
                <input type="text" name="_honey" style={{ display: 'none' }} />
                <input type="hidden" name="package_title" value={selectedPackage.title} />
                <input type="hidden" name="package_category" value={selectedPackage.category} />

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
