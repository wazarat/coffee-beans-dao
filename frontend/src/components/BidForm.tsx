"use client";

import { useState } from "react";

interface BidFormProps {
  orderId: string;
  existingBid?: {
    id: string;
    minKg: number;
    maxKg: number;
    pricePerKg: number;
  } | null;
  onSuccess: () => void;
}

export function BidForm({ orderId, existingBid, onSuccess }: BidFormProps) {
  const [minKg, setMinKg] = useState(
    existingBid ? String(existingBid.minKg) : ""
  );
  const [maxKg, setMaxKg] = useState(
    existingBid ? String(existingBid.maxKg) : ""
  );
  const [pricePerKg, setPricePerKg] = useState(
    existingBid ? String(existingBid.pricePerKg) : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!existingBid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isEditing) {
        const res = await fetch("/api/bids", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bidId: existingBid.id,
            minKg: Number(minKg),
            maxKg: Number(maxKg),
            pricePerKg: Number(pricePerKg),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to update bid");
          return;
        }
      } else {
        const res = await fetch("/api/bids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            minKg: Number(minKg),
            maxKg: Number(maxKg),
            pricePerKg: Number(pricePerKg),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Failed to place bid");
          return;
        }
      }

      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!existingBid) return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/bids?id=${existingBid.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to cancel bid");
        return;
      }

      onSuccess();
    } catch {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            Min Quantity (kg)
          </span>
          <input
            type="number"
            required
            min="1"
            value={minKg}
            onChange={(e) => setMinKg(e.target.value)}
            placeholder="e.g. 10"
            className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-300 mb-1 block">
            Max Quantity (kg)
          </span>
          <input
            type="number"
            required
            min="1"
            value={maxKg}
            onChange={(e) => setMaxKg(e.target.value)}
            placeholder="e.g. 50"
            className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-stone-300 mb-1 block">
          Your Price Per kg ($)
        </span>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          value={pricePerKg}
          onChange={(e) => setPricePerKg(e.target.value)}
          placeholder="e.g. 18.50"
          className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
        >
          {isLoading
            ? "Submitting..."
            : isEditing
              ? "Update Bid"
              : "Place Bid"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 bg-red-800 hover:bg-red-700 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
          >
            Cancel Bid
          </button>
        )}
      </div>
    </form>
  );
}
