import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = await prisma.siteSettings.findFirst()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Erro ao buscar configurações do site:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}