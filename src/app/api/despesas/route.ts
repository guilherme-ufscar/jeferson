import { NextRequest, NextResponse } from "next/server";
import { listExpenses, createExpense } from "@/services/despesa.service";
import { auth } from "@/lib/auth";
import { expenseSchema } from "@/validators/despesa";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const category = searchParams.get("category") || undefined;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    const expenses = await listExpenses({
      vehicleId,
      category: category as "FIXA" | "VARIAVEL" | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    return NextResponse.json(expenses);
  } catch {
    return NextResponse.json({ error: "Erro ao listar despesas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const expense = await createExpense({
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar despesa";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
