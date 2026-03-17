import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { getVehicleStats } from "./veiculo.service";
import { getOverdueCount } from "./cobranca.service";
import { getOpenFinesCount } from "./multa.service";
import { getUpcomingOilChanges } from "./manutencao.service";
import { getCompanyProfitReport, getVehicleProfitReport } from "./relatorio.service";

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

  // All-time range for vehicle profit ranking
  const allTimeFrom = new Date(2000, 0, 1);
  const allTimeTo = new Date(now.getFullYear() + 1, 11, 31);

  const [vehicleStats, overdueInfo, finesInfo, oilChanges, profit, activeClients, activeContracts, recentContracts, vehicleProfits] =
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
      getVehicleProfitReport(allTimeFrom, allTimeTo),
    ]);

  // Top 5 most and least profitable vehicles
  const vehicleRanking = vehicleProfits
    .filter((v) => v.receita > 0 || v.despesa > 0)
    .slice(0, 5)
    .map((v) => ({
      id: v.id,
      placa: v.placa,
      modelo: `${v.marca} ${v.modelo}`,
      receita: v.receita,
      despesa: v.despesa,
      lucro: v.lucro,
    }));

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
    vehicleRanking,
  };
}
