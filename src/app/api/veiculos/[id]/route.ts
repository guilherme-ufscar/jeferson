import { NextRequest, NextResponse } from "next/server";
import { getVehicle, updateVehicle, deleteVehicle } from "@/services/veiculo.service";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const vehicle = await getVehicle(id);
    if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar veículo" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await request.json();
    const vehicle = await updateVehicle(id, body);
    return NextResponse.json(vehicle);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar veículo" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await deleteVehicle(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir veículo" }, { status: 500 });
  }
}
