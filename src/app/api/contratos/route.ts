import { NextRequest, NextResponse } from "next/server";
import { listContracts, createContract } from "@/services/contrato.service";
import { contractSchema } from "@/validators/contrato";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") as "ATIVO" | "ENCERRADO" | "CANCELADO" | undefined;

  try {
    const contracts = await listContracts({ search, status });
    return NextResponse.json(contracts);
  } catch {
    return NextResponse.json({ error: "Erro ao listar contratos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = contractSchema.parse(body);
    const contract = await createContract(validated);
    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar contrato" }, { status: 500 });
  }
}
