"use client";

import { use, useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther } from "viem";
import Link from "next/link";
import {
  COFFEE_BEANS_DAO_ADDRESS,
  coffeeBeansDAOAbi,
} from "@/lib/contracts";

interface LinkedOrder {
  id: string;
  status: string;
  totalBidKg: number;
  moqKg: number;
}

export default function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const proposalId = BigInt(id);
  const { address, isConnected } = useAccount();

  const { data: proposal, refetch: refetchProposal } = useReadContract({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "getProposal",
    args: [proposalId],
  });

  const { data: hasVotedData } = useReadContract({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "hasVoted",
    args: address ? [proposalId, address] : undefined,
    query: { enabled: !!address },
  });

  const { data: votingPower } = useReadContract({
    address: COFFEE_BEANS_DAO_ADDRESS,
    abi: coffeeBeansDAOAbi,
    functionName: "getVotingPower",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    writeContract: voteWrite,
    data: voteTxHash,
    isPending: voteIsPending,
    error: voteError,
  } = useWriteContract();

  const { isLoading: voteConfirming, isSuccess: voteSuccess } =
    useWaitForTransactionReceipt({ hash: voteTxHash });

  const {
    writeContract: execWrite,
    data: execTxHash,
    isPending: execIsPending,
    error: execError,
  } = useWriteContract();

  const { isLoading: execConfirming, isSuccess: execSuccess } =
    useWaitForTransactionReceipt({ hash: execTxHash });

  const [linkedOrder, setLinkedOrder] = useState<LinkedOrder | null>(null);

  useEffect(() => {
    async function checkOrder() {
      try {
        const res = await fetch(`/api/orders?proposalId=${id}`);
        if (res.ok) {
          const orders = await res.json();
          const match = orders.find(
            (o: { proposalId: number }) => o.proposalId === Number(id)
          );
          if (match) setLinkedOrder(match);
        }
      } catch {
        // ignore
      }
    }
    checkOrder();
  }, [id, execSuccess]);

  // Refetch after vote/exec success
  if (voteSuccess || execSuccess) {
    refetchProposal();
  }

  if (!proposal || (proposal as { id: bigint }).id === 0n) {
    return (
      <div className="text-center py-16 text-stone-500">
        <p className="text-lg">Proposal not found.</p>
        <Link href="/" className="text-amber-500 hover:text-amber-400 mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const p = proposal as {
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

  const now = BigInt(Math.floor(Date.now() / 1000));
  const isActive = now < p.votingEndsAt;
  const canVote = isConnected && isActive && !hasVotedData && !voteSuccess;
  const canExecute = isConnected && !isActive && !p.executed;

  const yesW = Number(p.totalYesWeight);
  const noW = Number(p.totalNoWeight);
  const total = yesW + noW;
  const yesPct = total > 0 ? (yesW / total) * 100 : 50;
  const noPct = total > 0 ? (noW / total) * 100 : 50;

  function handleVote(support: boolean) {
    voteWrite({
      address: COFFEE_BEANS_DAO_ADDRESS,
      abi: coffeeBeansDAOAbi,
      functionName: "vote",
      args: [proposalId, support],
    });
  }

  function handleExecute() {
    execWrite({
      address: COFFEE_BEANS_DAO_ADDRESS,
      abi: coffeeBeansDAOAbi,
      functionName: "executeProposal",
      args: [proposalId],
    });
  }

  function timeRemaining(): string {
    if (!isActive) return "Voting ended";
    const diff = Number(p.votingEndsAt - now);
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h ${mins}m remaining`;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="text-sm text-stone-500 hover:text-stone-300 transition-colors"
      >
        &larr; Back to Dashboard
      </Link>

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-stone-500">#{id}</span>
          {p.executed && p.passed && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
              Passed
            </span>
          )}
          {p.executed && !p.passed && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-300 border border-red-700">
              Defeated
            </span>
          )}
          {!p.executed && isActive && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-900 text-amber-300 border border-amber-700">
              Active
            </span>
          )}
          {!p.executed && !isActive && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-stone-700 text-stone-300 border border-stone-600">
              Awaiting Execution
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{p.description}</h1>
        <p className="text-sm text-stone-500 mt-1">
          Proposed by{" "}
          <span className="font-mono text-stone-400">
            {p.proposer.slice(0, 6)}...{p.proposer.slice(-4)}
          </span>
        </p>
      </div>

      {/* Order details */}
      <div className="grid grid-cols-3 gap-4">
        <InfoCard label="Coffee Bean" value={p.coffeeBeanType} />
        <InfoCard
          label="Quantity"
          value={`${Number(p.quantityKg).toLocaleString()} kg`}
        />
        <InfoCard
          label="Price / kg"
          value={`${formatEther(p.pricePerKgWei)} ETH`}
        />
      </div>

      {/* Voting status */}
      <div className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Vote Tally</h3>
          <span className="text-sm text-stone-500">{timeRemaining()}</span>
        </div>

        {/* Vote bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-emerald-400">
              Yes: {yesW} ({yesPct.toFixed(1)}%)
            </span>
            <span className="text-red-400">
              No: {noW} ({noPct.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-stone-700 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="bg-red-500 h-full transition-all"
              style={{ width: `${noPct}%` }}
            />
          </div>
          {total === 0 && (
            <p className="text-xs text-stone-600 mt-1">No votes yet</p>
          )}
        </div>

        {/* Your voting power */}
        {isConnected && votingPower !== undefined && (
          <p className="text-sm text-stone-500">
            Your voting power:{" "}
            <span className="text-stone-300 font-medium">
              {Number(votingPower)}
            </span>{" "}
            (sqrt of balance)
          </p>
        )}

        {/* Vote buttons */}
        {canVote && (
          <div className="flex gap-3">
            <button
              onClick={() => handleVote(true)}
              disabled={voteIsPending || voteConfirming}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-700 disabled:text-stone-500 text-white py-2 rounded-md transition-colors font-medium"
            >
              {voteIsPending
                ? "Confirm in Wallet..."
                : voteConfirming
                  ? "Confirming..."
                  : "Vote Yes"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voteIsPending || voteConfirming}
              className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-stone-700 disabled:text-stone-500 text-white py-2 rounded-md transition-colors font-medium"
            >
              {voteIsPending
                ? "Confirm in Wallet..."
                : voteConfirming
                  ? "Confirming..."
                  : "Vote No"}
            </button>
          </div>
        )}

        {hasVotedData && (
          <p className="text-sm text-stone-500 text-center">
            You have already voted on this proposal.
          </p>
        )}

        {voteSuccess && (
          <p className="text-sm text-emerald-400 text-center">
            Vote submitted successfully!
          </p>
        )}

        {voteError && (
          <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
            {voteError.message.slice(0, 200)}
          </div>
        )}
      </div>

      {/* Execute */}
      {canExecute && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5">
          <h3 className="font-semibold mb-2">Execute Proposal</h3>
          <p className="text-sm text-stone-400 mb-3">
            Voting has ended. Anyone can execute to finalize the outcome.
          </p>
          <button
            onClick={handleExecute}
            disabled={execIsPending || execConfirming}
            className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white font-medium py-2 rounded-md transition-colors"
          >
            {execIsPending
              ? "Confirm in Wallet..."
              : execConfirming
                ? "Confirming..."
                : "Execute Proposal"}
          </button>
          {execError && (
            <div className="mt-3 p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
              {execError.message.slice(0, 200)}
            </div>
          )}
          {execSuccess && (
            <p className="mt-3 text-sm text-emerald-400 text-center">
              Proposal executed successfully!
            </p>
          )}
        </div>
      )}

      {/* Linked order (Phase 2 bidding) */}
      {linkedOrder && (
        <div className="rounded-lg border border-emerald-800/50 bg-emerald-900/20 p-5">
          <h3 className="font-semibold mb-2">Bidding Order</h3>
          <p className="text-sm text-stone-400 mb-3">
            This proposal has been executed and a bidding order has been created.
            Members can now bid to participate in this coffee bean order.
          </p>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-stone-400">
              Progress: {linkedOrder.totalBidKg}/{linkedOrder.moqKg} kg
            </span>
            <span className="capitalize text-stone-300">{linkedOrder.status}</span>
          </div>
          <Link
            href={`/orders/${linkedOrder.id}`}
            className="block text-center bg-amber-700 hover:bg-amber-600 text-white font-medium py-2 rounded-md transition-colors"
          >
            View Order &amp; Place Bid
          </Link>
        </div>
      )}

      {/* Prompt to create order after passed proposal */}
      {p.executed && p.passed && !linkedOrder && (
        <div className="rounded-lg border border-stone-800 bg-stone-900 p-5 text-center">
          <p className="text-stone-400 text-sm">
            This proposal passed. A bidding order can now be created for members to claim their share.
          </p>
        </div>
      )}
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
