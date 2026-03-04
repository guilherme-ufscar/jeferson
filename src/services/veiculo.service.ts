import { prisma } from "@/lib/prisma";
import { VehicleStatus, VehicleType } from "@prisma/client";

export interface VehicleFilters {
  search?: string;
  status?: VehicleStatus;
  tipo?: VehicleType;
}

export async function listVehicles(filters?: VehicleFilters) {
  const where: Record<string, unknown> = { deletedAt: null };

  if (filters?.search) {
    where.OR = [
      { placa: { contains: filters.search, mode: "insensitive" } },
      { marca: { contains: filters.search, mode: "insensitive" } },
      { modelo: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.status) where.status = filters.status;
  if (filters?.tipo) where.tipo = filters.tipo;

  return prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicle(id: string) {
  return prisma.vehicle.findFirst({
    where: { id, deletedAt: null },
    include: {
      contracts: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
      },
      fines: { orderBy: { createdAt: "desc" } },
      maintenances: { orderBy: { date: "desc" } },
    },
  });
}

export async function getVehicleByPlaca(placa: string) {
  return prisma.vehicle.findFirst({
    where: { placa: placa.toUpperCase(), deletedAt: null },
  });
}

export async function createVehicle(data: {
  placa: string;
  tipo: VehicleType;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  kmAtual: number;
  valorMensal: number;
  chassi?: string | null;
  renavam?: string | null;
  kmProximaTroca?: number | null;
  observacoes?: string | null;
}) {
  const existing = await prisma.vehicle.findUnique({
    where: { placa: data.placa.toUpperCase() },
  });
  if (existing && !existing.deletedAt) {
    throw new Error("Já existe um veículo com esta placa");
  }

  return prisma.vehicle.create({
    data: {
      placa: data.placa.toUpperCase(),
      tipo: data.tipo,
      marca: data.marca,
      modelo: data.modelo,
      anoFabricacao: data.anoFabricacao,
      anoModelo: data.anoModelo,
      cor: data.cor,
      kmAtual: data.kmAtual,
      valorMensal: data.valorMensal,
      chassi: data.chassi ?? null,
      renavam: data.renavam ?? null,
      kmProximaTroca: data.kmProximaTroca ?? null,
      observacoes: data.observacoes ?? null,
    },
  });
}

export async function updateVehicle(id: string, data: {
  placa?: string;
  tipo?: VehicleType;
  marca?: string;
  modelo?: string;
  anoFabricacao?: number;
  anoModelo?: number;
  cor?: string;
  kmAtual?: number;
  valorMensal?: number;
  status?: VehicleStatus;
  chassi?: string | null;
  renavam?: string | null;
  kmProximaTroca?: number | null;
  observacoes?: string | null;
}) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.placa) updateData.placa = data.placa.toUpperCase();

  return prisma.vehicle.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteVehicle(id: string) {
  return prisma.vehicle.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function getVehicleStats() {
  const [total, disponivel, alugado, manutencao, inativo] = await Promise.all([
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "DISPONIVEL" } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "ALUGADO" } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "MANUTENCAO" } }),
    prisma.vehicle.count({ where: { deletedAt: null, status: "INATIVO" } }),
  ]);

  return { total, disponivel, alugado, manutencao, inativo };
}

export async function getAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { deletedAt: null, status: "DISPONIVEL" },
    orderBy: { placa: "asc" },
  });
}

