import { NextRequest, NextResponse } from "next/server";
import { updateFineStatus } from "@/services/multa.service";
import { auth } from "@/lib/auth";
import { FineStatus, PaymentMethod } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const fine = await updateFineStatus(
      id,
      body.status as FineStatus,
      body.paymentMethod as PaymentMethod | undefined,
    );
    return NextResponse.json(fine);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar multa";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
