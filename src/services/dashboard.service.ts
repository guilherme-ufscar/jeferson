import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { getVehicleStats } from "./veiculo.service";
import { getOverdueCount } from "./cobranca.service";
import { getOpenFinesCount } from "./multa.service";
import { getUpcomingOilChanges } from "./manutencao.service";
import { getCompanyProfitReport } from "./relatorio.service";

export async function getDashboardData(month?: string) {
  const now = new Date();
  let from: Date, to: Date;

  if (month) {
    const [year, m] = month.split("-").map(Number);
    from = startOfMonth(new Date(year, m - 1));
    to = endOfMonth(new Date(year, m - 1));
    to.setDate(to.getDate() + 1);
  } else {
    from = startOfMonth(now);
    to = endOfMonth(now);
    to.setDate(to.getDate() + 1);
  }

  const [vehicleStats, overdueInfo, finesInfo, oilChanges, profit, activeClients, activeContracts, recentContracts] =
    await Promise.all([
      getVehicleStats(),
      getOverdueCount(),
      getOpenFinesCount(),
      getUpcomingOilChanges(),
      getCompanyProfitReport(from, to),
      prisma.client.count({ where: { status: "ATIVO", deletedAt: null } }),
      prisma.contract.count({ where: { status: "ATIVO" } }),
      prisma.contract.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          client: { select: { name: true } },
          vehicle: { select: { placa: true, modelo: true } },
        },
      }),
    ]);

  return {
    totalVehicles: vehicleStats.total,
    availableVehicles: vehicleStats.disponivel,
    rentedVehicles: vehicleStats.alugado,
    maintenanceVehicles: vehicleStats.manutencao,
    activeClients,
    activeContracts,
    overdueCount: overdueInfo.count,
    openFinesCount: finesInfo.count,
    monthRevenue: profit.receita,
    monthExpense: profit.despesa,
    monthProfit: profit.lucro,
    upcomingMaintenance: oilChanges.slice(0, 5).map((v) => ({
      vehicle: { placa: v.placa, modelo: v.modelo },
      urgency: v.urgencia === "atrasado" ? "atrasado" : "proximo",
    })),
    recentContracts,
  };
}
