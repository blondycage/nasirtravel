'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

type PackageCategory = 'All' | 'Hajj / Umrah' | 'Asia' | 'Africa' | 'Europe';

interface TourPackage {
  id: number;
  title: string;
  category: PackageCategory;
  image: string;
  departure?: string;
  accommodation: string;
  dates: string;
  price: string;
  isComing?: boolean;
}

const packages: TourPackage[] = [
  {
    id: 1,
    title: 'Winter Break Istanbul & Umrah Package A',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    departure: 'Vancouver',
    accommodation: '4 Star Accommodations',
    dates: 'December 18 - January 1 (Tentative)',
    price: '$4,585',
  },
  {
    id: 2,
    title: 'Winter Break Istanbul & Umrah Package B',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=800&q=80',
    departure: 'Vancouver',
    accommodation: '4 Star Accommodations',
    dates: 'December 18 - January 1 (Tentative)',
    price: '$4,275',
  },
  {
    id: 3,
    title: 'Winter Break Istanbul & Umrah Land Only Package',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
    accommodation: '4 Star Accommodations',
    dates: 'December 18 - January 1 (Tentative)',
    price: '$2,350',
  },
  {
    id: 4,
    title: 'Winter Break Umrah Land Only Package',
    category: 'Hajj / Umrah',
    image: '/kba.jpg',
    accommodation: '4 Star Accommodations',
    dates: 'December 22 - January 1 (Tentative)',
    price: '$1,550',
  },
  {
    id: 5,
    title: 'Standard Ramadan Package',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&q=80',
    accommodation: 'TBA',
    dates: 'TBA',
    price: 'TBA',
    isComing: true,
  },
  {
    id: 6,
    title: 'VIP Ramadan Package',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80',
    accommodation: 'TBA',
    dates: 'TBA',
    price: 'TBA',
    isComing: true,
  },
  {
    id: 7,
    title: 'Spring Break Umrah Package',
    category: 'Hajj / Umrah',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80',
    accommodation: 'TBA',
    dates: 'TBA',
    price: 'TBA',
    isComing: true,
  },
  {
    id: 8,
    title: 'Explore Uzbekistan: The Land of Imam Bukhari',
    category: 'Asia',
    image: 'https://images.unsplash.com/photo-1599946347371-68eb71b16afc?w=800&q=80',
    accommodation: 'TBA',
    dates: 'TBA',
    price: 'TBA',
    isComing: true,
  },
];

const categories: PackageCategory[] = ['All', 'Hajj / Umrah', 'Asia', 'Africa', 'Europe'];

export default function Packages() {
  const [selectedCategory, setSelectedCategory] = useState<PackageCategory>('All');

  const filteredPackages = selectedCategory === 'All'
    ? packages
    : packages.filter(pkg => pkg.category === selectedCategory);

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
    <section id="packages" className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4">
            <span className="text-gray-900">Discover Our </span>
            <span className="text-primary-orange">Tour Packages</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-primary-blue to-primary-orange mx-auto rounded-full mb-6" />
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Carefully curated journeys to destinations around the world
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-blue to-primary-orange text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-8"
        >
          <Link href="/" className="hover:text-primary-orange transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Tour Packages</span>
        </motion.div>

        {/* Package Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8"
        >
          {filteredPackages.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-56 sm:h-64 overflow-hidden">
                <Image
                  src={pkg.image}
                  alt={pkg.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Coming Soon Badge */}
                {pkg.isComing && (
                  <div className="absolute top-4 right-4 bg-primary-orange text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    Coming Soon
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                  {pkg.title}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  {pkg.departure && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛫</span>
                      <span>Departure: {pkg.departure}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏨</span>
                    <span>{pkg.accommodation}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📅</span>
                    <span>{pkg.dates}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Starting From</p>
                  <p className="text-2xl font-extrabold text-primary-blue">
                    {pkg.price}
                    {!pkg.isComing && <span className="text-sm font-normal text-gray-600"> Per Person</span>}
                  </p>
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-full font-bold transition-all duration-300 ${
                    pkg.isComing
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-blue to-primary-orange text-white hover:shadow-lg'
                  }`}
                  disabled={pkg.isComing}
                >
                  {pkg.isComing ? 'Coming Soon' : 'View Package Details'}
                </motion.button>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-primary-orange transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredPackages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-2xl text-gray-600">No packages found in this category.</p>
            <p className="text-gray-500 mt-2">Check back soon for new destinations!</p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16 sm:mt-20"
        >
          <p className="text-lg sm:text-xl text-gray-700 mb-6">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(30, 64, 175, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-blue hover:bg-blue-800 text-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 shadow-xl"
          >
            Plan a Custom Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
