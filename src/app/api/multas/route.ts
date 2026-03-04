import { NextRequest, NextResponse } from "next/server";
import { listFines, createFine } from "@/services/multa.service";
import { auth } from "@/lib/auth";
import { fineSchema } from "@/validators/multa";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const status = searchParams.get("status") || undefined;

  try {
    const fines = await listFines({
      vehicleId,
      status: status as "PENDENTE" | "PAGA" | "RECURSO" | "CANCELADA" | undefined,
    });
    return NextResponse.json(fines);
  } catch {
    return NextResponse.json({ error: "Erro ao listar multas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = fineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const fine = await createFine({
      ...parsed.data,
      date: new Date(parsed.data.date),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    });
    return NextResponse.json(fine, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao criar multa";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
