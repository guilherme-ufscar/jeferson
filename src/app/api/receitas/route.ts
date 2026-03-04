import { NextRequest, NextResponse } from "next/server";
import { listRevenues, createRevenue } from "@/services/receita.service";
import { auth } from "@/lib/auth";
import { revenueSchema } from "@/validators/receita";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const revenues = await listRevenues({
      vehicleId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    return NextResponse.json(revenues);
  } catch {
    return NextResponse.json({ error: "Erro ao listar receitas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = revenueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const revenue = await createRevenue({
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    return NextResponse.json(revenue, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar receita";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
