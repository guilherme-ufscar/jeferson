import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { ContractPDF } from "@/services/contrato-pdf";
import React from "react";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: true,
        vehicle: true,
      },
    });

    if (!contract) {
      return NextResponse.json({ error: "Contrato não encontrado" }, { status: 404 });
    }

    const settings = await prisma.companySettings.findFirst();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfElement = React.createElement(ContractPDF, {
        contract: {
          ...contract,
          startDate: contract.startDate.toISOString(),
          endDate: contract.endDate.toISOString(),
          monthlyValue: Number(contract.monthlyValue),
          observacoes: contract.observacoes || undefined,
          client: {
            ...contract.client,
            rg: contract.client.rg || undefined,
            email: contract.client.email || undefined,
            endereco: contract.client.endereco || undefined,
            numero: contract.client.numero || undefined,
            bairro: contract.client.bairro || undefined,
            cidade: contract.client.cidade || undefined,
            estado: contract.client.estado || undefined,
            cep: contract.client.cep || undefined,
            cnh: contract.client.cnh || undefined,
          },
          vehicle: {
            ...contract.vehicle,
            chassi: contract.vehicle.chassi || undefined,
            renavam: contract.vehicle.renavam || undefined,
          },
        },
        companyName: settings?.companyName || undefined,
        companyCnpj: settings?.cnpj || undefined,
      }) as any; // React 19 type incompatibility with @react-pdf/renderer
    const pdfBuffer = await renderToBuffer(pdfElement);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrato-${contract.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 });
  }
}
