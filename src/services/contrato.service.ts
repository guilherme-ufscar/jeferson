import { prisma } from "@/lib/prisma";
import { ContractStatus, VehicleStatus } from "@prisma/client";
import { addMonths, isAfter } from "date-fns";

export async function listContracts(filters?: {
  search?: string;
  status?: ContractStatus;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { client: { name: { contains: filters.search, mode: "insensitive" } } },
      { vehicle: { placa: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  return prisma.contract.findMany({
    where,
    include: {
      client: true,
      vehicle: true,
      _count: { select: { billings: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContract(id: string) {
  return prisma.contract.findUnique({
    where: { id },
    include: {
      client: true,
      vehicle: true,
      billings: {
        orderBy: { dueDate: "asc" },
      },
      revenues: {
        orderBy: { date: "desc" },
      },
    },
  });
}

export async function createContract(data: {
  clientId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  paymentDay?: number;
  observacoes?: string | null;
}) {
  // Validate client
  const client = await prisma.client.findFirst({
    where: { id: data.clientId, deletedAt: null },
  });
  if (!client) throw new Error("Cliente não encontrado");
  if (client.status === "INADIMPLENTE") throw new Error("Cliente está inadimplente");

  // Validate vehicle
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: data.vehicleId, deletedAt: null },
  });
  if (!vehicle) throw new Error("Veículo não encontrado");
  if (vehicle.status !== "DISPONIVEL") throw new Error("Veículo não está disponível");

  // Check for active contracts on this vehicle
  const activeContract = await prisma.contract.findFirst({
    where: { vehicleId: data.vehicleId, status: "ATIVO" },
  });
  if (activeContract) throw new Error("Veículo já possui contrato ativo");

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const paymentDay = data.paymentDay || 5;

  // Generate monthly billing dates
  const billingDates: Date[] = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), paymentDay);
  if (!isAfter(current, startDate)) {
    current = addMonths(current, 1);
  }
  while (!isAfter(current, endDate)) {
    billingDates.push(new Date(current));
    current = addMonths(current, 1);
  }

  // Create contract + billings + update vehicle in a transaction
  const contract = await prisma.$transaction(async (tx) => {
    const newContract = await tx.contract.create({
      data: {
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        startDate,
        endDate,
        monthlyValue: data.monthlyValue,
        paymentDay,
        observacoes: data.observacoes || null,
        status: "ATIVO",
      },
    });

    // Generate monthly billings
    if (billingDates.length > 0) {
      await tx.billing.createMany({
        data: billingDates.map((date) => ({
          contractId: newContract.id,
          vehicleId: data.vehicleId,
          amount: data.monthlyValue,
          dueDate: date,
          status: "PENDENTE",
        })),
      });
    }

    // Update vehicle status to ALUGADO
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "ALUGADO" },
    });

    return newContract;
  });

  return prisma.contract.findUnique({
    where: { id: contract.id },
    include: { client: true, vehicle: true, billings: true },
  });
}

export async function closeContract(
  contractId: string,
  reason: "ENCERRADO" | "CANCELADO",
  novoStatusVeiculo: VehicleStatus = "DISPONIVEL"
) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });
  if (!contract) throw new Error("Contrato não encontrado");
  if (contract.status !== "ATIVO") throw new Error("Contrato não está ativo");

  return prisma.$transaction(async (tx) => {
    // Update contract status
    const updated = await tx.contract.update({
      where: { id: contractId },
      data: { status: reason },
    });

    // Cancel pending billings
    await tx.billing.updateMany({
      where: {
        contractId,
        status: { in: ["PENDENTE", "VENCIDO"] },
      },
      data: { status: "CANCELADO" },
    });

    // Update vehicle status
    await tx.vehicle.update({
      where: { id: contract.vehicleId },
      data: { status: novoStatusVeiculo },
    });

    return updated;
  });
}

