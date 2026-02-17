"use client";

import Link from "next/link";

interface BeanCardProps {
  id: string;
  name: string;
  origin: string;
  roastLevel?: string | null;
  flavorNotes: string[];
  pricePerKg: number;
  moqKg: number;
  description?: string | null;
}

export function BeanCard({
  id,
  name,
  origin,
  roastLevel,
  flavorNotes,
  pricePerKg,
  moqKg,
}: BeanCardProps) {
  return (
    <Link
      href={`/beans/${id}`}
      className="block rounded-lg border border-stone-800 bg-stone-900 hover:border-amber-700/50 hover:bg-stone-900/80 transition-colors overflow-hidden"
    >
      <div className="h-32 bg-gradient-to-br from-amber-900/30 to-stone-800 flex items-center justify-center">
        <span className="text-4xl">&#9749;</span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-stone-100 leading-tight">{name}</h3>
          {roastLevel && (
            <span className="shrink-0 px-2 py-0.5 text-xs rounded-full bg-amber-900/50 text-amber-300 border border-amber-800">
              {roastLevel}
            </span>
          )}
        </div>

        <p className="text-sm text-stone-400">{origin}</p>

        <div className="flex flex-wrap gap-1">
          {flavorNotes.slice(0, 3).map((note) => (
            <span
              key={note}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700"
            >
              {note}
            </span>
          ))}
          {flavorNotes.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-stone-500">
              +{flavorNotes.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <span className="text-sm font-medium text-amber-400">
            ${pricePerKg.toFixed(2)}/kg
          </span>
          <span className="text-xs text-stone-500">
            MOQ: {moqKg.toLocaleString()} kg
          </span>
        </div>
      </div>
    </Link>
  );
}
