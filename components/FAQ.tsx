'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is the process to book a travel package?',
    answer: 'You can easily purchase directly on our website or contact us to learn more about your ideal package. Once you\'re happy with the details, we\'ll confirm everything and process your payment—then leave the rest to us.',
  },
  {
    question: 'How far in advance should I book Umrah packages?',
    answer: 'We recommend booking at least 3 months before your preferred departure date for low season, or 5 months ahead during peak seasons, to secure the best options. Pricing and availability can change at any moment, so early booking ensures your spot—rates are not guaranteed until payment is processed.',
  },
  {
    question: 'Are your packages fully halal and Muslim-friendly?',
    answer: 'In Muslim countries, we ensure 100% halal experiences. For non-Muslim countries, we do our utmost to make your trip as Muslim-friendly as possible.',
  },
  {
    question: 'Do you offer custom tours and packages?',
    answer: 'Yes, we offer customized tours and packages tailored to your needs.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We gladly accept credit cards, bank transfers, Stripe, E-Transfer, and cheques. Full payment is due upon booking, though we offer flexible installments on a case-by-case basis.',
  },
  {
    question: 'Is travel insurance included?',
    answer: 'Travel insurance is not included; we warmly recommend all travelers secure coverage for a worry-free journey.',
  },
  {
    question: 'What is your cancellation and refund policy?',
    answer: 'Please refer to our detailed terms and conditions for the full cancellation and refund policy.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'We are available in person or by phone during our regular business hours (Pacific Time). Please note we are not a 24/7 operation—if you\'re facing an emergency while we\'re offline (e.g., overnight), response may be delayed, so always connect with your assigned local representative. Outside hours, email us with "Urgent" in the subject line.',
  },
  {
    question: 'What documents are needed for international trips?',
    answer: 'A valid passport with at least 6 months validity from your return date.',
  },
  {
    question: 'Do you process visas?',
    answer: 'Yes, we handle Umrah and tourist visas to Saudi Arabia as part of your package price (unless otherwise stated). Some passports may incur additional visa costs, and we\'ll clearly communicate if so. For other countries, we don\'t process visas—please check with the relevant embassy or authority. We\'re happy to help confirm if you need one.',
  },
  {
    question: 'Can you accommodate dietary restrictions or special needs?',
    answer: 'For airlines, we can request special meals and mobility assistance. On the ground, we\'ll do our best to accommodate gluten-free, allergies, or other needs, though we can\'t guarantee availability in all locations.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our travel packages and services
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 text-lg pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="/contact"
            className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
