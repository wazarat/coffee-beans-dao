import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { orderId, minKg, maxKg, pricePerKg } = body;

  if (!orderId || !minKg || !maxKg || !pricePerKg) {
    return NextResponse.json(
      { error: "Required fields: orderId, minKg, maxKg, pricePerKg" },
      { status: 400 }
    );
  }

  if (minKg > maxKg) {
    return NextResponse.json(
      { error: "minKg cannot be greater than maxKg" },
      { status: 400 }
    );
  }

  if (minKg <= 0 || maxKg <= 0 || pricePerKg <= 0) {
    return NextResponse.json(
      { error: "All values must be positive" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== "bidding") {
    return NextResponse.json(
      { error: "This order is no longer accepting bids" },
      { status: 400 }
    );
  }

  if (new Date() > order.biddingEndsAt) {
    return NextResponse.json(
      { error: "Bidding period has ended" },
      { status: 400 }
    );
  }

  const existingBid = await prisma.bid.findUnique({
    where: { orderId_userId: { orderId, userId: session.user.id } },
  });

  if (existingBid) {
    return NextResponse.json(
      { error: "You already have a bid on this order. Use PUT to update it." },
      { status: 409 }
    );
  }

  const bid = await prisma.bid.create({
    data: {
      orderId,
      userId: session.user.id,
      minKg,
      maxKg,
      pricePerKg,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { totalBidKg: { increment: maxKg } },
  });

  return NextResponse.json(bid, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { bidId, minKg, maxKg, pricePerKg } = body;

  if (!bidId) {
    return NextResponse.json(
      { error: "bidId is required" },
      { status: 400 }
    );
  }

  const bid = await prisma.bid.findFirst({
    where: { id: bidId, userId: session.user.id },
  });

  if (!bid) {
    return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  }

  if (bid.status === "cancelled") {
    return NextResponse.json(
      { error: "Cannot update a cancelled bid" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({ where: { id: bid.orderId } });
  if (!order || order.status !== "bidding") {
    return NextResponse.json(
      { error: "Order is no longer accepting bids" },
      { status: 400 }
    );
  }

  const newMinKg = minKg ?? bid.minKg;
  const newMaxKg = maxKg ?? bid.maxKg;
  const newPrice = pricePerKg ?? bid.pricePerKg;

  if (newMinKg > newMaxKg) {
    return NextResponse.json(
      { error: "minKg cannot be greater than maxKg" },
      { status: 400 }
    );
  }

  const oldMaxKg = bid.maxKg;
  const updatedBid = await prisma.bid.update({
    where: { id: bidId },
    data: { minKg: newMinKg, maxKg: newMaxKg, pricePerKg: newPrice },
  });

  const kgDiff = newMaxKg - oldMaxKg;
  if (kgDiff !== 0) {
    await prisma.order.update({
      where: { id: bid.orderId },
      data: { totalBidKg: { increment: kgDiff } },
    });
  }

  return NextResponse.json(updatedBid);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bidId = searchParams.get("id");

  if (!bidId) {
    return NextResponse.json(
      { error: "Bid id is required" },
      { status: 400 }
    );
  }

  const bid = await prisma.bid.findFirst({
    where: { id: bidId, userId: session.user.id },
  });

  if (!bid) {
    return NextResponse.json({ error: "Bid not found" }, { status: 404 });
  }

  if (bid.status === "cancelled") {
    return NextResponse.json(
      { error: "Bid is already cancelled" },
      { status: 400 }
    );
  }

  await prisma.bid.update({
    where: { id: bidId },
    data: { status: "cancelled" },
  });

  await prisma.order.update({
    where: { id: bid.orderId },
    data: { totalBidKg: { decrement: bid.maxKg } },
  });

  return NextResponse.json({ success: true });
}
