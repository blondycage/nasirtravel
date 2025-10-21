'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    packageInterest: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We will get back to you soon.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] overflow-hidden pt-16 lg:pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue via-blue-700 to-primary-orange">
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 sm:mb-6"
            >
              Get in <span className="text-primary-orange">Touch</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="w-32 h-1.5 bg-white mx-auto rounded-full mb-6"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-100"
            >
              We&apos;re here to help plan your perfect journey
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-gray-600"
        >
          <button onClick={() => router.push('/')} className="hover:text-primary-orange transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Contact Us</span>
        </motion.div>
      </div>

      {/* Main Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {/* Contact Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-primary-blue"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-blue to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Visit Us</h3>
              <p className="text-primary-orange font-semibold mb-3">By Appointment</p>
              <p className="text-gray-700 leading-relaxed">
                Unit 803, 6081 No 3 RD,<br />
                Richmond BC, V6Y 3B1
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-primary-orange"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="space-y-2 text-gray-700">
                <p>
                  <a href="tel:+16043300307" className="hover:text-primary-orange transition-colors font-semibold">
                    604-330-0307
                  </a>
                </p>
                <p>
                  <a href="tel:+18886627467" className="hover:text-primary-orange transition-colors font-semibold">
                    1 (888) 662-7467
                  </a>
                </p>
                <p className="pt-2">
                  <a href="mailto:info@naasirtravel.com" className="hover:text-primary-orange transition-colors">
                    info@naasirtravel.com
                  </a>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-t-4 border-blue-500"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <span className="text-3xl">🕐</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hours of Operation</h3>
              <div className="space-y-3 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">Sunday – Thursday</p>
                  <p>10:00 AM to 4:30 PM</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Friday and Saturday:</p>
                  <p>Closed</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Stat Holidays and Eid:</p>
                  <p>Closed</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Map and Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-4 rounded-3xl shadow-xl"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Us on the Map</h3>
                <p className="text-gray-600">Visit our office in Richmond, BC</p>
              </div>
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2608.6445847177444!2d-123.13639788436964!3d49.17584897931767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54860762c8a6d9c7%3A0x8e4b3e3c8c9c7f3f!2s6081%20No%203%20Rd%2C%20Richmond%2C%20BC%20V6Y%202B2%2C%20Canada!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
              <div className="mt-4">
                <a
                  href="https://www.google.com/maps/dir//6081+No+3+Rd,+Richmond,+BC+V6Y+2B2,+Canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Directions
                </a>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-3xl shadow-xl"
            >
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Send Us a Message</h3>
                <p className="text-gray-600">Fill out the form below and we&apos;ll get back to you shortly</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors"
                      placeholder="(604) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="packageInterest" className="block text-sm font-bold text-gray-900 mb-2">
                    Package of Interest
                  </label>
                  <select
                    id="packageInterest"
                    name="packageInterest"
                    value={formData.packageInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors"
                  >
                    <option value="">Select a package (optional)</option>
                    <option value="package-1">Winter Break Istanbul & Umrah Package A</option>
                    <option value="package-2">Winter Break Istanbul & Umrah Package B</option>
                    <option value="package-3">Winter Break Istanbul & Umrah Land Only</option>
                    <option value="package-4">Winter Break Umrah Land Only</option>
                    <option value="ramadan-standard">Standard Ramadan Package</option>
                    <option value="ramadan-vip">VIP Ramadan Package</option>
                    <option value="custom">Custom Package Inquiry</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors"
                    placeholder="Inquiry about your services"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary-blue focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about your travel plans..."
                  ></textarea>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-blue to-primary-orange text-white py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* Additional Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 bg-gradient-to-r from-blue-50 to-orange-50 p-8 sm:p-12 rounded-3xl border border-gray-200"
          >
            <div className="text-center max-w-3xl mx-auto">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-lg text-gray-700 mb-8">
                Whether you&apos;re planning Umrah, Hajj, or a custom vacation, our team is ready to assist you every step of the way. Contact us today to discuss your travel needs and let us create an unforgettable experience for you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.a
                  href="tel:+18886627467"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-orange text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Call Us Now
                </motion.a>
                <motion.button
                  onClick={() => router.push('/packages')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary-blue text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View Packages
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
