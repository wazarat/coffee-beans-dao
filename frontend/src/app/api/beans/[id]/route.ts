import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const bean = await prisma.coffeeBean.findUnique({
    where: { id },
    include: {
      orders: {
        where: { status: "bidding" },
        select: {
          id: true,
          proposalId: true,
          targetQuantityKg: true,
          moqKg: true,
          totalBidKg: true,
          biddingEndsAt: true,
          status: true,
        },
      },
    },
  });

  if (!bean) {
    return NextResponse.json({ error: "Bean not found" }, { status: 404 });
  }

  return NextResponse.json(bean);
}
