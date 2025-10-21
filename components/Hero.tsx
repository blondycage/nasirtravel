'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const heroSlides = [
  {
    title: 'Welcome to Naasir Travel',
    subtitle: 'Your Full-Service Travel Agency',
    description: 'Explore current packages, or plan your dream vacation!',
    image: '/kba.jpg',
  },
  {
    title: 'Sacred Journeys',
    subtitle: 'Hajj & Umrah Specialists',
    description: 'Experience spiritual travel with comfort and care',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80',
  },
  {
    title: 'Explore the World',
    subtitle: 'Endless Possibilities Await',
    description: 'From vibrant cities to peaceful escapes',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80',
  },
  {
    title: 'Luxury Accommodations',
    subtitle: 'Premium Hotels & Resorts',
    description: 'Handpicked stays ranging from budget-friendly to luxury',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
  },
];

// Typewriter effect component
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, delay]);

  return <>{displayText}</>;
}

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentContent = heroSlides[currentSlide];

  return (
    <section id="home" className="relative min-h-screen h-screen overflow-hidden pt-16 lg:pt-20">
      {/* Background Image Carousel - Right Side */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute top-0 right-0 w-full md:w-1/2 h-full"
        >
          <Image
            src={currentContent.image}
            alt={currentContent.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent md:from-white md:via-white/10 md:to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile */}
      <div className="absolute inset-0 bg-white/50 md:bg-transparent md:bg-gradient-to-r md:from-white/98 md:via-white/85 md:to-transparent pointer-events-none" />

      {/* Content - Left Side */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center">
        <div className="w-full md:w-1/2 pr-0 md:pr-8 lg:pr-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                {currentContent.title}
              </motion.h1>

              <motion.h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-orange"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {currentContent.subtitle}
              </motion.h2>

              <motion.p
                className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <TypewriterText text={currentContent.description} />
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Buttons - Always Visible */}
          <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4 mt-4 sm:mt-6">
            <Link href="/packages">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-orange hover:bg-orange-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 shadow-xl"
              >
                Explore Packages
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(30, 64, 175, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary-blue hover:bg-blue-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-bold transition-all duration-300 shadow-xl"
              >
                Let&apos;s Plan
              </motion.button>
            </Link>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-2 mt-12">
            {heroSlides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentSlide
                    ? 'bg-primary-orange w-8'
                    : 'bg-gray-300 w-4 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-gray-600 text-center"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full mx-auto mb-2 flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-3 bg-gray-600 rounded-full mt-2"
            />
          </div>
          <p className="text-xs font-semibold">Scroll</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
