import { NextRequest, NextResponse } from "next/server";
import { listClients, createClient } from "@/services/cliente.service";
import { clientSchema } from "@/validators/cliente";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") as "ATIVO" | "INATIVO" | "INADIMPLENTE" | undefined;

  try {
    const clients = await listClients({ search, status });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Erro ao listar clientes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const validated = clientSchema.parse(body);
    const client = await createClient(validated);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
