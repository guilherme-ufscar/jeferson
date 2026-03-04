import { NextRequest, NextResponse } from "next/server";
import { closeContract } from "@/services/contrato.service";
import { closeContractSchema } from "@/validators/contrato";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const validated = closeContractSchema.parse(body);
    const contract = await closeContract(id, validated.reason, validated.novoStatusVeiculo);
    return NextResponse.json(contract);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao encerrar contrato" }, { status: 500 });
  }
}
