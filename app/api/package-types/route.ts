import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const packageTypes = await prisma.packageType.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { packages: true }
        }
      }
    });
    return NextResponse.json(packageTypes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch package types" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const packageType = await prisma.packageType.create({
      data
    });
    return NextResponse.json(packageType);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create package type" },
      { status: 500 }
    );
  }
}