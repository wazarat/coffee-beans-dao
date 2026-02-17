import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const proposalId = searchParams.get("proposalId");

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }
  if (proposalId) {
    where.proposalId = Number(proposalId);
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      coffeeBean: {
        select: {
          id: true,
          name: true,
          origin: true,
          roastLevel: true,
          pricePerKg: true,
        },
      },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    proposalId,
    coffeeBeanId,
    targetQuantityKg,
    moqKg,
    biddingDays,
  } = body;

  if (!proposalId || !coffeeBeanId || !targetQuantityKg || !moqKg) {
    return NextResponse.json(
      {
        error:
          "Required fields: proposalId, coffeeBeanId, targetQuantityKg, moqKg",
      },
      { status: 400 }
    );
  }

  const existingOrder = await prisma.order.findUnique({
    where: { proposalId },
  });

  if (existingOrder) {
    return NextResponse.json(
      { error: "An order for this proposal already exists" },
      { status: 409 }
    );
  }

  const bean = await prisma.coffeeBean.findUnique({
    where: { id: coffeeBeanId },
  });

  if (!bean) {
    return NextResponse.json(
      { error: "Coffee bean not found" },
      { status: 404 }
    );
  }

  const days = biddingDays || 14;
  const biddingEndsAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      proposalId,
      coffeeBeanId,
      targetQuantityKg,
      moqKg,
      biddingEndsAt,
    },
    include: { coffeeBean: true },
  });

  return NextResponse.json(order, { status: 201 });
}
