import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const now = new Date();
  const from = startDate ? new Date(startDate) : new Date(2000, 0, 1);
  const to = endDate ? new Date(endDate) : new Date(endOfMonth(now).getTime() + 86400000);

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, placa: true, marca: true, modelo: true, status: true },
    });

    if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });

    const [revenues, expenses] = await Promise.all([
      prisma.revenue.findMany({
        where: { vehicleId: id, date: { gte: from, lt: to } },
        orderBy: { date: "desc" },
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          type: true,
          paymentMethod: true,
        },
      }),
      prisma.expense.findMany({
        where: { vehicleId: id, date: { gte: from, lt: to } },
        orderBy: { date: "desc" },
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          type: true,
          category: true,
        },
      }),
    ]);

    const totalReceita = revenues.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalDespesa = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return NextResponse.json({
      vehicle,
      revenues: revenues.map((r) => ({ ...r, amount: Number(r.amount) })),
      expenses: expenses.map((e) => ({ ...e, amount: Number(e.amount) })),
      totalReceita,
      totalDespesa,
      resultado: totalReceita - totalDespesa,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar financeiro do veículo" }, { status: 500 });
  }
}
