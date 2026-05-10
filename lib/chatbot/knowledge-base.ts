export interface KBEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const knowledgeBase: KBEntry[] = [
  // ─── PLATFORM: BOOKING PROCESS ───────────────────────────────────────────
  {
    id: 'book-1',
    category: 'Booking Process',
    question: 'How do I book a tour or package on NaasirTravel?',
    answer: `Booking on NaasirTravel is simple — here's how:
1. **Browse Packages** — Go to the Packages page and explore all available tours.
2. **Select a Package** — Click on any tour to view full details, inclusions, and pricing.
3. **Click "Book Now"** — This opens the booking form on the tour detail page.
4. **Fill in Your Details** — Enter your name, email, phone number, and number of travellers.
5. **Proceed to Payment** — You'll be redirected to our secure Stripe payment page.
6. **Confirm Booking** — After successful payment, you'll receive a confirmation email and your booking will appear in your dashboard.

If you have an account, your details are pre-filled automatically!`,
    keywords: ['book', 'booking', 'how to book', 'steps', 'reserve', 'purchase', 'tour', 'package', 'process'],
  },
  {
    id: 'book-2',
    category: 'Booking Process',
    question: 'Do I need an account to book a tour?',
    answer: `Yes, you need a NaasirTravel account to complete a booking. Creating one is free and takes less than a minute:
- Click **Sign Up** in the top navigation
- Enter your name, email, and a password
- Verify your email
- You're in!

Having an account lets you track your bookings, download invoices, manage dependants, and submit visa applications — all from your personal dashboard.`,
    keywords: ['account', 'register', 'sign up', 'login', 'need account', 'create account'],
  },
  {
    id: 'book-3',
    category: 'Booking Process',
    question: 'Can I book for multiple travellers at once?',
    answer: `Yes! When filling in the booking form, simply enter the total **number of travellers** in the designated field. Each traveller's details (for visa applications, etc.) can then be managed through the **Dependants** section of your dashboard after booking.`,
    keywords: ['multiple', 'group', 'travellers', 'travelers', 'family', 'party', 'how many'],
  },
  {
    id: 'book-4',
    category: 'Booking Process',
    question: 'What happens after I book?',
    answer: `After a successful booking:
1. You'll receive a **confirmation email** with your booking reference number.
2. Your booking appears under **"My Bookings"** in your dashboard.
3. Our team will review your booking and may contact you for additional information.
4. You can submit **visa applications** for yourself and dependants from your dashboard.
5. An **invoice** will be available for download from the Invoices section.`,
    keywords: ['after booking', 'confirmation', 'next steps', 'what happens', 'email'],
  },

  // ─── PLATFORM: DEPENDANTS ────────────────────────────────────────────────
  {
    id: 'dep-1',
    category: 'Dependants',
    question: 'What are dependants on NaasirTravel?',
    answer: `Dependants are other travellers you add to your booking — typically family members such as a spouse, children, or parents. Instead of each person creating their own account, the **primary account holder** manages all dependants from their dashboard.

Each dependant has their own profile with travel documents, passport details, and visa application status tracked separately.`,
    keywords: ['dependant', 'dependent', 'family', 'child', 'spouse', 'member', 'add person'],
  },
  {
    id: 'dep-2',
    category: 'Dependants',
    question: 'How do I add a dependant to my booking?',
    answer: `To add a dependant:
1. Log in and go to your **Dashboard**.
2. Navigate to **"My Bookings"** and select the relevant booking.
3. Click **"Add Dependant"** within that booking.
4. Fill in the dependant's personal details: full name, date of birth, passport number, and relationship.
5. Upload any required documents (passport scan, photos).
6. Submit — your dependant is now linked to the booking.

You can add multiple dependants per booking. Each will have their own application status you can track.`,
    keywords: ['add dependant', 'add dependent', 'add family', 'add child', 'add member', 'how dependant'],
  },
  {
    id: 'dep-3',
    category: 'Dependants',
    question: 'Can I book for a child? Are there age restrictions?',
    answer: `Yes, you can include children in your booking as dependants. Age requirements vary by package:
- **Umrah packages** generally accept travellers of all ages, including infants.
- **Hajj packages** have specific age and health requirements set by Saudi authorities.
- **General tours** typically welcome children, with some adventure tours having minimum age requirements listed in the package details.

Always check the specific package details for age restrictions. Children under 18 must be accompanied by a parent or legal guardian.`,
    keywords: ['child', 'children', 'kid', 'age', 'restriction', 'infant', 'baby', 'minor', 'under 18'],
  },
  {
    id: 'dep-4',
    category: 'Dependants',
    question: 'Can I edit or remove a dependant?',
    answer: `Yes. From your Dashboard > Bookings, select the booking containing the dependant. You can:
- **Edit** their details (update passport info, upload new documents)
- **Remove** them before the booking is confirmed by admin

Once a booking is confirmed and processed, changes to dependants may require contacting our support team directly.`,
    keywords: ['edit dependant', 'remove dependant', 'update', 'change', 'delete dependant'],
  },

  // ─── PLATFORM: PACKAGES ──────────────────────────────────────────────────
  {
    id: 'pkg-1',
    category: 'Packages',
    question: 'What types of packages does NaasirTravel offer?',
    answer: `NaasirTravel specialises in:
- **Umrah Packages** — Economy, Standard, and Premium options with varying hotel grades and durations.
- **Hajj Packages** — Full guided packages including visa, accommodation in Makkah & Madinah, and transport.
- **International Tours** — Curated group and private tours to destinations worldwide.
- **Custom Packages** — Contact us to build a personalised itinerary.

Each package listing shows exactly what's included: flights, hotels, meals, guided tours, and visa support.`,
    keywords: ['packages', 'types', 'what offers', 'tour types', 'umrah', 'hajj', 'international', 'what includes'],
  },
  {
    id: 'pkg-2',
    category: 'Packages',
    question: 'What is typically included in an Umrah package?',
    answer: `Our Umrah packages typically include:
✅ Return flights (economy or business class depending on tier)
✅ Accommodation in Makkah (near Haram) & Madinah
✅ Umrah visa processing
✅ Airport transfers
✅ Daily transportation between holy sites
✅ 24/7 group guide support
✅ Some meal plans (varies by package tier)

Premium packages include 5-star hotels and private transport. Always check the individual package page for the full inclusions list.`,
    keywords: ['umrah', 'what included', 'inclusions', 'umrah package', 'flights', 'hotel', 'visa', 'makkah', 'madinah'],
  },
  {
    id: 'pkg-3',
    category: 'Packages',
    question: 'How do I find the right package for me?',
    answer: `Visit our **Packages** page to browse all current offerings. You can:
- View pricing, duration, and inclusions for each package
- Read detailed descriptions and itineraries
- Compare budget vs premium options

If you're unsure, **contact us** — our team will recommend the best option based on your group size, budget, dates, and preferences.`,
    keywords: ['find package', 'choose', 'right package', 'compare', 'recommend', 'best package'],
  },

  // ─── PLATFORM: PAYMENTS ──────────────────────────────────────────────────
  {
    id: 'pay-1',
    category: 'Payments',
    question: 'What payment methods does NaasirTravel accept?',
    answer: `We use **Stripe** for secure payment processing. Accepted methods include:
- Visa, Mastercard, American Express (credit & debit cards)
- Apple Pay and Google Pay (where supported)
- Some bank transfers (contact us for large group bookings)

All transactions are encrypted and PCI-DSS compliant. You will receive a payment receipt via email.`,
    keywords: ['payment', 'pay', 'credit card', 'debit card', 'stripe', 'method', 'how to pay', 'apple pay'],
  },
  {
    id: 'pay-2',
    category: 'Payments',
    question: 'Can I pay in instalments?',
    answer: `Currently, our platform processes the full payment at the time of booking. For group bookings or special arrangements, please **contact our team directly** — we may be able to arrange a payment plan depending on the package and lead time before departure.`,
    keywords: ['instalment', 'installment', 'payment plan', 'deposit', 'part payment', 'split payment'],
  },
  {
    id: 'pay-3',
    category: 'Payments',
    question: 'What is the refund and cancellation policy?',
    answer: `Cancellation and refund policies vary by package:
- **More than 60 days before departure:** Full refund minus a processing fee
- **30–60 days before departure:** 50% refund
- **Less than 30 days:** Non-refundable (travel insurance is strongly recommended)

For Hajj and Umrah packages, visa and government fees are non-refundable once submitted. Please read the specific package terms before booking. To initiate a cancellation, log in to your dashboard or contact our support team.`,
    keywords: ['refund', 'cancel', 'cancellation', 'policy', 'money back', 'withdraw', 'change booking'],
  },
  {
    id: 'pay-4',
    category: 'Payments',
    question: 'How do I get an invoice?',
    answer: `After a confirmed booking, your invoice is automatically generated. To access it:
1. Log in to your Dashboard
2. Click **"Invoices"** in the sidebar
3. Find your booking and click **Download Invoice** (PDF)

Invoices include your booking reference, package details, payment amount, and date.`,
    keywords: ['invoice', 'receipt', 'download', 'billing', 'payment confirmation'],
  },

  // ─── PLATFORM: ACCOUNTS ──────────────────────────────────────────────────
  {
    id: 'acc-1',
    category: 'Account',
    question: 'How do I reset my password?',
    answer: `If you've forgotten your password:
1. Go to the **Login** page
2. Click **"Forgot Password?"**
3. Enter your registered email address
4. Check your email for a reset link (check spam if not received within 5 minutes)
5. Click the link and enter a new password

The reset link expires after 1 hour for security reasons.`,
    keywords: ['password', 'forgot', 'reset', 'change password', 'locked out', 'cant login'],
  },
  {
    id: 'acc-2',
    category: 'Account',
    question: 'How do I update my profile information?',
    answer: `To update your profile:
1. Log in and click your name or avatar in the header
2. Navigate to **Dashboard > Profile**
3. Update your name, phone number, address, or upload a new photo
4. Click **Save Changes**

Keeping your profile up to date helps pre-fill booking forms faster.`,
    keywords: ['profile', 'update', 'edit', 'change name', 'change email', 'personal details'],
  },

  // ─── HAJJ & UMRAH KNOWLEDGE ───────────────────────────────────────────────
  {
    id: 'haj-1',
    category: 'Hajj & Umrah',
    question: 'What is the difference between Hajj and Umrah?',
    answer: `**Hajj** is the annual Islamic pilgrimage to Makkah — one of the Five Pillars of Islam. It takes place during specific days in the Islamic month of Dhul Hijjah and is obligatory once in a lifetime for every able Muslim.

**Umrah** is the "lesser pilgrimage" that can be performed at any time of year. It is not obligatory but highly recommended. While it shares some rituals with Hajj (Tawaf, Sa'i), it is shorter and less complex.

Key differences:
- Hajj: specific dates, more rituals, larger crowds, stricter visa quotas
- Umrah: year-round, shorter (2–3 hours for rituals), more flexible scheduling`,
    keywords: ['hajj', 'umrah', 'difference', 'pilgrimage', 'what is hajj', 'what is umrah', 'makkah', 'mecca'],
  },
  {
    id: 'haj-2',
    category: 'Hajj & Umrah',
    question: 'What documents are required for an Umrah visa?',
    answer: `Standard documents required for an Umrah visa include:
- Valid passport (minimum 6 months validity from travel date)
- Completed visa application form
- Passport-size photographs (white background)
- Proof of vaccination (meningitis vaccine is mandatory, COVID requirements may apply)
- Mahram certificate (for women under 45 travelling without a male guardian — rules have been relaxed, consult us)
- Proof of booking (provided by NaasirTravel)

Processing time is typically 3–7 business days. We handle the visa application on your behalf as part of your package.`,
    keywords: ['umrah visa', 'documents', 'visa requirements', 'passport', 'vaccination', 'mahram', 'application'],
  },
  {
    id: 'haj-3',
    category: 'Hajj & Umrah',
    question: 'What should I wear for Umrah?',
    answer: `**For men:** Ihram clothing — two pieces of unstitched white cloth (rida and izar). No underwear, socks, or sewn garments while in ihram state.

**For women:** Modest, loose-fitting clothing covering the entire body. A hijab is required. Women do not wear a specific ihram garment but must be in modest Islamic dress. Face veil (niqab) is not worn during ihram state according to most scholars.

Outside of ihram (at the hotel, travelling), comfortable modest clothing is recommended. Bring comfortable walking shoes — you will walk significant distances.`,
    keywords: ['wear', 'dress', 'ihram', 'clothing', 'what to wear', 'women', 'men', 'modest'],
  },
  {
    id: 'haj-4',
    category: 'Hajj & Umrah',
    question: 'What vaccinations are required for travel to Saudi Arabia?',
    answer: `For travel to Saudi Arabia for Hajj or Umrah, the following vaccinations are typically required or strongly recommended:
- **Meningococcal meningitis (ACWY)** — Mandatory for all pilgrims
- **COVID-19** — Requirements vary; check current Saudi health authority guidelines
- **Polio** — Required if travelling from endemic countries
- **Flu vaccine** — Strongly recommended due to large crowds
- **Typhoid** — Recommended
- **Hepatitis A & B** — Recommended

Consult your GP or travel health clinic at least 6–8 weeks before departure. We include vaccination guidance in our pre-travel documentation.`,
    keywords: ['vaccination', 'vaccine', 'immunisation', 'meningitis', 'saudi', 'health requirements', 'medical'],
  },

  // ─── GENERAL TRAVEL: VISAS & PASSPORTS ───────────────────────────────────
  {
    id: 'vis-1',
    category: 'Visas & Passports',
    question: 'How far in advance should I apply for a visa?',
    answer: `Visa processing times vary significantly by destination and applicant nationality:
- **Saudi Arabia (Umrah):** 3–7 business days through a licensed operator
- **Schengen (Europe):** Apply 3–6 months in advance; earliest 6 months before travel
- **USA:** B1/B2 tourist visa can take 2–12 weeks depending on consulate workload
- **UK:** Standard processing 3 weeks; priority 5 business days
- **East Africa (Kenya, Tanzania):** e-Visa often within 24–72 hours

**General rule:** Apply at least 8–12 weeks before travel for safety. Always check the official embassy website for the most current requirements.`,
    keywords: ['visa', 'apply', 'how long', 'processing', 'visa time', 'application', 'in advance'],
  },
  {
    id: 'vis-2',
    category: 'Visas & Passports',
    question: 'What is passport validity and why does it matter?',
    answer: `Most countries require your passport to be valid for at least **6 months beyond your travel dates**. Some (like Hong Kong, Singapore) only require 3 months validity.

If your passport expires within 6 months of travel, renew it before booking international flights. Processing times for passport renewal vary:
- Canada: 8–10 weeks (standard), 2–9 days (urgent)
- UK: Up to 10 weeks (standard)
- USA: 6–8 weeks (routine), 2–3 weeks (expedited)

Always check that your passport has enough **blank pages** for entry/exit stamps (typically 2 full blank pages required).`,
    keywords: ['passport', 'validity', 'expire', 'renew', 'blank pages', '6 months', 'passport validity'],
  },

  // ─── GENERAL TRAVEL: HEALTH & SAFETY ─────────────────────────────────────
  {
    id: 'hlth-1',
    category: 'Travel Health & Safety',
    question: 'What should I know about travel insurance?',
    answer: `Travel insurance is **strongly recommended** for all international travel. A good policy covers:
- **Medical emergencies & evacuation** — Hospital bills abroad can be catastrophic
- **Trip cancellation/interruption** — If you have to cancel due to illness or family emergency
- **Baggage loss or delay** — Reimbursement for lost/delayed luggage
- **Travel delay** — Compensation for missed connections
- **Personal liability** — In case of accidents abroad

For Hajj and Umrah specifically, given the scale of the pilgrimage and physical demands, medical coverage is essential. Our premium packages include travel insurance — check the package details or ask our team.`,
    keywords: ['insurance', 'travel insurance', 'medical', 'coverage', 'protection', 'cancel insurance'],
  },
  {
    id: 'hlth-2',
    category: 'Travel Health & Safety',
    question: 'What should I pack in a travel health kit?',
    answer: `A basic travel health kit should include:
- Prescription medications (sufficient supply + a few extra days)
- Pain relievers (paracetamol/ibuprofen)
- Antihistamines (allergies + insect bites)
- Anti-diarrhoeal medication (essential for Middle East/Africa travel)
- Hand sanitiser and antibacterial wipes
- Sunscreen (SPF 50+)
- Insect repellent (DEET-based for malaria zones)
- Oral rehydration salts (for heat exhaustion/dehydration)
- Blister plasters (especially for Hajj/Umrah — lots of walking!)
- Any vaccination records

Consult your GP 6–8 weeks before travel for destination-specific advice.`,
    keywords: ['health kit', 'medicine', 'pack', 'medication', 'first aid', 'what to bring', 'medical kit'],
  },
  {
    id: 'hlth-3',
    category: 'Travel Health & Safety',
    question: 'How do I stay safe while travelling abroad?',
    answer: `Key safety tips for international travel:
- **Register** with your country's embassy/consulate at your destination
- **Keep copies** of your passport, visa, and insurance docs (digital + physical)
- **Use hotel safes** for passports and valuables
- **Avoid flashy jewellery** and displaying expensive items in public
- **Use licensed taxis** or reputable ride-share apps only
- **Stay hydrated** — especially in hot climates like Saudi Arabia
- **Know emergency numbers** for your destination country
- **Keep someone at home** informed of your itinerary
- **Avoid protests** or large unplanned gatherings
- **Purchase travel insurance** before you depart`,
    keywords: ['safety', 'safe', 'tips', 'abroad', 'security', 'travelling safely', 'precautions'],
  },

  // ─── GENERAL TRAVEL: PACKING TIPS ────────────────────────────────────────
  {
    id: 'pack-1',
    category: 'Packing Tips',
    question: 'What are the most important things to pack for international travel?',
    answer: `**Essentials:**
- Passport + visa documents (+ photocopies)
- Travel insurance documents
- Local currency + credit/debit cards
- Phone charger + universal adapter
- Medications and health kit
- Comfortable walking shoes

**Smart additions:**
- Portable power bank
- Lightweight packable rain jacket
- Compression bags to save luggage space
- Reusable water bottle (many airports now have filtered water stations)
- Noise-cancelling earphones for long flights
- Download offline maps (Google Maps offline) before departure

**For Hajj/Umrah specifically:**
- Ihram clothing (men), modest outfits (women)
- Unscented soap, shampoo, and deodorant (required during ihram)
- Slip-on shoes (easy removal at mosque entrances)
- Small backpack for daily outings`,
    keywords: ['pack', 'packing', 'what to bring', 'luggage', 'essentials', 'suitcase', 'carry on'],
  },
  {
    id: 'pack-2',
    category: 'Packing Tips',
    question: 'What are airline baggage rules I should know about?',
    answer: `Baggage rules vary by airline, but general guidelines:
**Economy class:**
- Carry-on: typically 7–10 kg, max 55x40x20cm
- Checked baggage: 20–23 kg per bag (1–2 bags depending on airline/route)

**Important tips:**
- Weigh your bags at home before departure to avoid fees
- Liquids in carry-on must be ≤100ml each, in a 1L clear resealable bag (for most countries)
- Lithium batteries (power banks) must be in carry-on, NOT checked baggage
- Medications should be in original packaging in carry-on
- Always check your specific airline's policy — budget airlines (Ryanair, etc.) are much stricter

For group bookings through NaasirTravel, we'll confirm baggage allowances specific to your booked flights.`,
    keywords: ['baggage', 'luggage', 'airline', 'weight limit', 'carry on', 'checked bag', 'fees', 'allowance'],
  },

  // ─── GENERAL TRAVEL: MONEY & CURRENCIES ──────────────────────────────────
  {
    id: 'mon-1',
    category: 'Money & Currencies',
    question: 'What is the best way to manage money while travelling?',
    answer: `**Best practices for travel money:**
- Carry a **mix** of cash and cards — never rely on just one
- Use a **multi-currency travel card** (Wise, Revolut) to avoid poor exchange rates
- Notify your bank before travelling to prevent cards being blocked
- Withdraw local currency from ATMs at your destination (usually better rate than airport exchange)
- Avoid dynamic currency conversion (always pay in local currency)
- Keep some small denominations for tips, markets, and transport

**For Saudi Arabia:** The currency is Saudi Riyal (SAR). ATMs are widely available in Makkah and Madinah. Credit cards are accepted in most hotels and larger shops.`,
    keywords: ['money', 'currency', 'cash', 'exchange', 'card', 'ATM', 'travel money', 'riyal', 'bank'],
  },
  {
    id: 'mon-2',
    category: 'Money & Currencies',
    question: 'What currency is used in Saudi Arabia and how much spending money do I need?',
    answer: `**Currency:** Saudi Riyal (SAR). 1 CAD ≈ 2.7 SAR / 1 USD ≈ 3.75 SAR (rates fluctuate).

**Estimated daily spending (outside package inclusions):**
- Budget traveller: SAR 100–200/day (meals at local restaurants, minimal shopping)
- Mid-range: SAR 200–400/day
- Premium: SAR 400+/day

**Common expenses not in package:**
- Personal souvenirs and gifts (Makkah has excellent shopping near the Haram)
- Zamzam water containers (to take home)
- Additional meals outside included ones
- Phone SIM card (local SIM ~SAR 50)

NaasirTravel packages include meals in some tiers — check your specific package for what's covered.`,
    keywords: ['saudi', 'riyal', 'SAR', 'spending', 'how much money', 'currency saudi', 'budget'],
  },

  // ─── GENERAL TRAVEL: DESTINATIONS & TIPS ─────────────────────────────────
  {
    id: 'dest-1',
    category: 'Destinations & Travel Tips',
    question: 'What are some tips for travelling to the Middle East?',
    answer: `**Cultural tips for Middle East travel:**
- **Dress modestly** — Cover shoulders and knees in public. Women should carry a scarf.
- **Respect prayer times** — Some shops close briefly 5 times a day
- **Public displays of affection** — Keep minimal in public spaces
- **Photography** — Always ask permission before photographing people; avoid military/government buildings
- **Ramadan awareness** — Eating, drinking, and smoking in public during daylight hours is restricted
- **Alcohol** — Strictly prohibited in Saudi Arabia; allowed in licensed venues in UAE/Jordan
- **Right hand etiquette** — Use your right hand for eating and greetings
- **Tipping** — 10–15% in restaurants is appreciated

Saudi Arabia has modernised significantly — it's welcoming to tourists while maintaining Islamic values.`,
    keywords: ['middle east', 'tips', 'saudi', 'culture', 'respect', 'customs', 'dress', 'ramadan', 'etiquette'],
  },
  {
    id: 'dest-2',
    category: 'Destinations & Travel Tips',
    question: 'What is the best time of year to travel for Umrah?',
    answer: `**Best times for Umrah:**
- **Ramadan** — The most spiritually rewarding time, though very crowded and more expensive. The last 10 nights (Laylat al-Qadr) are peak season.
- **After Hajj season** — Crowds thin out and hotel prices drop significantly
- **Winter months (November–February)** — Cooler weather (15–25°C vs summer's 40°C+), more comfortable for elderly and those with health conditions
- **Avoid Hajj dates** — If not performing Hajj, avoid the Dhul Hijjah period as Makkah is at maximum capacity

NaasirTravel offers Umrah packages throughout the year. We recommend **winter travel** for first-timers for comfort. Contact us to find the best dates based on your availability.`,
    keywords: ['best time', 'when', 'umrah season', 'ramadan', 'weather', 'time of year', 'when to travel'],
  },
  {
    id: 'dest-3',
    category: 'Destinations & Travel Tips',
    question: 'What is the time difference between Canada and Makkah?',
    answer: `**Time zones:**
- Saudi Arabia is in **AST (Arabia Standard Time) — UTC+3**
- Canada spans multiple time zones:
  - British Columbia (Vancouver): UTC-7 → **10 hours behind Makkah**
  - Alberta (Calgary): UTC-6 → **9 hours behind Makkah**
  - Ontario (Toronto): UTC-4 → **7 hours behind**

**Practical tips:**
- Adjust your sleep schedule a few days before departure
- Stay hydrated during the flight to combat jet lag
- Try to stay awake on arrival until local bedtime in Saudi Arabia
- Prayer times will shift — download a local prayer app (Muslim Pro, Athan) for Saudi times`,
    keywords: ['time difference', 'time zone', 'jet lag', 'canada', 'saudi', 'makkah', 'clock'],
  },
  {
    id: 'dest-4',
    category: 'Destinations & Travel Tips',
    question: 'What language do they speak in Saudi Arabia and do I need to learn Arabic?',
    answer: `**Official language:** Arabic (Modern Standard Arabic + Hejazi Arabic dialect in Makkah/Madinah).

**Do you need Arabic?** Not necessarily:
- In **Makkah and Madinah**, English is widely spoken in hotels, tour operator areas, and among guides
- Signage in the Masjid al-Haram and major areas is in Arabic + English
- Our **NaasirTravel guides** will accompany you throughout your package

**Useful Arabic phrases:**
- As-salamu alaykum — Peace be upon you (greeting)
- Shukran — Thank you
- Min fadlak — Please
- Bikam? — How much?
- La shukran — No thank you
- Yalla — Let's go / Come on

Having a translation app (Google Translate, Arabic offline pack) on your phone is very helpful.`,
    keywords: ['language', 'arabic', 'speak', 'communicate', 'translation', 'english', 'saudi language'],
  },
  {
    id: 'dest-5',
    category: 'Destinations & Travel Tips',
    question: 'What are some must-see places in Makkah and Madinah?',
    answer: `**Makkah — Key sites:**
- **Masjid al-Haram** — The Grand Mosque surrounding the Kaaba; largest mosque in the world
- **The Kaaba** — The cubic structure that Muslims face in prayer; circumambulated during Tawaf
- **Zamzam Well** — Sacred water spring inside the Haram
- **Mount Safa & Marwa** — Walked between during the Sa'i ritual
- **Jabal al-Nour** — The mountain housing the Cave of Hira (where first revelation came)
- **Mina, Muzdalifah, Arafat** — Sites for Hajj rituals

**Madinah — Key sites:**
- **Masjid an-Nabawi** — The Prophet's Mosque; second holiest site in Islam
- **Rawdah al-Sharif** — The sacred garden within the mosque (visit to pray here is highly rewarding)
- **Jannat al-Baqi** — Historical cemetery adjacent to the mosque
- **Masjid Quba** — First mosque built in Islamic history

Our guides will take you to all significant sites included in your package itinerary.`,
    keywords: ['makkah', 'madinah', 'sites', 'visit', 'kaaba', 'mosque', 'places', 'must see', 'haram'],
  },

  // ─── GENERAL TRAVEL: FLIGHTS ──────────────────────────────────────────────
  {
    id: 'flt-1',
    category: 'Flights',
    question: 'What should I know about long-haul flights?',
    answer: `**Tips for long-haul flights (10+ hours):**
- **Hydrate** — Drink water every hour; avoid alcohol and excess caffeine
- **Move around** — Walk the aisle every 1–2 hours to prevent DVT (blood clots)
- **Compression socks** — Highly recommended for flights over 6 hours
- **Pack entertainment** — Books, downloaded shows, music playlists
- **Bring a neck pillow** — Game changer for sleeping upright
- **Adjust to destination time zone** immediately — Set your watch on boarding
- **Eye mask + earplugs** — For quality sleep
- **Dress in layers** — Cabin temperature can vary significantly
- **Carry medications in hand luggage** — Never in checked bags

From **Canada to Saudi Arabia**, flights are approximately **14–17 hours** (often with a stopover in Istanbul, Dubai, or Doha).`,
    keywords: ['flight', 'long haul', 'tips', 'flying', 'plane', 'hours', 'DVT', 'sleep on plane', 'hydrate'],
  },
  {
    id: 'flt-2',
    category: 'Flights',
    question: 'What airlines fly from Canada to Saudi Arabia?',
    answer: `**Common routes from Canada to Saudi Arabia:**
- **Air Canada + Saudi Arabian Airlines (Saudia)** — Connecting through Middle Eastern hubs
- **Turkish Airlines** — Often most affordable, connects through Istanbul
- **Emirates** — Via Dubai (DXB), excellent service and lounge access
- **Qatar Airways** — Via Doha (DOH), consistently rated world's best airline
- **Etihad Airways** — Via Abu Dhabi
- **Flydubai / Air Arabia** — Budget carriers once you reach the hub

**Flight time:** ~14–16 hours total travel time including layovers.

For packages through NaasirTravel, your flights are included and we select the best options for your travel dates and budget tier.`,
    keywords: ['airline', 'flight', 'canada', 'saudi', 'airline options', 'carriers', 'which airline', 'fly'],
  },

  // ─── CONTACT & SUPPORT ───────────────────────────────────────────────────
  {
    id: 'sup-1',
    category: 'Support',
    question: 'How do I contact NaasirTravel for help?',
    answer: `You can reach our team through:
- **Contact Form:** Visit our Contact page on the website
- **Email:** Send us a message through the contact form (we respond within 24 hours)
- **Phone:** Check our footer for direct phone numbers
- **Office Hours:** Sunday–Thursday, 10:00 AM – 4:00 PM (we are closed Friday & Saturday)
- **Location:** Richmond, BC, Canada

For urgent booking issues, calling during office hours is the fastest option. For non-urgent queries, the contact form or this chatbot can usually help!`,
    keywords: ['contact', 'help', 'support', 'phone', 'email', 'reach', 'hours', 'office', 'customer service'],
  },
  {
    id: 'sup-2',
    category: 'Support',
    question: 'Is my personal data safe with NaasirTravel?',
    answer: `Yes. NaasirTravel takes data security seriously:
- All payments are processed through **Stripe**, which is PCI-DSS Level 1 certified
- Passwords are **hashed and encrypted** using industry-standard algorithms
- We do not store credit card details on our servers
- Your personal data (passport, contact info) is used only for booking and visa processing
- We use **HTTPS encryption** across the entire platform

If you have specific data privacy concerns or requests, please contact us through our Contact page.`,
    keywords: ['data', 'privacy', 'safe', 'security', 'personal information', 'secure', 'GDPR', 'protection'],
  },
];

export default knowledgeBase;
