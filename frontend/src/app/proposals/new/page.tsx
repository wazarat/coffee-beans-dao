"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { COFFEE_BEANS_DAO_ADDRESS, coffeeBeansDAOAbi } from "@/lib/contracts";

const SECONDS_PER_DAY = 86400;

export default function NewProposalPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto text-center py-16 text-stone-500">
          Loading...
        </div>
      }
    >
      <NewProposal />
    </Suspense>
  );
}

function NewProposal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();

  const prefillBeanName = searchParams.get("beanName") || "";
  const prefillQuantity = searchParams.get("quantity") || "";
  const prefillPrice = searchParams.get("price") || "";

  const [description, setDescription] = useState(
    prefillBeanName
      ? `Order ${prefillQuantity} kg ${prefillBeanName}`
      : ""
  );
  const [coffeeBeanType, setCoffeeBeanType] = useState(prefillBeanName);
  const [quantityKg, setQuantityKg] = useState(prefillQuantity);
  const [pricePerKg, setPricePerKg] = useState(prefillPrice);
  const [votingDays, setVotingDays] = useState("7");

  const { writeContract, data: txHash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isConnected) return;

    writeContract({
      address: COFFEE_BEANS_DAO_ADDRESS,
      abi: coffeeBeansDAOAbi,
      functionName: "submitProposal",
      args: [
        description,
        coffeeBeanType,
        BigInt(quantityKg),
        parseEther(pricePerKg),
        BigInt(Number(votingDays) * SECONDS_PER_DAY),
      ],
    });
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-4xl mb-4">&#9989;</div>
        <h2 className="text-xl font-bold text-emerald-400 mb-2">
          Proposal Submitted!
        </h2>
        <p className="text-stone-400 mb-6">
          Your proposal has been recorded on-chain. Members can now vote.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-amber-700 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a New Proposal</h1>
      <p className="text-stone-400 text-sm mb-6">
        Propose a collective coffee bean order. Other DAO members will vote
        using quadratic voting.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Description">
          <textarea
            required
            rows={3}
            placeholder='e.g. "Order 500 kg Ethiopian Yirgacheffe for Q2 2026"'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600 resize-none"
          />
        </Field>

        <Field label="Coffee Bean Type">
          <input
            required
            type="text"
            placeholder="e.g. Ethiopian Yirgacheffe"
            value={coffeeBeanType}
            onChange={(e) => setCoffeeBeanType(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Quantity (kg)">
            <input
              required
              type="number"
              min="1"
              placeholder="500"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
          </Field>
          <Field label="Price per kg (ETH)">
            <input
              required
              type="text"
              placeholder="0.01"
              value={pricePerKg}
              onChange={(e) => setPricePerKg(e.target.value)}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-600"
            />
          </Field>
        </div>

        <Field label="Voting Period (days)">
          <select
            value={votingDays}
            onChange={(e) => setVotingDays(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-600"
          >
            {[1, 3, 5, 7, 14, 21, 30].map((d) => (
              <option key={d} value={d}>
                {d} day{d > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
            {error.message.slice(0, 200)}
          </div>
        )}

        <button
          type="submit"
          disabled={!isConnected || isPending || isConfirming}
          className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2.5 rounded-md transition-colors"
        >
          {!isConnected
            ? "Connect Wallet First"
            : isPending
              ? "Confirm in Wallet..."
              : isConfirming
                ? "Confirming..."
                : "Submit Proposal"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-stone-300 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
