'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const expectations = [
  {
    icon: '📋',
    title: 'Full Nusuk Support',
    desc: 'Clear, step-by-step guidance during every key Nusuk phase — registration, profile setup, package selection, purchase, and receiving your visa and tickets — while you remain in full control of your own account.',
  },
  {
    icon: '🔗',
    title: 'Correct Package Linking',
    desc: 'Help understanding Nusuk package options and selecting the specific service provider and package required to join our guided group. You still click and pay within your own Nusuk account.',
  },
  {
    icon: '🎓',
    title: 'Pre-Hajj Workshop',
    desc: 'One structured workshop after Ramadan covering Hajj rituals, health and safety, packing, and a realistic day-by-day schedule for Hajj 2027 based on the latest guidance from our partnered Saudi Hajj service provider.',
  },
  {
    icon: '💬',
    title: 'Hajj 2027 WhatsApp Group',
    desc: 'A dedicated group chat serving as the main channel for schedules, meeting points, updates, reminders, and Q&A before departure and throughout the days of Hajj.',
  },
  {
    icon: '📡',
    title: 'Direct Line to Service Provider',
    desc: 'We maintain direct communication with our selected Saudi Hajj service provider so we can relay instructions, timing changes, and logistical updates to you quickly and clearly.',
  },
  {
    icon: '🕌',
    title: 'On-the-Ground Group Guidance',
    desc: 'Coordination and reminders during the key days of Hajj. We receive transport timings from the Hajj service provider and relay real-time updates so you know exactly what to do and where to be.',
  },
  {
    icon: '🤝',
    title: 'Realistic Expectations',
    desc: 'Honest, transparent communication about schedule changes, delays, or limitations outside our control — including traffic, crowd management, or decisions by Saudi authorities.',
  },
  {
    icon: '📍',
    title: 'Local Team Support',
    desc: 'A team based in Richmond, BC, that understands travel logistics, documentation, and time zones — supporting pilgrims wherever they are travelling from (as long as Nusuk allows booking with our chosen provider).',
  },
];

const conduct = [
  {
    title: 'Be clear about your intention',
    desc: 'Let us know whether you are just learning about Hajj or actively planning to go in the upcoming season, so we can support you appropriately.',
  },
  {
    title: 'Join our group if you rely on us',
    desc: 'If you are actively preparing and relying on our ongoing guidance over many weeks or months, we kindly expect you to join Naasir Travel\'s guided group and select the Nusuk service provider we are working with.',
  },
  {
    title: 'Fair use of our guidance',
    desc: 'Our detailed and ongoing support is designed for pilgrims who are part of our guided group. If you make extensive use of our help and then book with another provider, we may limit further one-to-one assistance.',
  },
  {
    title: 'Respectful use of our time',
    desc: 'We are not available 24/7. Please read all shared materials first — they answer most questions. Avoid expecting instant replies; we will respond during working hours and may refer you to prior answers rather than repeating them.',
  },
  {
    title: 'Use channels wisely',
    desc: 'Keep general questions for group sessions or the WhatsApp group. Reserve one-to-one questions for matters that genuinely need personal attention.',
  },
  {
    title: 'Follow instructions during Hajj',
    desc: 'Respect group timings, meeting points, and instructions during Hajj, recognising that movements are tightly controlled by Saudi authorities and fixed transport schedules.',
  },
  {
    title: 'Take care of your health',
    desc: 'Consult your doctor, manage your medications, and prepare physically for heat, extensive walking, and large crowds.',
  },
  {
    title: 'Maintain patience, respect, and adab',
    desc: 'Treat fellow pilgrims, Naasir Travel staff, and service-provider personnel with patience and respect — especially in stressful moments.',
  },
];

const nusukSteps = [
  'Create a Nusuk account and upload your documents.',
  'Browse approved Hajj packages from licensed Saudi service providers.',
  'Choose the specific provider and package we indicate to link your booking to our group.',
  'Complete secure online payment inside your own Nusuk account.',
];

export default function Hajj2027Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 pt-20">
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
              Hajj 2027 · Guidance & Group Coordination
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
            <br />
            <span className="text-3xl sm:text-4xl font-bold text-gray-300">with Naasir Travel</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Register for Hajj 2027 guidance with a trusted guide. We walk you through every step of the
            official Nusuk process — while you remain in full control of your booking and payment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <a href="#register">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary-orange to-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-orange-500/30 transition-all duration-300"
              >
                Register for Hajj 2027 Guidance
              </motion.button>
            </a>
          </motion.div>
        </div>

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

      {/* ── INTRO ────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
              How We <span className="text-primary-blue">Help You</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6 text-center max-w-3xl mx-auto">
              Naasir Travel does <strong>not</strong> sell Hajj packages or take any Hajj payments. Instead,
              we <strong>guide you through every step of the Nusuk process</strong> — from registration to
              purchasing your Hajj package and receiving your visa and tickets — while you always complete
              the actual booking and payment inside your own Nusuk account.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">When you register with us, you will:</h3>
              <ul className="space-y-3">
                {[
                  'Receive clear information on how to apply for Hajj through Nusuk from your country of residence.',
                  'Know exactly which approved Saudi Hajj service provider and package to choose on Nusuk in order to be linked to our group.',
                  'Stay informed through our Hajj 2027 WhatsApp group and by attending our pre-Hajj workshop before you travel.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-blue text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">{i + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-sm text-gray-500 text-center italic">
              Registration with Naasir Travel is <strong>for guidance, information, and group coordination only</strong> — not
              for purchasing a Hajj package or securing a visa spot. Those are handled entirely through Nusuk
              and its authorised Saudi Hajj service providers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── HOW NUSUK WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              How Hajj Booking Works{' '}
              <span className="text-primary-orange">(Nusuk Only)</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              All Hajj bookings under the Direct Hajj Program must be completed on the official Nusuk
              Hajj platform — the only approved digital system overseen by the Ministry of Hajj and Umrah.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {nusukSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4"
              >
                <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-blue to-blue-700 text-white rounded-full flex items-center justify-center font-extrabold text-lg shadow-md">
                  {i + 1}
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-primary-orange/10 border border-primary-orange/30 rounded-2xl p-6 text-center"
          >
            <p className="text-gray-800 font-medium">
              Naasir Travel will <strong>never</strong> take payment for Hajj packages. Your booking and
              funds stay within Nusuk and with the authorised Saudi Hajj service provider you select.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── WHAT YOU CAN EXPECT ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              What You Can Expect{' '}
              <span className="text-primary-blue">with Naasir Travel</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              When you register for Hajj 2027 guidance, here is what we provide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {expectations.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Important disclaimer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
          >
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Important:</strong> Naasir Travel is <strong>not</strong> a Hajj service provider and
              does <strong>not</strong> control or guarantee services delivered during Hajj (such as buses,
              accommodation, meals, or on-site facilities). These are fully managed by your Saudi Hajj service
              provider through your Nusuk booking and are subject to local regulations and conditions.
              Naasir Travel serves only as a guide and group coordinator and does not receive your Hajj package
              payments. Your Hajj package is paid only through Nusuk. Optional add-on services such as qurbani
              may be arranged and paid through Naasir Travel separately.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CODE OF CONDUCT ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              What We Kindly{' '}
              <span className="text-primary-orange">Expect from You</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              To keep the group organised, safe, and fairly served, we have a simple code of conduct for
              our Hajj guidance.
            </p>
          </motion.div>

          <div className="space-y-4">
            {conduct.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <span className="flex-shrink-0 w-8 h-8 bg-primary-blue/10 text-primary-blue rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION CTA ─────────────────────────────────────────────────── */}
      <section id="register" className="py-20 bg-gradient-to-br from-blue-950 to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-10 sm:p-14 text-center"
          >
            <div className="text-6xl mb-6">🕋</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Register for{' '}
              <span className="text-primary-orange">Hajj 2027 Guidance</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Join Naasir Travel's guided group and let us support you through every step of the Nusuk
              process. Registration is for guidance and group coordination only — no package payments
              are taken by us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-primary-orange to-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-orange-500/30 transition-all duration-300"
                >
                  Register for Hajj 2027 Guidance
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

      {/* ── FOOTER DISCLAIMER ────────────────────────────────────────────────── */}
      <div className="bg-gray-100 py-5 px-4 text-center">
        <p className="text-xs text-gray-500 max-w-3xl mx-auto leading-relaxed">
          All Hajj bookings, payments, visas, and on-the-ground services are provided solely through the
          official Nusuk Hajj platform and its approved Saudi Hajj service providers. Naasir Travel offers
          guidance and group coordination only and is not responsible for the delivery of package services.
        </p>
      </div>

      <Footer />
    </main>
  );
}
