'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Hotel, MapPinned, PackageSearch, Plane } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Captcha from '@/components/Captcha';

type Service = 'flights' | 'hotels' | 'existing_package' | 'custom_package';
type Tour = { _id: string; title: string };

const serviceOptions: Array<{ value: Service; label: string; icon: typeof Plane }> = [
  { value: 'flights', label: 'Flights', icon: Plane },
  { value: 'hotels', label: 'Hotels', icon: Hotel },
  { value: 'existing_package', label: 'Existing package', icon: PackageSearch },
  { value: 'custom_package', label: 'Custom package', icon: MapPinned },
];

const inputClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

export default function TravelRequestPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    fetch('/api/tours')
      .then((response) => response.json())
      .then((data) => setTours((data.data || []).map((tour: Tour) => ({ _id: tour._id, title: tour.title }))))
      .catch(() => setTours([]));
  }, []);

  const toggleService = (service: Service) => {
    setServices((current) => current.includes(service) ? current.filter((item) => item !== service) : [...current, service]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!services.length) return setError('Select at least one service.');
    if (!captchaVerified) return setError('Complete the verification code.');
    setSubmitting(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (name: string) => String(form.get(name) || '');
    const payload = {
      name: value('name'), email: value('email'), phone: value('phone'), services,
      purpose: value('purpose'), readiness: value('readiness'), origin: value('origin'), destination: value('destination'),
      departureDate: value('departureDate') || undefined, returnDate: value('returnDate') || undefined,
      flexibleDates: form.get('flexibleDates') === 'on', budget: value('budget'), website: value('website'), captchaVerified,
      travelers: { adults: Number(value('adults')), children: Number(value('children') || 0), infants: Number(value('infants') || 0) },
      packageId: value('packageId') || undefined,
      customRequirements: value('customRequirements'), generalNotes: value('generalNotes'),
      flightPreferences: {
        cabin: value('cabin'), preferredAirline: value('preferredAirline'),
        stopPreference: value('stopPreference'), notes: value('flightNotes'),
      },
      hotelPreferences: {
        destination: value('hotelDestination'), checkIn: value('checkIn') || undefined,
        checkOut: value('checkOut') || undefined, rooms: value('rooms') || undefined,
        starRating: value('starRating'), notes: value('hotelNotes'),
      },
    };

    try {
      const response = await fetch('/api/travel-enquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to submit your request.');
      setReference(data.reference);
      formElement.reset();
      setServices([]);
      setCaptchaVerified(false);
      setCaptchaKey((key) => key + 1);
    } catch (submissionError: any) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24">
        <div className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">Request a Trip</h1>
            <p className="mt-2 max-w-2xl text-gray-600">Tell us what you need. No account is required.</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {reference ? (
            <div className="border border-emerald-200 bg-white p-8 shadow-sm">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-950">Request received</h2>
              <p className="mt-2 text-gray-600">Our team will contact you using the details provided.</p>
              <p className="mt-5 text-sm text-gray-500">Reference</p>
              <p className="font-mono text-lg font-bold text-gray-950">{reference}</p>
              <button type="button" onClick={() => setReference('')} className="mt-6 rounded-md bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800">
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

              <section className="space-y-4">
                <div><h2 className="text-xl font-bold text-gray-950">What do you need?</h2><p className="text-sm text-gray-600">Choose one or more services.</p></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {serviceOptions.map(({ value, label, icon: Icon }) => {
                    const selected = services.includes(value);
                    return <button key={value} type="button" aria-pressed={selected} onClick={() => toggleService(value)} className={`flex min-h-20 items-center gap-3 border p-4 text-left font-semibold ${selected ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'}`}><Icon className="h-5 w-5" />{label}</button>;
                  })}
                </div>
              </section>

              <section className="grid gap-5 border-t border-gray-200 pt-8 md:grid-cols-2">
                <h2 className="md:col-span-2 text-xl font-bold text-gray-950">Contact information</h2>
                <label className="text-sm font-medium text-gray-700">Full name *<input name="name" required maxLength={120} className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Email *<input name="email" type="email" required maxLength={180} className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Phone *<input name="phone" type="tel" required maxLength={60} className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Travel purpose *<select name="purpose" required className={`${inputClass} mt-1`}><option value="">Select purpose</option><option value="umrah">Umrah</option><option value="hajj">Hajj</option><option value="vacation">Vacation</option><option value="business">Business</option><option value="family_visit">Family visit</option><option value="other">Other</option></select></label>
                <label className="text-sm font-medium text-gray-700">Planning stage *<select name="readiness" required className={`${inputClass} mt-1`}><option value="">Select stage</option><option value="planning">Planning</option><option value="ready_for_quote">Ready for a quote</option><option value="ready_to_book">Ready to book</option></select></label>
              </section>

              <section className="grid gap-5 border-t border-gray-200 pt-8 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="md:col-span-2 lg:col-span-3 text-xl font-bold text-gray-950">Trip details</h2>
                <label className="text-sm font-medium text-gray-700">Origin *<input name="origin" required maxLength={160} className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Destination *<input name="destination" required maxLength={160} className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Budget<input name="budget" maxLength={120} placeholder="Optional" className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Departure date<input name="departureDate" type="date" className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Return date<input name="returnDate" type="date" className={`${inputClass} mt-1`} /></label>
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-gray-700"><input name="flexibleDates" type="checkbox" className="h-4 w-4" />Dates are flexible</label>
                <label className="text-sm font-medium text-gray-700">Adults *<input name="adults" type="number" min="1" step="1" defaultValue="1" required className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Children<input name="children" type="number" min="0" step="1" defaultValue="0" className={`${inputClass} mt-1`} /></label>
                <label className="text-sm font-medium text-gray-700">Infants<input name="infants" type="number" min="0" step="1" defaultValue="0" className={`${inputClass} mt-1`} /></label>
              </section>

              {services.includes('flights') && <section className="grid gap-5 border-t border-gray-200 pt-8 md:grid-cols-2"><h2 className="md:col-span-2 text-xl font-bold text-gray-950">Flight preferences</h2><label className="text-sm font-medium text-gray-700">Cabin<select name="cabin" className={`${inputClass} mt-1`}><option value="">Any cabin</option><option value="economy">Economy</option><option value="premium_economy">Premium economy</option><option value="business">Business</option><option value="first">First</option></select></label><label className="text-sm font-medium text-gray-700">Stops<select name="stopPreference" className={`${inputClass} mt-1`}><option value="any">Any</option><option value="direct">Direct</option><option value="one_stop">Up to one stop</option></select></label><label className="text-sm font-medium text-gray-700">Preferred airline<input name="preferredAirline" className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700">Flight notes<textarea name="flightNotes" rows={3} className={`${inputClass} mt-1`} /></label></section>}

              {services.includes('hotels') && <section className="grid gap-5 border-t border-gray-200 pt-8 md:grid-cols-2 lg:grid-cols-3"><h2 className="md:col-span-2 lg:col-span-3 text-xl font-bold text-gray-950">Hotel preferences</h2><label className="text-sm font-medium text-gray-700">Hotel destination<input name="hotelDestination" className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700">Check-in<input name="checkIn" type="date" className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700">Check-out<input name="checkOut" type="date" className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700">Rooms<input name="rooms" type="number" min="1" step="1" defaultValue="1" className={`${inputClass} mt-1`} /></label><label className="text-sm font-medium text-gray-700">Hotel rating<select name="starRating" className={`${inputClass} mt-1`}><option value="any">Any</option><option value="3">3 star</option><option value="4">4 star</option><option value="5">5 star</option></select></label><label className="text-sm font-medium text-gray-700">Hotel notes<textarea name="hotelNotes" rows={3} className={`${inputClass} mt-1`} /></label></section>}

              {services.includes('existing_package') && <section className="border-t border-gray-200 pt-8"><h2 className="text-xl font-bold text-gray-950">Package</h2><label className="mt-4 block text-sm font-medium text-gray-700">Select package *<select name="packageId" required className={`${inputClass} mt-1`}><option value="">Choose a published package</option>{tours.map((tour) => <option key={tour._id} value={tour._id}>{tour.title}</option>)}</select></label></section>}
              {services.includes('custom_package') && <section className="border-t border-gray-200 pt-8"><h2 className="text-xl font-bold text-gray-950">Custom package</h2><label className="mt-4 block text-sm font-medium text-gray-700">Requirements *<textarea name="customRequirements" required rows={5} maxLength={5000} className={`${inputClass} mt-1`} /></label></section>}

              <section className="space-y-5 border-t border-gray-200 pt-8">
                <label className="block text-sm font-medium text-gray-700">Anything else?<textarea name="generalNotes" rows={4} maxLength={5000} className={`${inputClass} mt-1`} /></label>
                <div className="absolute -left-[10000px]" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
                <Captcha onVerify={setCaptchaVerified} resetKey={captchaKey} />
                <button type="submit" disabled={submitting} className="rounded-md bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400">{submitting ? 'Submitting...' : 'Submit travel request'}</button>
              </section>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
