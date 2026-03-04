import { NextRequest, NextResponse } from "next/server";
import { markBillingAsPaid } from "@/services/cobranca.service";
import { auth } from "@/lib/auth";
import { PaymentMethod } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  try {
    const billing = await markBillingAsPaid(id, {
      paymentMethod: body.paymentMethod as PaymentMethod,
      paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
    });
    return NextResponse.json(billing);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro ao registrar pagamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
