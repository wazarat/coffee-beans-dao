"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import Link from "next/link";
import {
  GOVERNANCE_TOKEN_ADDRESS,
  COFFEE_BEANS_DAO_ADDRESS,
  governanceTokenAbi,
  coffeeBeansDAOAbi,
} from "@/lib/contracts";
import { WaitlistForm } from "@/components/WaitlistForm";

interface ActiveOrder {
  id: string;
  proposalId: number;
  targetQuantityKg: number;
  moqKg: number;
  totalBidKg: number;
  biddingEndsAt: string;
  status: string;
  coffeeBean: {
    id: string;
    name: string;
    origin: string;
    roastLevel: string | null;
    pricePerKg: number;
  };
  _count: { bids: number };
}

interface UserBid {
  id: string;
  minKg: number;
  maxKg: number;
  pricePerKg: number;
  status: string;
  order: {
    id: string;
    proposalId: number;
    status: string;
    coffeeBean: { name: string };
  };
}

function StatusBadge({
  proposal,
}: {
  proposal: {
    executed: boolean;
    passed: boolean;
    votingEndsAt: bigint;
    totalYesWeight: bigint;
    totalNoWeight: bigint;
  };
}) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (proposal.executed && proposal.passed) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
        Passed
      </span>
    );
  }
  if (proposal.executed && !proposal.passed) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-300 border border-red-700">
        Defeated
      </span>
    );
  }
  if (now < proposal.votingEndsAt) {
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-900 text-amber-300 border border-amber-700">
        Active
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 text-xs rounded-full bg-stone-700 text-stone-300 border border-stone-600">
      Awaiting Execution
    </span>
  );
}

function timeRemaining(votingEndsAt: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (now >= votingEndsAt) return "Ended";
  const diff = Number(votingEndsAt - now);
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((diff % 3600) / 60);
  return `${hours}h ${mins}m left`;
}

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { data: session } = useSession();

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [userBids, setUserBids] = useState<UserBid[]>([]);

  useEffect(() => {
    fetch("/api/orders?status=bidding")
      .then((res) => (res.ok ? res.json() : []))
      .then(setActiveOrders)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/bids/mine")
        .then((res) => (res.ok ? res.json() : []))
        .then(setUserBids)
        .catch(() => {});
    }
  }, [session]);

  const { data: tokenBalance } = useReadContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: governanceTokenAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: votingPower } = useReadContract({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "getVotingPower",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: proposalCount } = useReadContract({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "proposalCount",
  });

  const count = proposalCount ? Number(proposalCount) : 0;

  const proposalCalls = Array.from({ length: count }, (_, i) => ({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "getProposal" as const,
    args: [BigInt(i + 1)] as const,
  }));

  const { data: proposalsData } = useReadContracts({
    contracts: proposalCalls,
    query: { enabled: count > 0 },
  });

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Your Balance"
          value={
            isConnected && tokenBalance !== undefined
              ? `${Number(formatEther(tokenBalance)).toLocaleString()} COF`
              : "--"
          }
        />
        <StatCard
          label="Voting Power"
          value={
            isConnected && votingPower !== undefined
              ? Number(votingPower).toLocaleString()
              : "--"
          }
          subtitle="sqrt(balance)"
        />
        <StatCard label="Total Proposals" value={count.toString()} />
      </section>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const moqPct = Math.min(
                (order.totalBidKg / order.moqKg) * 100,
                100
              );
              const moqMet = order.totalBidKg >= order.moqKg;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-4 rounded-lg border border-stone-800 bg-stone-900 hover:border-amber-700/50 hover:bg-stone-900/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-stone-500">
                          Proposal #{order.proposalId}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            moqMet
                              ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
                              : "bg-amber-900 text-amber-300 border border-amber-700"
                          }`}
                        >
                          {moqMet ? "MOQ Met" : "Bidding"}
                        </span>
                      </div>
                      <h3 className="font-medium text-stone-100">
                        {order.coffeeBean.name}
                      </h3>
                      <div className="flex gap-4 mt-1 text-xs text-stone-500">
                        <span>{order.coffeeBean.origin}</span>
                        <span>
                          {order.totalBidKg}/{order.moqKg} kg
                        </span>
                        <span>{order._count.bids} bids</span>
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="text-xs text-stone-500 mb-1 text-right">
                        {moqPct.toFixed(0)}%
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            moqMet ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                          style={{ width: `${moqPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Your Bids */}
      {session?.user && userBids.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
          <div className="space-y-2">
            {userBids.slice(0, 5).map((bid) => (
              <Link
                key={bid.id}
                href={`/orders/${bid.order.id}`}
                className="block p-3 rounded-lg border border-stone-800 bg-stone-900 hover:border-amber-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-stone-200">
                      {bid.order.coffeeBean.name}
                    </span>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {bid.minKg}-{bid.maxKg} kg @ ${bid.pricePerKg.toFixed(2)}
                      /kg
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      bid.status === "accepted"
                        ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
                        : bid.status === "cancelled"
                          ? "bg-red-900 text-red-300 border border-red-700"
                          : "bg-stone-700 text-stone-300 border border-stone-600"
                    }`}
                  >
                    {bid.status}
                  </span>
                </div>
              </Link>
            ))}
            {userBids.length > 5 && (
              <Link
                href="/profile"
                className="block text-center text-sm text-amber-500 hover:text-amber-400 py-2"
              >
                View all bids in profile &rarr;
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section>
        <WaitlistForm />
      </section>

      {/* Proposals list */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Proposals</h2>
          <Link
            href="/proposals/new"
            className="text-sm bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            + New Proposal
          </Link>
        </div>

        {count === 0 && (
          <div className="text-center py-12 text-stone-500">
            <p className="text-lg">No proposals yet.</p>
            <p className="text-sm mt-1">
              Be the first to submit a coffee bean order proposal.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {proposalsData
            ?.map((result, i) => {
              if (result.status !== "success") return null;
              const p = result.result as {
                id: bigint;
                proposer: string;
                description: string;
                coffeeBeanType: string;
                quantityKg: bigint;
                pricePerKgWei: bigint;
                votingEndsAt: bigint;
                executed: boolean;
                passed: boolean;
                totalYesWeight: bigint;
                totalNoWeight: bigint;
              };
              if (p.id === 0n) return null;
              return (
                <Link
                  key={i}
                  href={`/proposals/${Number(p.id)}`}
                  className="block p-4 rounded-lg border border-stone-800 bg-stone-900 hover:border-amber-700/50 hover:bg-stone-900/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-stone-500">
                          #{Number(p.id)}
                        </span>
                        <StatusBadge proposal={p} />
                        <span className="text-xs text-stone-500">
                          {timeRemaining(p.votingEndsAt)}
                        </span>
                      </div>
                      <h3 className="font-medium text-stone-100 truncate">
                        {p.description}
                      </h3>
                      <div className="flex gap-4 mt-1 text-xs text-stone-500">
                        <span>{p.coffeeBeanType}</span>
                        <span>{Number(p.quantityKg).toLocaleString()} kg</span>
                        <span>
                          {formatEther(p.pricePerKgWei)} ETH/kg
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-stone-500 shrink-0">
                      <div className="text-emerald-400">
                        Yes: {Number(p.totalYesWeight)}
                      </div>
                      <div className="text-red-400">
                        No: {Number(p.totalNoWeight)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
            .reverse()}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-stone-800 bg-stone-900 p-4">
      <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-stone-100">{value}</p>
      {subtitle && (
        <p className="text-xs text-stone-600 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}
