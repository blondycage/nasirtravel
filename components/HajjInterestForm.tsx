'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type PartySize = '1' | '2' | '3' | '4+';
type PackageType = 'luxury' | 'premium' | 'standard';
type AccommodationType = 'non-shifting' | 'shifting';
type RoomPreference = 'quad' | 'triple' | 'double';
type PlanningValue = 'yes' | 'no';

interface HajjInterestDependantForm {
  name: string;
  phoneNumber: string;
  email: string;
}

interface HajjInterestFormData {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  partySize: PartySize | '';
  packageType: PackageType | '';
  accommodationType: AccommodationType | '';
  roomPreference: RoomPreference | '';
  departurePort: string;
  planningToGo: PlanningValue | '';
  dependants: HajjInterestDependantForm[];
}

interface HajjInterestFormProps {
  open: boolean;
  onClose: () => void;
}

const partySizeOptions: Array<{ value: PartySize; label: string }> = [
  { value: '1', label: '1 Person (Alone)' },
  { value: '2', label: '2 Persons (With my Spouse and/or other family member)' },
  { value: '3', label: '3 Persons (With my Spouse and/or Multiple Family members)' },
  { value: '4+', label: '4 or more Family Members' },
];

const packageTypeOptions: Array<{ value: PackageType; label: string }> = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'premium', label: 'Premium' },
  { value: 'standard', label: 'Standard' },
];

const accommodationOptions: Array<{ value: AccommodationType; label: string; description: string }> = [
  {
    value: 'non-shifting',
    label: 'Non-Shifting',
    description: 'Non-shifting packages offer a single accommodation in Makkah for the entire stay.',
  },
  {
    value: 'shifting',
    label: 'Shifting',
    description:
      'Shifting packages provide pilgrims with two accommodations, one in Aziziyah and another near Masjid Al-Haram before or after Hajj.',
  },
];

const roomPreferenceOptions: Array<{ value: RoomPreference; label: string; description: string }> = [
  {
    value: 'quad',
    label: 'Quad Occupancy',
    description: '4 persons per room sharing. Most economical.',
  },
  {
    value: 'triple',
    label: 'Triple Occupancy',
    description: 'Small family. Additional charges apply.',
  },
  {
    value: 'double',
    label: 'Double Occupancy',
    description: 'Couples. Additional charges apply.',
  },
];

const planningOptions: Array<{ value: PlanningValue; label: string }> = [
  { value: 'yes', label: 'Yes, I plan on going for Hajj in 2027' },
  { value: 'no', label: 'No, I am not planning on going for Hajj.' },
];

const contactFieldClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20';

const optionCardBase =
  'cursor-pointer rounded-2xl border p-4 transition-all duration-200 hover:border-orange-400 hover:bg-orange-50/80';

export default function HajjInterestForm({ open, onClose }: HajjInterestFormProps) {
  const [formData, setFormData] = useState<HajjInterestFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    partySize: '',
    packageType: '',
    accommodationType: '',
    roomPreference: '',
    departurePort: '',
    planningToGo: '',
    dependants: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    let cancelled = false;

    const hydrateUser = async () => {
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        if (cancelled) return;

        const nameParts = (data.user?.name || '').trim().split(/\s+/).filter(Boolean);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ');

        setFormData(prev => ({
          ...prev,
          email: prev.email || data.user?.email || '',
          phoneNumber: prev.phoneNumber || data.user?.phone || '',
          firstName: prev.firstName || firstName,
          lastName: prev.lastName || lastName,
        }));
      } catch (fetchError) {
        console.error('Failed to hydrate Hajj interest form:', fetchError);
      }
    };

    hydrateUser();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleMainChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    } as HajjInterestFormData));
  };

  const handleRadioSelect = (name: keyof HajjInterestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    } as HajjInterestFormData));
  };

  const handleDependantChange = (
    index: number,
    field: keyof HajjInterestDependantForm,
    value: string
  ) => {
    setFormData(prev => {
      const dependants = [...prev.dependants];
      dependants[index] = {
        ...dependants[index],
        [field]: value,
      };

      return {
        ...prev,
        dependants,
      };
    });
  };

  const addDependant = () => {
    setFormData(prev => ({
      ...prev,
      dependants: [...prev.dependants, { name: '', phoneNumber: '', email: '' }],
    }));
  };

  const removeDependant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dependants: prev.dependants.filter((_, dependantIndex) => dependantIndex !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.firstName.trim()) return 'First name is required.';
    if (!formData.lastName.trim()) return 'Last name is required.';
    if (!formData.phoneNumber.trim()) return 'Phone number is required.';
    if (!formData.partySize) return 'Please select how many people are planning to perform Hajj.';
    if (!formData.packageType) return 'Please select a package type.';
    if (!formData.accommodationType) return 'Please choose shifting or non-shifting.';
    if (!formData.roomPreference) return 'Please select a room preference.';
    if (!formData.departurePort.trim()) return 'Port of departure is required.';
    if (!formData.planningToGo) return 'Please confirm whether you are planning to go for Hajj.';

    for (const [index, dependant] of formData.dependants.entries()) {
      if (!dependant.name.trim()) {
        return `Dependant ${index + 1} needs a name.`;
      }

      if (!dependant.phoneNumber.trim() && !dependant.email.trim()) {
        return `Dependant ${index + 1} needs a phone number or email address.`;
      }
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/hajj-interest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dependants: formData.dependants,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit interest form');
      }

      setSuccess('Your interest form has been submitted successfully.');
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        partySize: '',
        packageType: '',
        accommodationType: '',
        roomPreference: '',
        departurePort: '',
        planningToGo: '',
        dependants: [],
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (submitError: any) {
      setError(submitError.message || 'Failed to submit interest form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-white/10 bg-slate-950 text-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-5 py-4 backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
                    Register Interest
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                    Naasir Travel Hajj 2026 Registration Form
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                    This is a preliminary registration form to collect information and your preference to create
                    one type of package that meets your needs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/15 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-8">
              <div className="mb-6 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-50">
                <strong className="text-white">Important:</strong> The main details in this form should belong
                to the account owner in the Nusuk portal.
              </div>

              {error && (
                <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Main Applicant Details</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Please enter the information for the person whose Nusuk account will be used.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="email">
                        Email *
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleMainChange}
                        className={contactFieldClass}
                        placeholder="name@example.com"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="phoneNumber">
                        Phone Number *
                      </label>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleMainChange}
                        className={contactFieldClass}
                        placeholder="+1 555 123 4567"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="firstName">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleMainChange}
                        className={contactFieldClass}
                        placeholder="First name"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="lastName">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleMainChange}
                        className={contactFieldClass}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Hajj Party Size</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      I Inshaa Allah plan to perform my Hajj with:
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {partySizeOptions.map(option => (
                      <label
                        key={option.value}
                        className={`${optionCardBase} ${
                          formData.partySize === option.value
                            ? 'border-orange-400 bg-orange-500/15'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="partySize"
                          value={option.value}
                          checked={formData.partySize === option.value}
                          onChange={() => handleRadioSelect('partySize', option.value)}
                          className="sr-only"
                        />
                        <span className="block text-sm font-semibold text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Package Type</h3>
                    <p className="mt-1 text-sm text-slate-400">Select the package level you prefer.</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {packageTypeOptions.map(option => (
                      <label
                        key={option.value}
                        className={`${optionCardBase} text-center ${
                          formData.packageType === option.value
                            ? 'border-orange-400 bg-orange-500/15'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="packageType"
                          value={option.value}
                          checked={formData.packageType === option.value}
                          onChange={() => handleRadioSelect('packageType', option.value)}
                          className="sr-only"
                        />
                        <span className="block text-base font-semibold text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Accommodation Preference</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Would you prefer shifting or non-shifting?
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {accommodationOptions.map(option => (
                      <label
                        key={option.value}
                        className={`${optionCardBase} ${
                          formData.accommodationType === option.value
                            ? 'border-orange-400 bg-orange-500/15'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="accommodationType"
                          value={option.value}
                          checked={formData.accommodationType === option.value}
                          onChange={() => handleRadioSelect('accommodationType', option.value)}
                          className="sr-only"
                        />
                        <span className="block text-base font-semibold text-white">{option.label}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-300">
                          {option.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Room Preferences</h3>
                    <p className="mt-1 text-sm text-slate-400">Choose your preferred room sharing setup.</p>
                  </div>
                  <div className="grid gap-3">
                    {roomPreferenceOptions.map(option => (
                      <label
                        key={option.value}
                        className={`${optionCardBase} ${
                          formData.roomPreference === option.value
                            ? 'border-orange-400 bg-orange-500/15'
                            : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <input
                          type="radio"
                          name="roomPreference"
                          value={option.value}
                          checked={formData.roomPreference === option.value}
                          onChange={() => handleRadioSelect('roomPreference', option.value)}
                          className="sr-only"
                        />
                        <span className="block text-base font-semibold text-white">{option.label}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-slate-300">
                          {option.description}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-200" htmlFor="departurePort">
                        Port of Departure *
                      </label>
                      <input
                        id="departurePort"
                        name="departurePort"
                        type="text"
                        required
                        value={formData.departurePort}
                        onChange={handleMainChange}
                        className={contactFieldClass}
                        placeholder="e.g. Lagos, Heathrow, JFK, or Naasir Travel"
                      />
                    </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
                      Are you Planning on going for Hajj? *
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {planningOptions.map(option => (
                        <label
                          key={option.value}
                          className={`${optionCardBase} ${
                            formData.planningToGo === option.value
                              ? 'border-orange-400 bg-orange-500/15'
                              : 'border-white/10 bg-white/5'
                          }`}
                        >
                          <input
                            type="radio"
                            name="planningToGo"
                            value={option.value}
                            checked={formData.planningToGo === option.value}
                            onChange={() => handleRadioSelect('planningToGo', option.value)}
                            className="sr-only"
                          />
                          <span className="block text-sm font-semibold text-white">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Dependants</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Add dependants with only their name and phone number or email.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addDependant}
                      className="rounded-full border border-orange-400/40 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-500/15"
                    >
                      + Add Dependant
                    </button>
                  </div>

                  {formData.dependants.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-slate-400">
                      No dependants added yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.dependants.map((dependant, index) => (
                        <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <h4 className="text-base font-semibold text-white">Dependant {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeDependant(index)}
                              className="text-sm font-medium text-red-300 transition hover:text-red-200"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                                Name
                              </label>
                              <input
                                type="text"
                                value={dependant.name}
                                onChange={event => handleDependantChange(index, 'name', event.target.value)}
                                className={contactFieldClass}
                                placeholder="Full name"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={dependant.phoneNumber}
                                onChange={event => handleDependantChange(index, 'phoneNumber', event.target.value)}
                                className={contactFieldClass}
                                placeholder="+1 555 123 4567"
                              />
                            </div>
                            <div>
                              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                                Email
                              </label>
                              <input
                                type="email"
                                value={dependant.email}
                                onChange={event => handleDependantChange(index, 'email', event.target.value)}
                                className={contactFieldClass}
                                placeholder="optional@email.com"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Submitting...' : 'Submit Interest'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
