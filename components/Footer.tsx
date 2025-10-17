'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl sm:text-2xl font-extrabold mb-4">
              <span className="text-primary-blue">Naasir</span>
              <span className="text-primary-orange"> Travel</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your trusted partner for Hajj, Umrah, and worldwide travel experiences.
            </p>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-bold mb-4 text-primary-orange">Contact Us</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-start">
                <span className="mr-2">📍</span>
                <span>#803 – 6081 No. 3 RD<br />Richmond, British Columbia<br />V6Y 2B1</span>
              </p>
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                <span>
                  <a href="tel:+18886627467" className="hover:text-primary-orange transition-colors">
                    +1 (888)-662-7467
                  </a>
                  <br />
                  <a href="tel:+16043300307" className="hover:text-primary-orange transition-colors">
                    +1 (604) 330-0307
                  </a>
                </span>
              </p>
              <p className="flex items-center">
                <span className="mr-2">✉️</span>
                <a href="mailto:info@naasirtravel.com" className="hover:text-primary-orange transition-colors">
                  info@naasirtravel.com
                </a>
              </p>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold mb-4 text-primary-orange">Hours of Operation</h4>
            <div className="space-y-2 text-gray-400">
              <p>Sunday to Thursday:<br />10:00 AM to 4:00 PM</p>
              <p>Friday and Saturday:<br />Closed</p>
              <p>Stat Holidays and Eid:<br />Closed</p>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold mb-4 text-primary-orange">Useful Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#packages" className="text-gray-400 hover:text-primary-orange transition-colors">
                  Our Tour Packages
                </Link>
              </li>
              <li>
                <Link href="#testimonials" className="text-gray-400 hover:text-primary-orange transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-400 hover:text-primary-orange transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Bringing you closer to your dream destinations with care and expertise.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
