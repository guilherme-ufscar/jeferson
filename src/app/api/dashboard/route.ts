import { NextResponse } from "next/server";
import { getDashboardData } from "@/services/dashboard.service";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 });
  }
}
