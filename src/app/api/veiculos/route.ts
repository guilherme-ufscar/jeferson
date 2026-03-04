import { NextRequest, NextResponse } from "next/server";
import { listVehicles, createVehicle } from "@/services/veiculo.service";
import { vehicleSchema } from "@/validators/veiculo";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") as "DISPONIVEL" | "ALUGADO" | "MANUTENCAO" | "INATIVO" | undefined;
  const tipo = searchParams.get("tipo") as "CARRO" | "MOTO" | "CAMINHONETE" | "VAN" | "CAMINHAO" | "ONIBUS" | "UTILITARIO" | undefined;

  try {
    const vehicles = await listVehicles({ search, status, tipo });
    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao listar veículos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = vehicleSchema.parse(body);
    const vehicle = await createVehicle(validated);
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar veículo" }, { status: 500 });
  }
}
