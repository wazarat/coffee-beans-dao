import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin");
  const roastLevel = searchParams.get("roastLevel");
  const sort = searchParams.get("sort") || "name";
  const available = searchParams.get("available");

  const where: Record<string, unknown> = {};

  if (origin) {
    where.origin = origin;
  }
  if (roastLevel) {
    where.roastLevel = roastLevel;
  }
  if (available !== null && available !== "") {
    where.available = available === "true";
  }

  const orderBy: Record<string, string> = {};
  if (sort === "price") {
    orderBy.pricePerKg = "asc";
  } else if (sort === "price_desc") {
    orderBy.pricePerKg = "desc";
  } else if (sort === "moq") {
    orderBy.moqKg = "asc";
  } else {
    orderBy.name = "asc";
  }

  const beans = await prisma.coffeeBean.findMany({
    where,
    orderBy,
  });

  return NextResponse.json(beans);
}
