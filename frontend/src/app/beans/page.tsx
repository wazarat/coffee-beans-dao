"use client";

import { useEffect, useState } from "react";
import { BeanCard } from "@/components/BeanCard";

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
}

const ORIGINS = [
  "Ethiopia",
  "Colombia",
  "Guatemala",
  "Kenya",
  "Indonesia",
  "Brazil",
  "Costa Rica",
  "Rwanda",
];

const ROAST_LEVELS = ["Light", "Light-Medium", "Medium", "Medium-Dark", "Dark"];

export default function BeansPage() {
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [roastLevel, setRoastLevel] = useState("");
  const [sort, setSort] = useState("name");

  useEffect(() => {
    async function fetchBeans() {
      setLoading(true);
      const params = new URLSearchParams();
      if (origin) params.set("origin", origin);
      if (roastLevel) params.set("roastLevel", roastLevel);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/beans?${params.toString()}`);
      if (res.ok) {
        setBeans(await res.json());
      }
      setLoading(false);
    }

    fetchBeans();
  }, [origin, roastLevel, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coffee Bean Catalog</h1>
        <p className="text-stone-400 mt-1">
          Browse available beans and propose a collective order for your DAO
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600"
        >
          <option value="">All Origins</option>
          {ORIGINS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          value={roastLevel}
          onChange={(e) => setRoastLevel(e.target.value)}
          className="bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600"
        >
          <option value="">All Roast Levels</option>
          {ROAST_LEVELS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-100 focus:outline-none focus:border-amber-600"
        >
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price (low to high)</option>
          <option value="price_desc">Sort: Price (high to low)</option>
          <option value="moq">Sort: MOQ (low to high)</option>
        </select>
      </div>

      {/* Bean grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-500">
          Loading beans...
        </div>
      ) : beans.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <p className="text-lg">No beans found.</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beans.map((bean) => (
            <BeanCard key={bean.id} {...bean} />
          ))}
        </div>
      )}
    </div>
  );
}
