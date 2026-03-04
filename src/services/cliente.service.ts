import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";

export interface ClientFilters {
  search?: string;
  status?: ClientStatus;
}

export async function listClients(filters?: ClientFilters) {
  const where: Record<string, unknown> = { deletedAt: null };

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { cpf: { contains: filters.search } },
      { phone: { contains: filters.search } },
    ];
  }
  if (filters?.status) where.status = filters.status;

  return prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getClient(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: {
      contracts: {
        include: { vehicle: true, billings: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createClient(data: {
  name: string;
  cpf: string;
  rg?: string | null;
  phone: string;
  email?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cnh?: string | null;
  cnhValidade?: string | null;
  observacoes?: string | null;
}) {
  const cleaned = data.cpf.replace(/\D/g, "");
  const existing = await prisma.client.findUnique({ where: { cpf: cleaned } });
  if (existing && !existing.deletedAt) {
    throw new Error("Já existe um cliente com este CPF");
  }

  return prisma.client.create({
    data: {
      ...data,
      cpf: cleaned,
      cnhValidade: data.cnhValidade ? new Date(data.cnhValidade) : null,
    },
  });
}

export async function updateClient(id: string, data: {
  name?: string;
  cpf?: string;
  rg?: string | null;
  phone?: string;
  email?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cnh?: string | null;
  cnhValidade?: string | null;
  status?: ClientStatus;
  observacoes?: string | null;
}) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.cpf) updateData.cpf = data.cpf.replace(/\D/g, "");
  if (data.cnhValidade) updateData.cnhValidade = new Date(data.cnhValidade);

  return prisma.client.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteClient(id: string) {
  return prisma.client.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getActiveClients() {
  return prisma.client.findMany({
    where: { deletedAt: null, status: "ATIVO" },
    orderBy: { name: "asc" },
  });
}

