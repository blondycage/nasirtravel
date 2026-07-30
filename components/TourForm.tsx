'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';
import { PACKAGE_INFO_TABLE_LIMITS, normalizePackageInfoTables, type PackageInfoTable } from '@/lib/utils/packageInfoTables';

interface TourFormProps {
  tourId?: string;
  initialData?: any;
}

const normalizePackageCategory = (category?: string) => {
  if (!category) return '';

  const normalized = category.toLowerCase();
  if (normalized.includes('umrah')) return 'Umrah';
  if (normalized.includes('america') || normalized.includes('usa') || normalized.includes('canada') || normalized.includes('mexico') || normalized.includes('caribbean')) return 'Americas';
  if (normalized === 'asia') return 'Asia';
  if (normalized === 'africa') return 'Africa';
  if (normalized === 'europe') return 'Europe';

  return category;
};

export default function TourForm({ tourId, initialData }: TourFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    packageType: 'standard' as 'umrah' | 'standard',
    image: '',
    departure: '',
    accommodation: '',
    dates: '',
    price: '',
    pricingMode: 'quote_required' as 'fixed' | 'quote_required',
    priceLabel: 'Price confirmed after review',
    startingPrice: '',
    description: '',
    status: 'draft',
    inclusions: [] as string[],
    exclusions: [] as string[],
    infoTables: [] as PackageInfoTable[],
    itinerary: [] as Array<{ day: number; title: string; description: string }>
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: normalizePackageCategory(initialData.category),
        packageType: initialData.packageType || 'standard',
        image: initialData.image || '',
        departure: initialData.departure || '',
        accommodation: initialData.accommodation || '',
        dates: initialData.dates || '',
        price: initialData.price || '',
        pricingMode: initialData.pricingMode || 'quote_required',
        priceLabel: initialData.priceLabel || 'Price confirmed after review',
        startingPrice: initialData.startingPrice || '',
        description: initialData.description || '',
        status: initialData.status || 'draft',
        inclusions: initialData.inclusions || [],
        exclusions: initialData.exclusions || [],
        infoTables: normalizePackageInfoTables(initialData.infoTables),
        itinerary: initialData.itinerary || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const url = tourId ? `/api/admin/tours/${tourId}` : '/api/admin/tours';
      const method = tourId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          infoTables: normalizePackageInfoTables(formData.infoTables),
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tour');
      }

      router.push('/admin/tours');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addItem = (field: 'inclusions' | 'exclusions', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
  };

  const removeItem = (field: 'inclusions' | 'exclusions', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const addInfoTable = () => {
    setFormData(prev => {
      if (prev.infoTables.length >= PACKAGE_INFO_TABLE_LIMITS.maxTables) return prev;

      return {
        ...prev,
        infoTables: [
          ...prev.infoTables,
          {
            title: '',
            columns: ['Option', 'Details'],
            rows: [['', '']],
            notes: '',
            order: prev.infoTables.length,
          },
        ],
      };
    });
  };

  const updateInfoTable = (tableIndex: number, changes: Partial<PackageInfoTable>) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) =>
        index === tableIndex ? { ...table, ...changes } : table
      ),
    }));
  };

  const removeInfoTable = (tableIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.filter((_, index) => index !== tableIndex),
    }));
  };

  const addInfoTableColumn = (tableIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) => {
        if (index !== tableIndex || table.columns.length >= PACKAGE_INFO_TABLE_LIMITS.maxColumns) return table;

        return {
          ...table,
          columns: [...table.columns, `Column ${table.columns.length + 1}`],
          rows: table.rows.map((row) => [...row, '']),
        };
      }),
    }));
  };

  const removeInfoTableColumn = (tableIndex: number, columnIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) => {
        if (index !== tableIndex || table.columns.length <= 1) return table;

        return {
          ...table,
          columns: table.columns.filter((_, currentIndex) => currentIndex !== columnIndex),
          rows: table.rows.map((row) => row.filter((_, currentIndex) => currentIndex !== columnIndex)),
        };
      }),
    }));
  };

  const updateInfoTableColumn = (tableIndex: number, columnIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) =>
        index === tableIndex
          ? {
              ...table,
              columns: table.columns.map((column, currentIndex) =>
                currentIndex === columnIndex ? value : column
              ),
            }
          : table
      ),
    }));
  };

  const addInfoTableRow = (tableIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) => {
        if (index !== tableIndex || table.rows.length >= PACKAGE_INFO_TABLE_LIMITS.maxRows) return table;

        return {
          ...table,
          rows: [...table.rows, Array.from({ length: table.columns.length }, () => '')],
        };
      }),
    }));
  };

  const removeInfoTableRow = (tableIndex: number, rowIndex: number) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) =>
        index === tableIndex
          ? { ...table, rows: table.rows.filter((_, currentIndex) => currentIndex !== rowIndex) }
          : table
      ),
    }));
  };

  const updateInfoTableCell = (tableIndex: number, rowIndex: number, columnIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      infoTables: prev.infoTables.map((table, index) =>
        index === tableIndex
          ? {
              ...table,
              rows: table.rows.map((row, currentRowIndex) =>
                currentRowIndex === rowIndex
                  ? table.columns.map((_, currentColumnIndex) =>
                      currentColumnIndex === columnIndex ? value : row[currentColumnIndex] || ''
                    )
                  : row
              ),
            }
          : table
      ),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData(prev => ({
        ...prev,
        image: data.data.url
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: '', description: '' }
      ]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  const updateItineraryDay = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Tour Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a category</option>
            <option value="Umrah">Umrah</option>
            <option value="Asia">Asia</option>
            <option value="Africa">Africa</option>
            <option value="Europe">Europe</option>
            <option value="Americas">Americas</option>
          </select>
        </div>

        <div>
          <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-1">
            Package Type *
          </label>
          <select
            id="packageType"
            name="packageType"
            required
            value={formData.packageType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">Standard Package</option>
            <option value="umrah">Umrah Package</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Determines which application form fields will be required for bookings
          </p>
        </div>

        <div>
          <label htmlFor="pricingMode" className="block text-sm font-medium text-gray-700 mb-1">
            Pricing Mode *
          </label>
          <select
            id="pricingMode"
            name="pricingMode"
            required
            value={formData.pricingMode}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="quote_required">Quote Required</option>
            <option value="fixed">Fixed Price (legacy)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Use quote required for packages whose final price depends on travelers and availability.
          </p>
        </div>

        <div>
          <label htmlFor="priceLabel" className="block text-sm font-medium text-gray-700 mb-1">
            Public Price Label
          </label>
          <input
            type="text"
            id="priceLabel"
            name="priceLabel"
            value={formData.priceLabel}
            onChange={handleChange}
            placeholder="e.g., Price confirmed after review"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 mb-1">
            Starting From Price Per Person (CAD)
          </label>
          <input
            type="number"
            id="startingPrice"
            name="startingPrice"
            min="0"
            step="0.01"
            value={formData.startingPrice}
            onChange={handleChange}
            placeholder="e.g., 1999"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Public display only. Final checkout pricing is still set on each booking quote.
          </p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Legacy Price Text
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Optional legacy display value"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Kept for old records and PDFs. New checkout pricing is set on each booking quote.
          </p>
        </div>

        <div>
          <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">
            Dates *
          </label>
          <input
            type="text"
            id="dates"
            name="dates"
            required
            value={formData.dates}
            onChange={handleChange}
            placeholder="e.g., December 18th - January 1st"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
            Departure
          </label>
          <input
            type="text"
            id="departure"
            name="departure"
            value={formData.departure}
            onChange={handleChange}
            placeholder="e.g., Vancouver"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-1">
            Accommodation *
          </label>
          <input
            type="text"
            id="accommodation"
            name="accommodation"
            required
            value={formData.accommodation}
            onChange={handleChange}
            placeholder="e.g., 4* Hotels"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tour Image *
          </label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {uploading && (
                <span className="flex items-center text-sm text-gray-600">
                  Uploading...
                </span>
              )}
            </div>
            <input
              type="url"
              id="image"
              name="image"
              required
              value={formData.image}
              onChange={handleChange}
              placeholder="Or paste image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="h-32 w-auto rounded border" />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <RichTextEditor
            initialContent={formData.description}
            onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
          />
        </div>

        <div className="md:col-span-2">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Custom Information Tables
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Optional. Add flexible tables for accommodations, flight options, approximate prices, or package notes.
              </p>
            </div>
            <button
              type="button"
              onClick={addInfoTable}
              disabled={formData.infoTables.length >= PACKAGE_INFO_TABLE_LIMITS.maxTables}
              className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              + Add Table
            </button>
          </div>

          {formData.infoTables.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">
              No custom tables added. Packages will display normally without this section.
            </div>
          ) : (
            <div className="space-y-5">
              {formData.infoTables.map((table, tableIndex) => (
                <div key={tableIndex} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-[1fr_1fr]">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                          Table Title
                        </label>
                        <input
                          type="text"
                          value={table.title}
                          maxLength={PACKAGE_INFO_TABLE_LIMITS.maxTitleLength}
                          onChange={(e) => updateInfoTable(tableIndex, { title: e.target.value })}
                          placeholder="e.g. Accommodation Options"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={table.notes || ''}
                          maxLength={PACKAGE_INFO_TABLE_LIMITS.maxNotesLength}
                          onChange={(e) => updateInfoTable(tableIndex, { notes: e.target.value })}
                          placeholder="Optional caption or disclaimer"
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInfoTable(tableIndex)}
                      className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete Table
                    </button>
                  </div>

                  <div className="max-w-full overflow-x-auto rounded border border-gray-200">
                    <table className="min-w-[760px] divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {table.columns.map((column, columnIndex) => (
                            <th key={columnIndex} className="min-w-44 px-3 py-3 text-left align-top">
                              <div className="flex items-start gap-2">
                                <input
                                  type="text"
                                  value={column}
                                  maxLength={PACKAGE_INFO_TABLE_LIMITS.maxCellLength}
                                  onChange={(e) => updateInfoTableColumn(tableIndex, columnIndex, e.target.value)}
                                  placeholder={`Column ${columnIndex + 1}`}
                                  className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1.5 text-xs font-semibold uppercase text-gray-700 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                                {table.columns.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeInfoTableColumn(tableIndex, columnIndex)}
                                    className="rounded px-2 py-1 text-sm leading-none text-red-500 hover:bg-red-50"
                                    title="Remove column"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="w-20 px-3 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                            Row
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {table.columns.map((_, columnIndex) => (
                              <td key={columnIndex} className="px-3 py-3 align-top">
                                <textarea
                                  value={row[columnIndex] || ''}
                                  maxLength={PACKAGE_INFO_TABLE_LIMITS.maxCellLength}
                                  onChange={(e) => updateInfoTableCell(tableIndex, rowIndex, columnIndex, e.target.value)}
                                  placeholder="Enter information"
                                  rows={2}
                                  className="min-h-16 w-full resize-y rounded border border-gray-300 px-2 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-3 text-right align-top">
                              <button
                                type="button"
                                onClick={() => removeInfoTableRow(tableIndex, rowIndex)}
                                className="rounded border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => addInfoTableRow(tableIndex)}
                      disabled={table.rows.length >= PACKAGE_INFO_TABLE_LIMITS.maxRows}
                      className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      + Add Row
                    </button>
                    <button
                      type="button"
                      onClick={() => addInfoTableColumn(tableIndex)}
                      disabled={table.columns.length >= PACKAGE_INFO_TABLE_LIMITS.maxColumns}
                      className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      + Add Column
                    </button>
                    <span className="self-center text-xs text-gray-500">
                      {table.rows.length}/{PACKAGE_INFO_TABLE_LIMITS.maxRows} rows, {table.columns.length}/{PACKAGE_INFO_TABLE_LIMITS.maxColumns} columns
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Inclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inclusionInput}
            onChange={(e) => setInclusionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('inclusions', inclusionInput);
                setInclusionInput('');
              }
            }}
            placeholder="e.g. Roundtrip Airfare"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => { addItem('inclusions', inclusionInput); setInclusionInput(''); }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            + Add
          </button>
        </div>
        {formData.inclusions.length > 0 && (
          <ul className="space-y-2">
            {formData.inclusions.map((item, i) => (
              <li key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem('inclusions', i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none ml-3"
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {formData.inclusions.length === 0 && (
          <p className="text-sm text-gray-400 italic">No inclusions added yet.</p>
        )}
      </div>

      {/* Exclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exclusions</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={exclusionInput}
            onChange={(e) => setExclusionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('exclusions', exclusionInput);
                setExclusionInput('');
              }
            }}
            placeholder="e.g. Travel Insurance"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => { addItem('exclusions', exclusionInput); setExclusionInput(''); }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            + Add
          </button>
        </div>
        {formData.exclusions.length > 0 && (
          <ul className="space-y-2">
            {formData.exclusions.map((item, i) => (
              <li key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded px-3 py-2">
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span className="text-red-500 font-bold">✗</span> {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem('exclusions', i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none ml-3"
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {formData.exclusions.length === 0 && (
          <p className="text-sm text-gray-400 italic">No exclusions added yet.</p>
        )}
      </div>

      {/* Itinerary */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Itinerary</label>
          <button
            type="button"
            onClick={addItineraryDay}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
          >
            + Add Day
          </button>
        </div>
        <div className="space-y-4">
          {formData.itinerary.map((day, index) => (
            <div key={index} className="border border-gray-300 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Day {day.day}</p>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={day.title}
                onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                placeholder="Day title"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              />
              <textarea
                value={day.description}
                onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                placeholder="Day description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : tourId ? 'Update Tour' : 'Create Tour'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
