import { prisma } from "@/lib/prisma";
import { RevenueType, PaymentMethod } from "@prisma/client";

export async function listRevenues(filters?: {
  search?: string;
  type?: RevenueType;
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters?.startDate) (where.date as Record<string, unknown>).gte = filters.startDate;
    if (filters?.endDate) (where.date as Record<string, unknown>).lt = filters.endDate;
  }

  if (filters?.search) {
    where.OR = [
      { description: { contains: filters.search, mode: "insensitive" } },
      { vehicle: { placa: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return prisma.revenue.findMany({
    where,
    include: {
      vehicle: true,
      contract: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function createRevenue(data: {
  date: Date;
  vehicleId?: string | null;
  contractId?: string | null;
  billingId?: string | null;
  type: RevenueType;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
}) {
  return prisma.revenue.create({
    data: {
      date: data.date,
      vehicleId: data.vehicleId || null,
      contractId: data.contractId || null,
      billingId: data.billingId || null,
      type: data.type,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      description: data.description,
    },
  });
}

export async function getRevenueTotalByVehicle(vehicleId: string, from: Date, to: Date) {
  const result = await prisma.revenue.aggregate({
    where: {
      vehicleId,
      date: { gte: from, lt: to },
    },
    _sum: { amount: true },
  });
  return result._sum.amount?.toNumber() || 0;
}

export async function getRevenueTotal(from: Date, to: Date) {
  const result = await prisma.revenue.aggregate({
    where: {
      date: { gte: from, lt: to },
    },
    _sum: { amount: true },
  });
  return result._sum.amount?.toNumber() || 0;
}

