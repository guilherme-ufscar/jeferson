import { prisma } from "@/lib/prisma";

export async function getUpcomingOilChanges() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      deletedAt: null,
      status: { not: "INATIVO" },
      kmProximaTroca: { not: null },
    },
    orderBy: { kmAtual: "desc" },
  });

  return vehicles
    .map((v) => {
      const kmProximaTroca = v.kmProximaTroca || 0;
      const kmRestante = kmProximaTroca - v.kmAtual;
      let urgencia: "em_dia" | "proximo" | "atrasado";

      if (kmRestante <= 0) {
        urgencia = "atrasado";
      } else if (kmRestante <= 500) {
        urgencia = "proximo";
      } else {
        urgencia = "em_dia";
      }

      return {
        ...v,
        kmProximaTroca,
        kmRestante,
        urgencia,
      };
    })
    .sort((a, b) => {
      const order = { atrasado: 0, proximo: 1, em_dia: 2 };
      return order[a.urgencia] - order[b.urgencia] || a.kmRestante - b.kmRestante;
    });
}

export async function registerOilChange(data: {
  vehicleId: string;
  km: number;
  date: Date;
  nextChangeKm?: number;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: data.vehicleId },
      data: {
        kmAtual: data.km,
        kmProximaTroca: data.nextChangeKm || data.km + 5000,
      },
    });

    return tx.maintenance.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        description: "Troca de óleo",
        km: data.km,
        type: "TROCA_OLEO",
      },
    });
  });
}

export async function registerMaintenance(data: {
  vehicleId: string;
  date: Date;
  description: string;
  km: number;
  cost?: number | null;
  type?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Update vehicle km if higher
    const vehicle = await tx.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (vehicle && data.km > vehicle.kmAtual) {
      await tx.vehicle.update({
        where: { id: data.vehicleId },
        data: { kmAtual: data.km },
      });
    }

    return tx.maintenance.create({
      data: {
        vehicleId: data.vehicleId,
        date: data.date,
        description: data.description,
        km: data.km,
        cost: data.cost ?? null,
        type: data.type || "MANUTENCAO",
      },
    });
  });
}

export async function listMaintenances(vehicleId?: string) {
  return prisma.maintenance.findMany({
    where: vehicleId ? { vehicleId } : {},
    include: { vehicle: true },
    orderBy: { date: "desc" },
  });
}

