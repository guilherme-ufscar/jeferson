import { prisma } from "@/lib/prisma";
import { BillingStatus, PaymentMethod } from "@prisma/client";

export async function listBillings(filters?: {
  status?: BillingStatus;
  vehicleId?: string;
  date?: string;
  overdue?: boolean;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.vehicleId) where.vehicleId = filters.vehicleId;

  if (filters?.date) {
    const d = new Date(filters.date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    where.dueDate = { gte: start, lt: end };
  }

  if (filters?.overdue) {
    where.dueDate = { lt: new Date() };
    where.status = { in: ["PENDENTE", "VENCIDO"] };
  }

  return prisma.billing.findMany({
    where,
    include: {
      contract: { include: { client: true } },
      vehicle: true,
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getTodayBillings() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return prisma.billing.findMany({
    where: {
      dueDate: { gte: start, lt: end },
      status: { in: ["PENDENTE", "VENCIDO"] },
    },
    include: { contract: { include: { client: true } }, vehicle: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function getOverdueBillings() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.billing.findMany({
    where: {
      dueDate: { lt: today },
      status: { in: ["PENDENTE", "VENCIDO"] },
    },
    include: { contract: { include: { client: true } }, vehicle: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function markBillingAsPaid(
  billingId: string,
  paymentData: {
    paymentMethod: PaymentMethod;
    paidAt?: Date;
  }
) {
  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    include: { contract: true },
  });
  if (!billing) throw new Error("Cobrança não encontrada");
  if (billing.status === "PAGO") throw new Error("Cobrança já foi paga");
  if (billing.status === "CANCELADO") throw new Error("Cobrança está cancelada");

  const paidAt = paymentData.paidAt || new Date();

  return prisma.$transaction(async (tx) => {
    // Update billing status
    await tx.billing.update({
      where: { id: billingId },
      data: {
        status: "PAGO",
        paidAt,
        paymentMethod: paymentData.paymentMethod,
      },
    });

    // Create revenue record
    const revenue = await tx.revenue.create({
      data: {
        date: paidAt,
        vehicleId: billing.vehicleId,
        contractId: billing.contractId,
        billingId: billing.id,
        type: "ALUGUEL",
        amount: billing.amount,
        paymentMethod: paymentData.paymentMethod,
        description: `Aluguel - Vencimento ${billing.dueDate.toLocaleDateString("pt-BR")}`,
      },
    });

    return revenue;
  });
}

export async function getOverdueCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.billing.aggregate({
    where: {
      dueDate: { lt: today },
      status: { in: ["PENDENTE", "VENCIDO"] },
    },
    _count: true,
    _sum: { amount: true },
  });

  return {
    count: result._count,
    total: result._sum.amount?.toNumber() || 0,
  };
}

