"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { MoqProgress } from "@/components/MoqProgress";
import { BidForm } from "@/components/BidForm";

interface BidUser {
  id: string;
  name: string | null;
}

interface BidData {
  id: string;
  userId: string;
  user: BidUser;
  minKg: number;
  maxKg: number;
  pricePerKg: number;
  status: string;
  createdAt: string;
}

interface OrderBean {
  id: string;
  name: string;
  origin: string;
  roastLevel: string | null;
  pricePerKg: number;
  flavorNotes: string[];
  description: string | null;
}

interface OrderData {
  id: string;
  proposalId: number;
  coffeeBean: OrderBean;
  targetQuantityKg: number;
  moqKg: number;
  totalBidKg: number;
  biddingEndsAt: string;
  status: string;
  bids: BidData[];
}

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${mins}m left`;
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) {
      setOrder(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="text-center py-16 text-stone-500">Loading...</div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="text-lg">Order not found.</p>
        <Link
          href="/"
          className="text-amber-500 hover:text-amber-400 mt-2 inline-block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isBiddingOpen =
    order.status === "bidding" && new Date(order.biddingEndsAt) > new Date();
  const moqMet = order.totalBidKg >= order.moqKg;

  const myBid =
    session?.user?.id
      ? order.bids.find(
          (b) => b.userId === session.user.id && b.status !== "cancelled"
        )
      : null;

  const activeBids = order.bids.filter((b) => b.status !== "cancelled");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/"
        className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-stone-500">
              Proposal #{order.proposalId}
            </span>
            <StatusBadge status={order.status} moqMet={moqMet} />
          </div>
          <h1 className="text-2xl font-bold">{order.coffeeBean.name}</h1>
          <p className="text-stone-400 text-sm">{order.coffeeBean.origin}</p>
        </div>
        <span className="text-sm text-stone-500">
          {timeRemaining(order.biddingEndsAt)}
        </span>
      </div>

      {/* Order details */}
      <div className="grid grid-cols-3 gap-4">
        <InfoCard
          label="Target Qty"
          value={`${order.targetQuantityKg.toLocaleString()} kg`}
        />
        <InfoCard label="MOQ" value={`${order.moqKg.toLocaleString()} kg`} />
        <InfoCard
          label="Reference Price"
          value={`$${order.coffeeBean.pricePerKg.toFixed(2)}/kg`}
        />
      </div>

      {/* MOQ progress */}
      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
        <h3 className="font-semibold mb-4">Order Progress</h3>
        <MoqProgress
          totalBidKg={order.totalBidKg}
          moqKg={order.moqKg}
          targetQuantityKg={order.targetQuantityKg}
        />
      </div>

      {/* Bidding form */}
      {isBiddingOpen && session?.user && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
          <h3 className="font-semibold mb-1">
            {myBid ? "Your Bid" : "Place a Bid"}
          </h3>
          <p className="text-sm text-stone-400 mb-4">
            Specify the range of kg you want and your price per kg.
          </p>
          <BidForm
            orderId={order.id}
            existingBid={myBid || null}
            onSuccess={fetchOrder}
          />
        </div>
      )}

      {!session?.user && isBiddingOpen && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5 text-center">
          <p className="text-stone-400 mb-3">
            Sign in to place a bid on this order.
          </p>
          <Link
            href="/login"
            className="inline-block bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}

      {!isBiddingOpen && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5 text-center">
          <p className="text-stone-400">
            Bidding has ended for this order.{" "}
            {moqMet
              ? "The MOQ was met -- this order is confirmed!"
              : "The MOQ was not met."}
          </p>
        </div>
      )}

      {/* Bids list */}
      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
        <h3 className="font-semibold mb-3">
          Bids ({activeBids.length})
        </h3>
        {activeBids.length === 0 ? (
          <p className="text-stone-500 text-sm">No bids yet.</p>
        ) : (
          <div className="space-y-2">
            {activeBids.map((bid) => (
              <div
                key={bid.id}
                className={`flex items-center justify-between p-3 rounded-md ${
                  bid.userId === session?.user?.id
                    ? "bg-amber-900/20 border border-amber-800/30"
                    : "bg-stone-800"
                }`}
              >
                <div>
                  <span className="text-sm text-stone-300">
                    {bid.user.name || "Anonymous"}
                    {bid.userId === session?.user?.id && (
                      <span className="text-xs text-amber-400 ml-2">
                        (You)
                      </span>
                    )}
                  </span>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {bid.minKg} - {bid.maxKg} kg @ ${bid.pricePerKg.toFixed(2)}/kg
                  </p>
                </div>
                <span className="text-sm text-stone-400 font-mono">
                  {bid.maxKg} kg
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  moqMet,
}: {
  status: string;
  moqMet: boolean;
}) {
  if (status === "confirmed") {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
        Confirmed
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-300 border border-red-700">
        Failed
      </span>
    );
  }
  if (status === "fulfilled") {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-900 text-blue-300 border border-blue-700">
        Fulfilled
      </span>
    );
  }
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        moqMet
          ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
          : "bg-amber-900 text-amber-300 border border-amber-700"
      }`}
    >
      {moqMet ? "Bidding (MOQ Met)" : "Bidding"}
    </span>
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
