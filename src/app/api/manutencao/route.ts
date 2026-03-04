import { NextRequest, NextResponse } from "next/server";
import { listMaintenances, registerMaintenance, registerOilChange } from "@/services/manutencao.service";
import { auth } from "@/lib/auth";
import { maintenanceSchema, oilChangeSchema } from "@/validators/manutencao";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vehicleId = searchParams.get("vehicleId");

  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId é obrigatório" }, { status: 400 });
  }

  try {
    const records = await listMaintenances(vehicleId);
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Erro ao listar manutenções" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();
  const type = body.type; // "maintenance" | "oil_change"

  try {
    if (type === "oil_change") {
      const parsed = oilChangeSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
      }
      const result = await registerOilChange({
        ...parsed.data,
        date: new Date(parsed.data.date),
      });
      return NextResponse.json(result, { status: 201 });
    }

    const parsed = maintenanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const result = await registerMaintenance({
      ...parsed.data,
      date: new Date(parsed.data.date),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao registrar manutenção";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
