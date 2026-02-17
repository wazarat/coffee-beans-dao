import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.shippingAddress.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fullName, line1, line2, city, state, zip, country, label, isDefault } =
    body;

  if (!fullName || !line1 || !city || !state || !zip || !country) {
    return NextResponse.json(
      { error: "Required fields: fullName, line1, city, state, zip, country" },
      { status: 400 }
    );
  }

  if (isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.shippingAddress.create({
    data: {
      userId: session.user.id,
      fullName,
      line1,
      line2: line2 || null,
      city,
      state,
      zip,
      country,
      label: label || null,
      isDefault: isDefault || false,
    },
  });

  return NextResponse.json(address, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...data } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Address id is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  if (data.isDefault) {
    await prisma.shippingAddress.updateMany({
      where: { userId: session.user.id, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.shippingAddress.update({
    where: { id },
    data,
  });

  return NextResponse.json(address);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Address id is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.shippingAddress.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.shippingAddress.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
