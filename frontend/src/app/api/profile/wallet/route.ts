import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { walletAddress } = body;

  if (!walletAddress || typeof walletAddress !== "string") {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (existing && existing.id !== session.user.id) {
    return NextResponse.json(
      { error: "This wallet is already linked to another account" },
      { status: 409 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: null },
    select: {
      id: true,
      email: true,
      name: true,
      walletAddress: true,
    },
  });

  return NextResponse.json(user);
}
