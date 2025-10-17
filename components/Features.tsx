'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: '✈️',
    title: 'Flexible Flight Options',
    description: 'First-class or economy flights — choose the comfort that suits you',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 via-cyan-50 to-blue-100',
  },
  {
    icon: '🗺️',
    title: 'Custom Itineraries',
    description: 'Single or multi-city itineraries tailored to your travel goals',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 via-pink-50 to-purple-100',
  },
  {
    icon: '🍽️',
    title: 'Meal Plans',
    description: 'Flexible meal plans crafted to your preferences',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 via-red-50 to-orange-100',
  },
  {
    icon: '🏨',
    title: 'Premium Hotels',
    description: 'Handpicked hotels ranging from budget-friendly to luxury stays',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 via-teal-50 to-emerald-100',
  },
];

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-orange/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-blue/5 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Tours & Holidays <span className="bg-gradient-to-r from-primary-orange to-orange-600 bg-clip-text text-transparent">Specialists</span>
            </h2>
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary-blue to-cyan-600 bg-clip-text text-transparent max-w-3xl mx-auto">
              Endless Possibilities Await
            </p>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-gray-600 mt-4 max-w-4xl mx-auto"
          >
            From vibrant cities to peaceful escapes—choose your destinations, travel dates, and experiences.
            With complete flexibility and endless inspiration, your journey starts with your vision and our expert support.
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60, rotateX: -15 }}
              animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{
                y: -15,
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Glow Effect */}
              <motion.div
                className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`}
              />

              {/* Card */}
              <div className={`relative bg-gradient-to-br ${feature.bgGradient} p-6 sm:p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 backdrop-blur-sm overflow-hidden`}>
                {/* Animated Shine Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                {/* Icon with Gradient Background */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-3xl sm:text-4xl filter drop-shadow-lg">{feature.icon}</span>

                  {/* Pulse Effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient}`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-2 sm:mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative Corner Elements */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/40 to-transparent rounded-bl-full opacity-50" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/40 to-transparent rounded-tr-full opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
