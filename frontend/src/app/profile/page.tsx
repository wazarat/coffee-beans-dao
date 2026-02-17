"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { AuthGuard } from "@/components/AuthGuard";
import { AddressForm } from "@/components/AddressForm";
import Link from "next/link";

interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  walletAddress: string | null;
}

interface ShippingAddress {
  id: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  label?: string;
  isDefault: boolean;
}

interface UserBid {
  id: string;
  minKg: number;
  maxKg: number;
  pricePerKg: number;
  status: string;
  createdAt: string;
  order: {
    id: string;
    proposalId: number;
    status: string;
    coffeeBean: {
      name: string;
    };
  };
}

function ProfileContent() {
  const { data: session } = useSession();
  const { address: walletAddress } = useAccount();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  );
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [walletLinkError, setWalletLinkError] = useState("");

  const fetchProfile = useCallback(async () => {
    const [profileRes, addressesRes, bidsRes] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/profile/addresses"),
      fetch("/api/bids/mine"),
    ]);

    if (profileRes.ok) {
      const p = await profileRes.json();
      setProfile(p);
      setEditName(p.name || "");
    }
    if (addressesRes.ok) setAddresses(await addressesRes.json());
    if (bidsRes.ok) setBids(await bidsRes.json());

    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user) fetchProfile();
  }, [session, fetchProfile]);

  async function handleLinkWallet() {
    if (!walletAddress) return;
    setWalletLinkError("");

    const res = await fetch("/api/profile/wallet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    } else {
      const data = await res.json();
      setWalletLinkError(data.error || "Failed to link wallet");
    }
  }

  async function handleUnlinkWallet() {
    const res = await fetch("/api/profile/wallet", { method: "DELETE" });
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    }
  }

  async function handleUpdateProfile() {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setEditingProfile(false);
    }
  }

  async function handleSaveAddress(data: {
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
  }) {
    if (data.id) {
      await fetch("/api/profile/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/profile/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    setShowAddressForm(false);
    setEditingAddress(null);
    fetchProfile();
  }

  async function handleDeleteAddress(id: string) {
    await fetch(`/api/profile/addresses?id=${id}`, { method: "DELETE" });
    fetchProfile();
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-stone-500">Loading profile...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Your Profile</h1>

      {/* Profile info */}
      <section className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Account</h2>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              Edit
            </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium text-stone-300 mb-1 block">
                Name
              </span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-600"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleUpdateProfile}
                className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="bg-stone-700 hover:bg-stone-600 text-stone-300 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">Name</span>
              <span className="text-stone-200">
                {profile?.name || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Email</span>
              <span className="text-stone-200">{profile?.email}</span>
            </div>
          </div>
        )}
      </section>

      {/* Wallet linking */}
      <section className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
        <h2 className="font-semibold text-lg">Wallet</h2>

        {walletLinkError && (
          <div className="p-3 rounded-md bg-red-900/40 border border-red-800 text-red-300 text-sm">
            {walletLinkError}
          </div>
        )}

        {profile?.walletAddress ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-stone-500">Linked Wallet</span>
              <span className="font-mono text-stone-200">
                {profile.walletAddress.slice(0, 6)}...
                {profile.walletAddress.slice(-4)}
              </span>
            </div>
            <button
              onClick={handleUnlinkWallet}
              className="text-sm text-red-400 hover:text-red-300"
            >
              Unlink Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-stone-400">
              Connect your wallet using the button in the header, then link it
              to your account here.
            </p>
            {walletAddress ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-stone-300">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <button
                  onClick={handleLinkWallet}
                  className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Link This Wallet
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-500">
                No wallet connected. Use the connect button in the header first.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Shipping addresses */}
      <section className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Shipping Addresses</h2>
          {!showAddressForm && !editingAddress && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-sm bg-amber-700 hover:bg-amber-600 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Address
            </button>
          )}
        </div>

        {(showAddressForm || editingAddress) && (
          <AddressForm
            initial={editingAddress || undefined}
            onSubmit={handleSaveAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
          />
        )}

        {!showAddressForm && !editingAddress && addresses.length === 0 && (
          <p className="text-sm text-stone-500">
            No shipping addresses added yet.
          </p>
        )}

        {!showAddressForm &&
          !editingAddress &&
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3 rounded-md bg-stone-800 flex items-start justify-between gap-4"
            >
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-stone-200">
                    {addr.fullName}
                  </span>
                  {addr.label && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-700 text-stone-400">
                      {addr.label}
                    </span>
                  )}
                  {addr.isDefault && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-800">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-stone-400">
                  {addr.line1}
                  {addr.line2 && `, ${addr.line2}`}
                </p>
                <p className="text-stone-400">
                  {addr.city}, {addr.state} {addr.zip}, {addr.country}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingAddress(addr)}
                  className="text-xs text-amber-500 hover:text-amber-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </section>

      {/* Bid history */}
      <section className="rounded-lg border border-stone-800 bg-stone-900 p-5 space-y-4">
        <h2 className="font-semibold text-lg">Your Bids</h2>

        {bids.length === 0 ? (
          <p className="text-sm text-stone-500">
            You haven&apos;t placed any bids yet.
          </p>
        ) : (
          <div className="space-y-2">
            {bids.map((bid) => (
              <Link
                key={bid.id}
                href={`/orders/${bid.order.id}`}
                className="block p-3 rounded-md bg-stone-800 hover:bg-stone-700/50 transition-colors"
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
                  <div className="text-right">
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
                    <p className="text-xs text-stone-500 mt-1">
                      Order: {bid.order.status}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
