import { prisma } from "@/lib/prisma";
import { FineStatus, PaymentMethod } from "@prisma/client";

export async function listFines(filters?: {
  search?: string;
  status?: FineStatus;
  vehicleId?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;

  if (filters?.search) {
    where.OR = [
      { vehicle: { placa: { contains: filters.search, mode: "insensitive" } } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.fine.findMany({
    where,
    include: { vehicle: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFine(data: {
  vehicleId: string;
  date: Date;
  amount: number;
  description: string;
  dueDate?: Date | null;
  autoInfracao?: string | null;
}) {
  return prisma.fine.create({
    data: {
      vehicleId: data.vehicleId,
      date: data.date,
      amount: data.amount,
      description: data.description,
      dueDate: data.dueDate || null,
      autoInfracao: data.autoInfracao || null,
      status: "PENDENTE",
    },
  });
}

export async function updateFineStatus(id: string, status: FineStatus, paymentMethod?: PaymentMethod) {
  const updateData: Record<string, unknown> = { status };
  if (status === "PAGA") {
    updateData.paidAt = new Date();
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
  }
  return prisma.fine.update({
    where: { id },
    data: updateData,
  });
}

export async function getOpenFinesCount() {
  const result = await prisma.fine.aggregate({
    where: { status: "PENDENTE" },
    _count: true,
    _sum: { amount: true },
  });

  return {
    count: result._count,
    total: result._sum.amount?.toNumber() || 0,
  };
}

