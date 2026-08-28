export interface KBEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const knowledgeBase: KBEntry[] = [
  {
    id: 'contact-1',
    category: 'Contact',
    question: 'What is NaasirTravel contact information?',
    answer: `Naasir Travel contact information:
- Office line: 604-330-0307
- WhatsApp: 236-979-8030
- Email: Info@naasirtravel.com
- Address: 803 - 6081 No 3 Rd, Richmond, British Columbia

For anything the chatbot cannot answer confidently, users should be referred to the Contact page or one of these contact channels.`,
    keywords: ['contact', 'phone', 'office', 'whatsapp', 'email', 'address', 'location', 'richmond'],
  },
  {
    id: 'contact-2',
    category: 'Contact',
    question: 'What are NaasirTravel business hours?',
    answer: `Naasir Travel customer support hours are 10:00 AM to 4:30 PM, Monday to Friday, PST. Naasir Travel is closed on weekends, BC statutory holidays, and Eid.`,
    keywords: ['hours', 'business hours', 'open', 'closed', 'timezone', 'pst', 'weekend', 'holiday', 'eid'],
  },
  {
    id: 'lang-1',
    category: 'Languages',
    question: 'What languages does NaasirTravel support?',
    answer: `Naasir Travel primarily supports English. Somali support may be available when staff are available. Many customers also speak Somali, Arabic, Urdu, and Hindi. If the chatbot cannot confidently help in a requested language, it should ask the user to contact staff.`,
    keywords: ['language', 'languages', 'somali', 'arabic', 'urdu', 'hindi', 'english', 'translate'],
  },

  {
    id: 'packages-1',
    category: 'Packages',
    question: 'What package and travel services does NaasirTravel offer?',
    answer: `Naasir Travel offers:
- Umrah
- Global custom packages
- Flights
- Hotels
- Private and public tours
- Private transfers

Current packages and promotions are listed on the Packages page: https://naasirtravel.com/packages`,
    keywords: ['packages', 'services', 'what packages', 'packages offer', 'travel services', 'umrah', 'flights', 'hotels', 'tours', 'transfers', 'custom packages'],
  },
  {
    id: 'packages-2',
    category: 'Packages',
    question: 'What packages are currently available?',
    answer: `All available packages, seasonal offers, and promotions should be checked on the Packages page: https://naasirtravel.com/packages. If a user needs a package not listed there, they should contact Naasir Travel for a custom quote.`,
    keywords: ['available packages', 'current packages', 'promotions', 'seasonal', 'limited time', 'package page'],
  },
  {
    id: 'pricing-1',
    category: 'Pricing',
    question: 'How much does a package cost?',
    answer: `Naasir Travel should not provide rough package estimates without checking. Pricing depends on the destination, time of year, hotel type, number of passengers, and supplier availability. To avoid giving a false impression of pricing, users should check package details or contact Naasir Travel for an accurate quote.`,
    keywords: ['price', 'pricing', 'cost', 'quote', 'estimate', 'how much', 'rate', 'fare'],
  },
  {
    id: 'pricing-2',
    category: 'Pricing',
    question: 'Do you offer group discounts or family rates?',
    answer: `For group discounts, family rates, early-bird pricing, loyalty rewards, or any special pricing request, users should contact Naasir Travel directly for current information.`,
    keywords: ['discount', 'family rate', 'group discount', 'early bird', 'loyalty', 'reward'],
  },

  {
    id: 'payment-1',
    category: 'Payments',
    question: 'What payment methods does NaasirTravel accept?',
    answer: `Naasir Travel accepts credit cards, e-transfers, cheques, and bank drafts.`,
    keywords: ['payment', 'pay', 'credit card', 'etransfer', 'e-transfer', 'cheque', 'check', 'bank draft'],
  },
  {
    id: 'payment-2',
    category: 'Payments',
    question: 'Does NaasirTravel offer payment plans?',
    answer: `Payment schedules can be arranged on a case-by-case basis. Users should contact Naasir Travel to discuss whether a payment schedule is available for their booking.`,
    keywords: ['payment plan', 'payment schedule', 'installment', 'instalment', 'deposit', 'split payment'],
  },
  {
    id: 'payment-3',
    category: 'Payments',
    question: 'What is the cancellation or refund policy?',
    answer: `Cancellation and refund terms depend on the package and supplier rules. Users should refer to Naasir Travel's Terms and Conditions: https://naasirtravel.com/Terms_and_Conditions.pdf. The chatbot should not provide exact refund percentages or deadlines unless they are quoted from the terms.`,
    keywords: ['refund', 'cancellation', 'cancel', 'terms', 'conditions', 'deadline', 'percentage'],
  },
  {
    id: 'fees-1',
    category: 'Fees',
    question: 'Are there hidden fees or surcharges?',
    answer: `Naasir Travel packages include all applicable package fees. However, airlines and hotels may charge surcharges for additional services such as baggage, seat selection, meals, and other extras.`,
    keywords: ['hidden fees', 'surcharge', 'baggage', 'seat selection', 'meals', 'extra fees'],
  },

  {
    id: 'booking-1',
    category: 'Booking',
    question: 'How do I book a package?',
    answer: `A typical booking process is:
1. Visit the Packages page and review available packages.
2. Select a package or contact Naasir Travel for a custom request.
3. Provide traveller details and required documents.
4. Naasir Travel confirms availability and pricing based on current supplier availability.
5. Follow the payment instructions or agreed payment schedule.
6. Receive follow-up documents and updates from Naasir Travel by email, WhatsApp, or through your account where available.

The chatbot is advisory-only and should not claim to initiate or complete bookings by itself.`,
    keywords: ['book', 'booking', 'reserve', 'steps', 'process', 'booking process', 'how to book', 'how do i book', 'book a package', 'guide'],
  },
  {
    id: 'booking-2',
    category: 'Booking',
    question: 'What documents are required to book?',
    answer: `At the time of booking, Naasir Travel requires traveller information, passport information, scanned passport copies, and home address. For Saudi Arabia travel, one passport-sized photo is also required.`,
    keywords: ['documents', 'passport', 'passport copy', 'home address', 'photo', 'required documents', 'booking documents', 'umrah documents', 'documents for umrah', 'saudi documents'],
  },
  {
    id: 'booking-3',
    category: 'Booking',
    question: 'How far in advance should I book?',
    answer: `Bookings can be made at any time, but Naasir Travel recommends booking as early as possible to help secure the best available rates.`,
    keywords: ['advance', 'early', 'when book', 'how far', 'deadline', 'best rates'],
  },
  {
    id: 'booking-4',
    category: 'Booking',
    question: 'Can I modify a confirmed booking?',
    answer: `After booking confirmation, modifications depend on supplier policies, including hotels, transfers, airlines, and other providers. Fees and availability are supplier-dependent, so users should contact Naasir Travel before assuming a change is possible.`,
    keywords: ['modify', 'change booking', 'amend', 'confirmed booking', 'supplier policy', 'fees'],
  },
  {
    id: 'booking-5',
    category: 'Booking',
    question: 'Can one person book for a family or group?',
    answer: `Yes. One person can book for their family. Rules for adding dependents or other travellers may depend on supplier policies such as airlines and hotels.`,
    keywords: ['family', 'group', 'multiple travellers', 'dependents', 'dependants', 'one person book'],
  },
  {
    id: 'booking-6',
    category: 'Booking',
    question: 'What happens if a package sells out or NaasirTravel cancels a trip?',
    answer: `If a package is sold out, pricing and availability will depend on current supplier availability and pricing. If a trip is cancelled, users should review Naasir Travel's Terms and Conditions: https://naasirtravel.com/Terms_and_Conditions.pdf.`,
    keywords: ['sold out', 'cancelled trip', 'canceled trip', 'availability', 'supplier availability'],
  },

  {
    id: 'umrah-1',
    category: 'Umrah and Hajj',
    question: 'What are current vaccine requirements for Saudi Arabia travel?',
    answer: `Vaccine requirements only apply to those going for Hajj, and may also apply to travellers from specific countries. For travellers from Canada going for tourism or Umrah, no vaccine is required at this time. Requirements can change, so users should contact Naasir Travel or check official Saudi guidance before travelling.`,
    keywords: ['vaccine', 'vaccination', 'saudi', 'umrah vaccine', 'hajj vaccine', 'canada', 'health requirement'],
  },
  {
    id: 'umrah-2',
    category: 'Umrah and Hajj',
    question: 'Do women need a mahram for Umrah or Hajj?',
    answer: `Mahrams are no longer required for single women to travel for Umrah or Hajj. However, Saudi government policy can change, so users should confirm current rules before booking or travel.`,
    keywords: ['mahram', 'women', 'single women', 'guardian', 'female traveller'],
  },
  {
    id: 'umrah-3',
    category: 'Umrah and Hajj',
    question: 'Does NaasirTravel provide Umrah orientation or guides?',
    answer: `Naasir Travel provides in-person Umrah orientations when available. If an in-person orientation is not available, online resources on how to perform Umrah may be provided. All Umrah packages include Umrah guides by default.`,
    keywords: ['orientation', 'umrah guide', 'first time', 'pre departure', 'resources', 'how perform umrah'],
  },
  {
    id: 'umrah-4',
    category: 'Umrah and Hajj',
    question: 'Are there age restrictions for Umrah or Hajj?',
    answer: `For Umrah, there are no age restrictions, but travellers under 18 must travel with a guardian to obtain their visa. For Hajj, policies can change, so users should wait for the Saudi government to announce current Hajj policies.`,
    keywords: ['age', 'restriction', 'child', 'children', 'children allowed', 'kids', 'under 18', 'minor', 'guardian', 'hajj age', 'umrah age'],
  },
  {
    id: 'umrah-5',
    category: 'Umrah and Hajj',
    question: 'Does NaasirTravel control Hajj quotas or lottery applications?',
    answer: `All Hajj packages from western countries are handled through the Nusuk Hajj platform. Quotas are set by the Saudi government for each country. Travel agencies in countries that are part of the Nusuk Hajj platform do not control or receive allocated quotas from the Saudi government.`,
    keywords: ['hajj', 'quota', 'lottery', 'nusuk', 'hajj platform', 'government quota'],
  },
  {
    id: 'umrah-6',
    category: 'Umrah and Hajj',
    question: 'What are the Ihram rules or dress code?',
    answer: `Naasir Travel has resources about Ihram rules and dress code. If a user needs exact religious or package-specific guidance, direct them to Naasir Travel's Ihram resources or staff. The chatbot can give general guidance but should avoid issuing religious rulings as definitive.`,
    keywords: ['ihram', 'dress code', 'clothing', 'men', 'women', 'rules'],
  },
  {
    id: 'umrah-7',
    category: 'Umrah and Hajj',
    question: 'Does NaasirTravel help with Saudi Arabia visas?',
    answer: `Naasir Travel can help with Saudi Arabia travel needs for Umrah and Hajj packages where applicable. Required documents commonly include traveller information, passport information, scanned passport copies, home address, and for Saudi Arabia travel, one passport-sized photo. Exact visa requirements can change, so users should confirm with Naasir Travel.`,
    keywords: ['visa', 'saudi visa', 'umrah visa', 'hajj visa', 'passport photo', 'requirements'],
  },

  {
    id: 'destinations-1',
    category: 'Destinations',
    question: 'Which destinations does NaasirTravel serve outside Saudi Arabia?',
    answer: `Naasir Travel services almost every country. If a user does not see a package that fits their needs on the website, they should contact Naasir Travel for help with a custom package.`,
    keywords: ['destination', 'country', 'global', 'international', 'outside saudi', 'custom trip'],
  },
  {
    id: 'destinations-2',
    category: 'Destinations',
    question: 'Does NaasirTravel use specific airlines, hotels, or transfer providers?',
    answer: `Naasir Travel does not partner exclusively with specific suppliers. Supplier choices can vary by package, destination, availability, and traveller needs.`,
    keywords: ['airline', 'hotel', 'supplier', 'partner', 'transport', 'transfer provider'],
  },
  {
    id: 'destinations-3',
    category: 'Destinations',
    question: 'Are there destinations NaasirTravel does not serve?',
    answer: `Naasir Travel has not listed specific destinations it does not serve. Users should contact Naasir Travel if they have a destination in mind.`,
    keywords: ['do not serve', 'unsupported destination', 'destination not listed'],
  },
  {
    id: 'insurance-1',
    category: 'Travel Insurance',
    question: 'Does NaasirTravel provide travel insurance?',
    answer: `Naasir Travel does not provide travel insurance. They recommend an insurance broker for insurance needs: Athar Siddiqui, contact number 892-7800. Users should contact Naasir Travel if they need clarification before relying on insurance details.`,
    keywords: ['insurance', 'travel insurance', 'broker', 'athar', 'siddiqui'],
  },

  {
    id: 'account-1',
    category: 'Account and Dashboard',
    question: 'What can users manage in their dashboard?',
    answer: `Users can manage documents and quotations, download invoices, and amend personal information in their account dashboard.`,
    keywords: ['dashboard', 'account', 'documents', 'quotations', 'invoice', 'personal information'],
  },
  {
    id: 'account-2',
    category: 'Account and Dashboard',
    question: 'How do users reset a password or recover an account?',
    answer: `Users should follow the reset password prompts on the login screen. If they still cannot access the account, they should contact Naasir Travel.`,
    keywords: ['password', 'reset', 'forgot password', 'locked account', 'recover account', 'login'],
  },
  {
    id: 'account-3',
    category: 'Account and Dashboard',
    question: 'Can users download invoices or travel documents?',
    answer: `Users can currently download invoices from their account. Other documents, such as tickets, hotel confirmations, and visas, will be sent by email or WhatsApp.`,
    keywords: ['download', 'invoice', 'booking confirmation', 'visa letter', 'ticket', 'hotel confirmation'],
  },
  {
    id: 'account-4',
    category: 'Account and Dashboard',
    question: 'Is there a NaasirTravel mobile app?',
    answer: `Naasir Travel is currently web-only and does not have a mobile app.`,
    keywords: ['mobile app', 'app', 'ios', 'android', 'web only'],
  },

  {
    id: 'policy-1',
    category: 'Privacy and Terms',
    question: 'What is NaasirTravel privacy policy in plain language?',
    answer: `When a passenger, parent, or guardian registers, they acknowledge that Naasir Travel may share personal information with companies involved in providing travel services, including tour operators, airlines, hotels, and other travel-related companies. Registered passengers, parents, or guardians also agree to be contacted by Naasir Travel by email, phone, or mail with trip-related information. Photographs or videos taken of passengers by Naasir Travel or its affiliates remain the property of Naasir Travel and may be used for promotional or marketing purposes without further permission or compensation.`,
    keywords: ['privacy', 'personal information', 'data', 'photos', 'video', 'marketing', 'share information'],
  },
  {
    id: 'policy-2',
    category: 'Privacy and Terms',
    question: 'How does NaasirTravel handle complaints or disputes?',
    answer: `If a customer has a complaint or dispute, Naasir Travel asks that they come directly to the team. In many cases, issues can be resolved after discussing them together.`,
    keywords: ['complaint', 'dispute', 'issue', 'problem', 'resolution'],
  },
  {
    id: 'policy-3',
    category: 'Trust and Registration',
    question: 'Is NaasirTravel registered with travel industry bodies?',
    answer: `Naasir Travel is registered with IATA, BC Consumer Protection, and the City of Richmond.`,
    keywords: ['iata', 'bc consumer protection', 'city of richmond', 'registered', 'license', 'trust'],
  },
  {
    id: 'policy-4',
    category: 'Privacy and Terms',
    question: 'What terms do customers often misunderstand?',
    answer: `Customers may misunderstand the Hajj process and responsibilities involved. Users should refer to Naasir Travel's Hajj page for more information and contact staff if they need help understanding the process.`,
    keywords: ['misunderstanding', 'hajj process', 'responsibilities', 'terms', 'hajj page'],
  },

  {
    id: 'bot-1',
    category: 'Chatbot Rules',
    question: 'When should the chatbot redirect to a human?',
    answer: `The chatbot should redirect to a human agent whenever it does not have the answer, when pricing needs to be checked, when refund or cancellation terms require exact interpretation, when supplier policies affect an answer, or when a user needs help with a specific booking or account issue.`,
    keywords: ['human', 'agent', 'handoff', 'redirect', 'unknown', 'specific booking', 'specific account', 'speak to someone', 'speak to a person', 'representative', 'staff support'],
  },
  {
    id: 'bot-2',
    category: 'Chatbot Rules',
    question: 'What should the chatbot say if it does not know the answer?',
    answer: `If the chatbot genuinely does not know the answer, it should say that it does not have enough information and refer the user to Naasir Travel's Contact page or contact channels. It should not guess.`,
    keywords: ['do not know', 'unknown', 'not sure', 'contact page', 'guess'],
  },
  {
    id: 'bot-3',
    category: 'Chatbot Rules',
    question: 'Should the chatbot check booking status or start bookings?',
    answer: `The chatbot should stay advisory-only. It should not claim to check real-time booking status from the database and should not initiate bookings by itself.`,
    keywords: ['booking status', 'real time', 'database', 'initiate booking', 'advisory only'],
  },
  {
    id: 'faq-1',
    category: 'FAQ',
    question: 'What are the most common questions NaasirTravel receives?',
    answer: `Common questions include:
- What packages do you currently offer?
- How much does a package cost?
- What is included in the package?
- How do I book a package?
- What documents do I need to book?
- What are your payment methods?
- What is your cancellation or refund policy?
- Do you help with Umrah and Hajj travel?
- Can you help with visas for Saudi Arabia?
- How can I contact your team for more information?

The website FAQ is available at https://naasirtravel.com/#faq`,
    keywords: ['faq', 'common questions', 'top questions', 'frequently asked'],
  },
  {
    id: 'faq-2',
    category: 'FAQ',
    question: 'What misunderstandings should the chatbot prevent?',
    answer: `The chatbot should help prevent misunderstandings about:
- Pricing changes and the need for a custom quote
- Refund expectations and cancellation terms
- Required booking documents
- Supplier-based changes after booking confirmation
- The Hajj process and who is responsible for quotas and policies`,
    keywords: ['misunderstanding', 'complaints', 'pricing changes', 'refund expectations', 'supplier changes', 'hajj process'],
  },
];

export default knowledgeBase;
