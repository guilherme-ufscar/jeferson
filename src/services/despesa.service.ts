import { prisma } from "@/lib/prisma";
import { ExpenseCategory, ExpenseType, PaymentMethod } from "@prisma/client";

export async function listExpenses(filters?: {
  search?: string;
  category?: ExpenseCategory;
  vehicleId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.category) where.category = filters.category;
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

  return prisma.expense.findMany({
    where,
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(data: {
  date: Date;
  category: ExpenseCategory;
  type: ExpenseType;
  vehicleId?: string | null;
  amount: number;
  description: string;
  paymentMethod?: PaymentMethod | null;
}) {
  return prisma.expense.create({
    data: {
      date: data.date,
      category: data.category,
      type: data.type,
      vehicleId: data.vehicleId || null,
      amount: data.amount,
      description: data.description,
      paymentMethod: data.paymentMethod || null,
    },
  });
}

export async function getExpenseTotalByVehicle(vehicleId: string, from: Date, to: Date) {
  const result = await prisma.expense.aggregate({
    where: {
      vehicleId,
      date: { gte: from, lt: to },
    },
    _sum: { amount: true },
  });
  return result._sum.amount?.toNumber() || 0;
}

export async function getExpenseTotal(from: Date, to: Date) {
  const result = await prisma.expense.aggregate({
    where: {
      date: { gte: from, lt: to },
    },
    _sum: { amount: true },
  });
  return result._sum.amount?.toNumber() || 0;
}

