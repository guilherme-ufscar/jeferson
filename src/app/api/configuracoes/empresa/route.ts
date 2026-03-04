import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/configuracoes/empresa — Get company settings
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: { id: "default" },
      });
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Erro ao carregar configurações" }, { status: 500 });
  }
}

// PUT /api/configuracoes/empresa — Update company settings (admin only)
export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { companyName, cnpj, endereco, telefone, email } = body;

    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: "default",
          companyName: companyName || "Locadora de Veículos",
          cnpj: cnpj || "",
          endereco: endereco || "",
          telefone: telefone || "",
          email: email || "",
        },
      });
    } else {
      settings = await prisma.companySettings.update({
        where: { id: settings.id },
        data: {
          ...(companyName !== undefined && { companyName }),
          ...(cnpj !== undefined && { cnpj }),
          ...(endereco !== undefined && { endereco }),
          ...(telefone !== undefined && { telefone }),
          ...(email !== undefined && { email }),
        },
      });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
