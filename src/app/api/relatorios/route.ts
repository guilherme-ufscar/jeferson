import { NextRequest, NextResponse } from "next/server";
import { getVehicleProfitReport, getCompanyProfitReport, getMonthlyProfitSeries } from "@/services/relatorio.service";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "vehicle" | "company" | "monthly"
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const now = new Date();
  const from = startDate ? new Date(startDate) : startOfMonth(now);
  const to = endDate ? new Date(endDate) : new Date(endOfMonth(now).getTime() + 86400000);

  try {
    switch (type) {
      case "vehicle": {
        const report = await getVehicleProfitReport(from, to);
        return NextResponse.json(report);
      }
      case "company": {
        const report = await getCompanyProfitReport(from, to);
        return NextResponse.json(report);
      }
      case "monthly": {
        const series = await getMonthlyProfitSeries();
        return NextResponse.json(series);
      }
      default:
        return NextResponse.json({ error: "Tipo de relatório inválido" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
  }
}
