'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const requirementGroups = [
  {
    title: 'Travel Documents',
    icon: '📄',
    items: [
      'Valid passport (minimum 6 months validity beyond travel date)',
      'Hajj visa issued by the Saudi Arabian consulate',
      'Original birth certificate or marriage certificate (for women travelling with mahram)',
      'Recent passport-sized photographs (white background)',
    ],
  },
  {
    title: 'Health & Vaccinations',
    icon: '💉',
    items: [
      'Meningococcal meningitis (ACYW135) vaccine — mandatory',
      'COVID-19 vaccination certificate',
      'Polio vaccine (for travellers from certain countries)',
      'General health screening and medical clearance letter',
      'Sufficient personal medications with prescriptions',
    ],
  },
  {
    title: 'Financial Requirements',
    icon: '💰',
    items: [
      'Full payment of Hajj package before registration deadline',
      'Proof of financial capability (istita\'a) for independent applicants',
      'Travel insurance covering medical emergencies',
      'Sufficient spending money for personal expenses in Makkah & Madinah',
    ],
  },
  {
    title: 'Clothing & Ihram',
    icon: '🕌',
    items: [
      'Men: two pieces of unstitched white Ihram cloth',
      'Women: modest, loose-fitting clothing (no specific Ihram requirement)',
      'Comfortable walking shoes for long distances',
      'Light layers for varying temperatures (hot days, cool nights)',
      'Unscented soap, shampoo, and toiletries for Ihram state',
    ],
  },
];

const timeline = [
  { phase: 'Registration Opens', date: 'Early 2026', desc: 'Applications open — secure your spot early as quotas fill fast.' },
  { phase: 'Document Submission', date: 'Mid 2026', desc: 'Submit all required documents for visa processing.' },
  { phase: 'Vaccinations Deadline', date: 'Late 2026', desc: 'Ensure all mandatory vaccinations are up to date.' },
  { phase: 'Final Payment', date: 'Early 2027', desc: 'Full package payment must be completed before this date.' },
  { phase: 'Hajj 2027', date: 'Jan / Feb 2027', desc: 'Dhul Hijja 1448 AH — the sacred days of Hajj.' },
];

export default function Hajj2027Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 pt-20">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-orange/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/30 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block bg-primary-orange/20 text-primary-orange border border-primary-orange/40 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-6">
              1448 AH · January / February 2027
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6"
          >
            Hajj{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange to-yellow-400">
              2027
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The most sacred journey of a lifetime. Naasir Travel is preparing exclusive Hajj 2027 packages
            — join thousands of pilgrims from Canada on this transformative spiritual experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-orange to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-orange-500/30 transition-all duration-300"
              >
                Register Your Interest
              </motion.button>
            </Link>
            <a href="#requirements">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                View Requirements
              </motion.button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-16"
          >
            {[
              { value: '30+', label: 'Years Experience' },
              { value: '5★', label: 'Hotel Ratings' },
              { value: '24/7', label: 'On-Ground Support' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-primary-orange">{stat.value}</p>
                <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* What is Hajj */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">What is <span className="text-primary-blue">Hajj?</span></h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
              The fifth pillar of Islam, Hajj is an annual pilgrimage to the holy city of Makkah, Saudi Arabia.
              It is obligatory once in a lifetime for every Muslim who is physically and financially able — a deeply
              spiritual journey of devotion, sacrifice, and unity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🕋',
                title: 'Tawaf',
                desc: 'Circumambulating the Kaaba seven times in a counter-clockwise direction at Masjid al-Haram.',
              },
              {
                icon: '🏔️',
                title: "Wuquf at Arafat",
                desc: "Standing on the plains of Arafat from noon until sunset — the pinnacle and heart of Hajj.",
              },
              {
                icon: '🌙',
                title: 'Mina & Stoning',
                desc: 'Spending nights in Mina and performing the symbolic stoning of the devil at Jamarat.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section id="requirements" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              What You'll <span className="text-primary-orange">Need</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              Prepare early — Hajj requires careful planning across documents, health, and finances.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {requirementGroups.map((group, i) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl">{group.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900">{group.title}</h3>
                </div>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-600">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Key <span className="text-primary-blue">Dates</span>
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Plan ahead — Hajj preparation starts over a year in advance.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-blue via-primary-orange to-primary-blue md:-translate-x-0.5" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`hidden md:block md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 text-right' : 'md:pl-12 text-left'}`}>
                    <p className="text-sm font-semibold text-primary-orange uppercase tracking-wide">{item.date}</p>
                    <h4 className="text-lg font-bold text-gray-900 mt-1">{item.phase}</h4>
                    <p className="text-gray-500 mt-1 text-sm">{item.desc}</p>
                  </div>

                  {/* Dot */}
                  <div className="flex-shrink-0 relative z-10 w-12 h-12 bg-gradient-to-br from-primary-blue to-blue-700 rounded-full flex items-center justify-center shadow-lg text-white font-bold md:absolute md:left-1/2 md:-translate-x-1/2">
                    {i + 1}
                  </div>

                  {/* Mobile content */}
                  <div className="md:hidden flex-1">
                    <p className="text-sm font-semibold text-primary-orange uppercase tracking-wide">{item.date}</p>
                    <h4 className="text-lg font-bold text-gray-900 mt-1">{item.phase}</h4>
                    <p className="text-gray-500 mt-1 text-sm">{item.desc}</p>
                  </div>

                  <div className="hidden md:block md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="py-20 bg-gradient-to-br from-blue-950 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-10 sm:p-14 text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-6xl mb-6 inline-block"
            >
              🔔
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              More Details <span className="text-primary-orange">Coming Soon</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              We are currently finalising our exclusive Hajj 2027 packages — including pricing, hotel options,
              group departure dates, and guided itineraries. Register your interest now and be the first to know
              when full details are released.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary-orange to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
                >
                  Register Interest
                </motion.button>
              </Link>
              <a href="tel:+18886627467">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Call Us: +1 (888) 662-7467
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
