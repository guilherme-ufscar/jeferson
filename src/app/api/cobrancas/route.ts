import { NextRequest, NextResponse } from "next/server";
import { listBillings, getTodayBillings, getOverdueBillings } from "@/services/cobranca.service";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view"); // "today" | "overdue" | null
  const status = searchParams.get("status") as "PENDENTE" | "PAGO" | "VENCIDO" | "CANCELADO" | undefined;

  try {
    if (view === "today") {
      const billings = await getTodayBillings();
      return NextResponse.json(billings);
    }
    if (view === "overdue") {
      const billings = await getOverdueBillings();
      return NextResponse.json(billings);
    }

    const billings = await listBillings({ status });
    return NextResponse.json(billings);
  } catch {
    return NextResponse.json({ error: "Erro ao listar cobranças" }, { status: 500 });
  }
}
