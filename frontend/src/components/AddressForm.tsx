"use client";

import { useState } from "react";

interface AddressData {
  id?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label?: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initial?: AddressData;
  onSubmit: (data: AddressData) => Promise<void>;
  onCancel: () => void;
}

export function AddressForm({ initial, onSubmit, onCancel }: AddressFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName || "");
  const [line1, setLine1] = useState(initial?.line1 || "");
  const [line2, setLine2] = useState(initial?.line2 || "");
  const [city, setCity] = useState(initial?.city || "");
  const [state, setState] = useState(initial?.state || "");
  const [zip, setZip] = useState(initial?.zip || "");
  const [country, setCountry] = useState(initial?.country || "US");
  const [label, setLabel] = useState(initial?.label || "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onSubmit({
        id: initial?.id,
        fullName,
        line1,
        line2: line2 || undefined,
        city,
        state,
        zip,
        country,
        label: label || undefined,
        isDefault,
      });
    } catch {
      setError("Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block col-span-2 sm:col-span-1">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            Full Name
          </span>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="John Doe"
          />
        </label>

        <label className="block col-span-2 sm:col-span-1">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            Label (optional)
          </span>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClass}
            placeholder="e.g. Home, Office"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-300 mb-1 block">
          Address Line 1
        </span>
        <input
          type="text"
          required
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          className={inputClass}
          placeholder="123 Main St"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-stone-300 mb-1 block">
          Address Line 2 (optional)
        </span>
        <input
          type="text"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          className={inputClass}
          placeholder="Apt 4B"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            City
          </span>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="New York"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            State / Province
          </span>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={inputClass}
            placeholder="NY"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            ZIP / Postal Code
          </span>
          <input
            type="text"
            required
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className={inputClass}
            placeholder="10001"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            Country
          </span>
          <input
            type="text"
            required
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
            placeholder="US"
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded bg-stone-800 border-stone-700 text-amber-600 focus:ring-amber-600"
        />
        <span className="text-sm text-stone-300">Set as default address</span>
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
        >
          {isLoading
            ? "Saving..."
            : initial?.id
              ? "Update Address"
              : "Add Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 bg-stone-700 hover:bg-stone-600 text-stone-300 font-medium py-2.5 rounded-md transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
