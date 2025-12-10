'use client';

import { useState, useEffect } from 'react';

export interface ApplicationFormData {
  // Personal Information
  countryOfNationality?: string;
  firstName?: string;
  fatherName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  maritalStatus?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  cityOfBirth?: string;
  profession?: string;
  
  // Passport Details
  applicationNumber?: string;
  passportType?: string;
  passportNumber?: string;
  passportIssuePlace?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;

  // Current Residence Address
  residenceCountry?: string;
  residenceCity?: string;
  residenceZipCode?: string;
  residenceAddress?: string;
}

interface ApplicationFormProps {
  applicantType: 'user' | 'dependant';
  applicantId: string; // bookingId for user, dependantId for dependant
  packageType: 'umrah' | 'standard';
  initialData?: ApplicationFormData;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  readOnly?: boolean;
  applicantName?: string;
}

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bahrain', 'Bangladesh',
  'Belgium', 'Brazil', 'Canada', 'China', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece',
  'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Italy', 'Japan', 'Jordan', 'Kuwait', 'Lebanon',
  'Malaysia', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Oman', 'Pakistan', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'Syria', 'Thailand', 'Tunisia', 'Turkey', 'UAE', 'UK', 'USA',
  'Yemen'
];

const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

const PASSPORT_TYPES = ['Regular Passport', 'Diplomatic Passport', 'Official Passport', 'Service Passport'];

export default function ApplicationForm({
  applicantType,
  applicantId,
  packageType,
  initialData,
  onSubmit,
  readOnly = false,
  applicantName
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationFormData>({
    countryOfNationality: '',
    firstName: '',
    fatherName: '',
    lastName: '',
    gender: undefined,
    maritalStatus: '',
    dateOfBirth: '',
    countryOfBirth: '',
    cityOfBirth: '',
    profession: '',
    applicationNumber: '',
    passportType: '',
    passportNumber: '',
    passportIssuePlace: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    residenceCountry: '',
    residenceCity: '',
    residenceZipCode: '',
    residenceAddress: '',
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Convert dates to YYYY-MM-DD format for input fields
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        passportIssueDate: initialData.passportIssueDate ? new Date(initialData.passportIssueDate).toISOString().split('T')[0] : '',
        passportExpiryDate: initialData.passportExpiryDate ? new Date(initialData.passportExpiryDate).toISOString().split('T')[0] : '',
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    // Required fields validation based on package type
    const commonRequiredFields = [
      { field: 'countryOfNationality', label: 'Country of Nationality' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'gender', label: 'Gender' },
      { field: 'dateOfBirth', label: 'Date of Birth' },
      { field: 'passportNumber', label: 'Passport Number' },
      { field: 'passportIssuePlace', label: 'Passport Issue Place' },
      { field: 'passportIssueDate', label: 'Passport Issue Date' },
      { field: 'passportExpiryDate', label: 'Passport Expiry Date' },
      { field: 'residenceCountry', label: 'Residence Country' },
      { field: 'residenceCity', label: 'Residence City' },
      { field: 'residenceZipCode', label: 'Postal Code/Zip Code' },
      { field: 'residenceAddress', label: 'Street Address' },
    ];

    // Additional fields required only for Umrah packages
    const umrahRequiredFields = [
      { field: 'maritalStatus', label: 'Marital Status' },
      { field: 'countryOfBirth', label: 'Country of Birth' },
      { field: 'cityOfBirth', label: 'City of Birth' },
      { field: 'profession', label: 'Profession' },
    ];

    const requiredFields = packageType === 'umrah'
      ? [...commonRequiredFields, ...umrahRequiredFields]
      : commonRequiredFields;

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof ApplicationFormData]) {
        return `${label} is required`;
      }
    }

    // Passport expiry validation (must be valid 6+ months from submission)
    if (formData.passportExpiryDate) {
      const expiryDate = new Date(formData.passportExpiryDate);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (expiryDate < sixMonthsFromNow) {
        return 'Passport must be valid at least 6 months from the visa application submission date';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application form');
    } finally {
      setLoading(false);
    }
  };

  if (readOnly) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">
          Application Form - {applicantName || (applicantType === 'user' ? 'Main Applicant' : 'Dependant')}
        </h2>
        <div className="space-y-6">
          {/* Personal Information */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country of Nationality</label>
                <p className="mt-1 text-gray-900">{formData.countryOfNationality || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-gray-900">{formData.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Father/Middle Name</label>
                <p className="mt-1 text-gray-900">{formData.fatherName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-gray-900">{formData.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="mt-1 text-gray-900">{formData.gender || 'N/A'}</p>
              </div>
              {packageType === 'umrah' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                  <p className="mt-1 text-gray-900">{formData.maritalStatus || 'N/A'}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <p className="mt-1 text-gray-900">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              </div>
              {packageType === 'umrah' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country of Birth</label>
                    <p className="mt-1 text-gray-900">{formData.countryOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City of Birth</label>
                    <p className="mt-1 text-gray-900">{formData.cityOfBirth || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profession</label>
                    <p className="mt-1 text-gray-900">{formData.profession || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Passport Details */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Passport Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Number</label>
                <p className="mt-1 text-gray-900">{formData.applicationNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Type</label>
                <p className="mt-1 text-gray-900">{formData.passportType || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Number</label>
                <p className="mt-1 text-gray-900">{formData.passportNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Issue Place</label>
                <p className="mt-1 text-gray-900">{formData.passportIssuePlace || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Issue Date</label>
                <p className="mt-1 text-gray-900">{formData.passportIssueDate ? new Date(formData.passportIssueDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Passport Expiry Date</label>
                <p className="mt-1 text-gray-900">{formData.passportExpiryDate ? new Date(formData.passportExpiryDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </section>

          {/* Travel Information */}
          {/* Address */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Current Residence Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Country</label>
                <p className="mt-1 text-gray-900">{formData.residenceCountry || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <p className="mt-1 text-gray-900">{formData.residenceCity || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Zip/Postal Code</label>
                <p className="mt-1 text-gray-900">{formData.residenceZipCode || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="mt-1 text-gray-900">{formData.residenceAddress || 'N/A'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">
        Application Form - {applicantName || (applicantType === 'user' ? 'Main Applicant' : 'Dependant')}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
          Application form submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <section className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="countryOfNationality" className="block text-sm font-medium mb-1">
                Country of Nationality *
              </label>
              <select
                id="countryOfNationality"
                name="countryOfNationality"
                required
                value={formData.countryOfNationality}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name or Given Name (English) *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name or Given Name (English)"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Please make sure to enter the names exactly mentioned on your passport in English only
              </p>
            </div>

            <div>
              <label htmlFor="fatherName" className="block text-sm font-medium mb-1">
                Father Name or Middle Name (English)
                <span className="text-xs text-gray-500 ml-1">(Optional, if available in passport)</span>
              </label>
              <input
                type="text"
                id="fatherName"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Father Name or Middle Name (English)"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name or Family Name (English) *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name or Family Name (English)"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Please make sure to enter the names exactly mentioned on your passport in English only
              </p>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">
                Gender *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {packageType === 'umrah' && (
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium mb-1">
                  Marital Status *
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  required
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  {MARITAL_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Click on the title of the popup window to scroll multiple months/years at a time
              </p>
            </div>

            {packageType === 'umrah' && (
              <>
                <div>
                  <label htmlFor="countryOfBirth" className="block text-sm font-medium mb-1">
                    Country of Birth *
                  </label>
                  <select
                    id="countryOfBirth"
                    name="countryOfBirth"
                    required
                    value={formData.countryOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cityOfBirth" className="block text-sm font-medium mb-1">
                    City of Birth *
                  </label>
                  <input
                    type="text"
                    id="cityOfBirth"
                    name="cityOfBirth"
                    required
                    value={formData.cityOfBirth}
                    onChange={handleChange}
                    placeholder="City of Birth"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="profession" className="block text-sm font-medium mb-1">
                    Profession *
                  </label>
                  <input
                    type="text"
                    id="profession"
                    name="profession"
                    required
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="Profession"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    In case of minor please write 'None'
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Passport Details Section */}
        <section className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Passport Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.applicationNumber && (
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-500">
                  Application No.
                </label>
                <input
                  type="text"
                  value={formData.applicationNumber}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            )}

            <div>
              <label htmlFor="passportType" className="block text-sm font-medium mb-1">
                Passport Type *
              </label>
              <select
                id="passportType"
                name="passportType"
                required
                value={formData.passportType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {PASSPORT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="passportNumber" className="block text-sm font-medium mb-1">
                Passport No. *
              </label>
              <input
                type="text"
                id="passportNumber"
                name="passportNumber"
                required
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Passport No."
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="passportIssuePlace" className="block text-sm font-medium mb-1">
                Passport Issue Place (Country or City) *
              </label>
              <input
                type="text"
                id="passportIssuePlace"
                name="passportIssuePlace"
                required
                value={formData.passportIssuePlace}
                onChange={handleChange}
                placeholder="Passport Issue Place (Country or City)"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="passportIssueDate" className="block text-sm font-medium mb-1">
                Passport Issue Date *
              </label>
              <input
                type="date"
                id="passportIssueDate"
                name="passportIssueDate"
                required
                value={formData.passportIssueDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Click on the title of the popup window to scroll multiple months/years at a time
              </p>
            </div>

            <div>
              <label htmlFor="passportExpiryDate" className="block text-sm font-medium mb-1">
                Passport Expiry Date *
              </label>
              <input
                type="date"
                id="passportExpiryDate"
                name="passportExpiryDate"
                required
                value={formData.passportExpiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-red-600">
                Passport must be valid at least 6 months from the Visa application submission date
              </p>
            </div>
          </div>
        </section>

        {/* Current Residence Address Section */}
        <section className="border-b pb-6">
          <h3 className="text-xl font-semibold mb-4">Current Residence Address</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="residenceCountry" className="block text-sm font-medium mb-1">
                Country *
              </label>
              <select
                id="residenceCountry"
                name="residenceCountry"
                required
                value={formData.residenceCountry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="residenceCity" className="block text-sm font-medium mb-1">
                City *
              </label>
              <input
                type="text"
                id="residenceCity"
                name="residenceCity"
                required
                value={formData.residenceCity}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="residenceZipCode" className="block text-sm font-medium mb-1">
                Zip/Postal Code
              </label>
              <input
                type="text"
                id="residenceZipCode"
                name="residenceZipCode"
                value={formData.residenceZipCode}
                onChange={handleChange}
                placeholder="Zip/Postal Code"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="residenceAddress" className="block text-sm font-medium mb-1">
                Address *
              </label>
              <textarea
                id="residenceAddress"
                name="residenceAddress"
                required
                value={formData.residenceAddress}
                onChange={handleChange}
                placeholder="Address"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
