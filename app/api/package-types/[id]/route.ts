import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const packageType = await prisma.packageType.update({
      where: { id: params.id },
      data
    });
    return NextResponse.json(packageType);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update package type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.packageType.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete package type" },
      { status: 500 }
    );
  }
}