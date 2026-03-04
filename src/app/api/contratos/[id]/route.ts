import { NextRequest, NextResponse } from "next/server";
import { getContract } from "@/services/contrato.service";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const contract = await getContract(id);
    if (!contract) return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    return NextResponse.json(contract);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar contrato" }, { status: 500 });
  }
}
