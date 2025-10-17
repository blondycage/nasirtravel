'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';

const testimonials = [
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
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="testimonials" ref={ref} className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            What Our <span className="text-primary-orange">Travelers Say</span> About Us
          </h2>
        </motion.div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
              animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
              transition={{ duration: 0.7, delay: index * 0.2, type: 'spring', bounce: 0.4 }}
              whileHover={{ scale: 1.05, y: -8, boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)' }}
              className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl shadow-lg transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: index * 0.15 + i * 0.1 }}
                    className="text-primary-orange text-xl"
                  >
                    ★
                  </motion.span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl shadow-lg mb-6"
          >
            <div className="flex mb-4">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <span key={i} className="text-primary-orange text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-700 mb-6 italic leading-relaxed">
              &ldquo;{testimonials[activeIndex].text}&rdquo;
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-blue rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                {testimonials[activeIndex].name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{testimonials[activeIndex].name}</p>
                <p className="text-sm text-gray-600">Verified Customer</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-primary-orange w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(30, 64, 175, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-blue text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-all duration-300 shadow-lg"
          >
            View All Testimonials
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
