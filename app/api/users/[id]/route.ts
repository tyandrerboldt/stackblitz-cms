import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" }
    });

    if (!session?.user || currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: data.role
      }
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao atualizar usuário" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUser = await prisma.user.findUnique({
      where: { email: session?.user?.email || "" }
    });

    if (!session?.user || currentUser?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Prevent self-deletion
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: "Não pode deletar sua própria conta!" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao deletar usuário" },
      { status: 500 }
    );
  }
}