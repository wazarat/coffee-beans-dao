"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface BeanOrder {
  id: string;
  proposalId: number;
  targetQuantityKg: number;
  moqKg: number;
  totalBidKg: number;
  biddingEndsAt: string;
  status: string;
}

interface CoffeeBean {
  id: string;
  name: string;
  origin: string;
  region?: string | null;
  process?: string | null;
  roastLevel?: string | null;
  flavorNotes: string[];
  description?: string | null;
  pricePerKg: number;
  moqKg: number;
  available: boolean;
  orders: BeanOrder[];
}

export default function BeanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [bean, setBean] = useState<CoffeeBean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBean() {
      const res = await fetch(`/api/beans/${id}`);
      if (res.ok) {
        setBean(await res.json());
      }
      setLoading(false);
    }
    fetchBean();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-16 text-stone-500">Loading...</div>
    );
  }

  if (!bean) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="text-lg">Bean not found.</p>
        <Link
          href="/beans"
          className="text-amber-500 hover:text-amber-400 mt-2 inline-block"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/beans"
        className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
      >
        &larr; Back to Catalog
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{bean.name}</h1>
          <p className="text-stone-400 mt-1">
            {bean.origin}
            {bean.region && ` \u2022 ${bean.region}`}
          </p>
        </div>
        {bean.roastLevel && (
          <span className="px-3 py-1 text-sm rounded-full bg-amber-900/50 text-amber-300 border border-amber-800">
            {bean.roastLevel}
          </span>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <InfoCard label="Price / kg" value={`$${bean.pricePerKg.toFixed(2)}`} />
        <InfoCard label="MOQ" value={`${bean.moqKg.toLocaleString()} kg`} />
        {bean.process && <InfoCard label="Process" value={bean.process} />}
        <InfoCard
          label="Status"
          value={bean.available ? "Available" : "Unavailable"}
        />
      </div>

      {/* Description */}
      {bean.description && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
          <h3 className="font-semibold mb-2">About this bean</h3>
          <p className="text-stone-400 leading-relaxed">{bean.description}</p>
        </div>
      )}

      {/* Flavor notes */}
      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
        <h3 className="font-semibold mb-3">Flavor Notes</h3>
        <div className="flex flex-wrap gap-2">
          {bean.flavorNotes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-sm"
            >
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Active orders */}
      {bean.orders.length > 0 && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
          <h3 className="font-semibold mb-3">Active Orders</h3>
          <div className="space-y-3">
            {bean.orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-3 rounded-md bg-stone-800 hover:bg-stone-700/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-300">
                    Order from Proposal #{order.proposalId}
                  </span>
                  <span className="text-xs text-amber-400">
                    {order.totalBidKg}/{order.moqKg} kg bid
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Propose action */}
      <div className="flex gap-3">
        <Link
          href={`/proposals/new?bean=${bean.id}&beanName=${encodeURIComponent(bean.name)}&quantity=${bean.moqKg}&price=${bean.pricePerKg}`}
          className="flex-1 text-center bg-amber-700 hover:bg-amber-600 text-white font-medium py-3 rounded-md transition-colors"
        >
          Propose This Bean Order
        </Link>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-800 bg-stone-900 p-3">
      <p className="text-xs uppercase tracking-wider text-stone-500 mb-0.5">
        {label}
      </p>
      <p className="font-medium text-stone-100">{value}</p>
    </div>
  );
}
