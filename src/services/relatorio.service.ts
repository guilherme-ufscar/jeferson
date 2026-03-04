import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function getVehicleProfitReport(from: Date, to: Date) {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    select: { id: true, placa: true, marca: true, modelo: true, tipo: true, status: true },
  });

  const results = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [revenueAgg, expenseAgg] = await Promise.all([
        prisma.revenue.aggregate({
          where: { vehicleId: vehicle.id, date: { gte: from, lt: to } },
          _sum: { amount: true },
        }),
        prisma.expense.aggregate({
          where: { vehicleId: vehicle.id, date: { gte: from, lt: to } },
          _sum: { amount: true },
        }),
      ]);

      const receita = revenueAgg._sum.amount?.toNumber() || 0;
      const despesa = expenseAgg._sum.amount?.toNumber() || 0;
      const lucro = receita - despesa;

      return {
        ...vehicle,
        receita,
        despesa,
        lucro,
        margem: receita > 0 ? ((lucro / receita) * 100) : 0,
      };
    })
  );

  return results.sort((a, b) => b.lucro - a.lucro);
}

export async function getCompanyProfitReport(from: Date, to: Date) {
  const [revenueAgg, expenseAgg] = await Promise.all([
    prisma.revenue.aggregate({
      where: { date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
  ]);

  const receita = revenueAgg._sum.amount?.toNumber() || 0;
  const despesa = expenseAgg._sum.amount?.toNumber() || 0;

  return {
    receita,
    despesa,
    lucro: receita - despesa,
  };
}

export async function getMonthlyProfitSeries(months: number = 12) {
  const series = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const month = subMonths(now, i);
    const from = startOfMonth(month);
    const to = endOfMonth(month);
    to.setDate(to.getDate() + 1);

    const [revenueAgg, expenseAgg] = await Promise.all([
      prisma.revenue.aggregate({
        where: { date: { gte: from, lt: to } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { date: { gte: from, lt: to } },
        _sum: { amount: true },
      }),
    ]);

    const receita = revenueAgg._sum.amount?.toNumber() || 0;
    const despesa = expenseAgg._sum.amount?.toNumber() || 0;

    series.push({
      mes: format(month, "MMM/yy"),
      mesNum: format(month, "yyyy-MM"),
      receita,
      despesa,
      lucro: receita - despesa,
    });
  }

  return series;
}

export async function getRevenueByType(from: Date, to: Date) {
  const results = await prisma.revenue.groupBy({
    by: ["type"],
    where: { date: { gte: from, lt: to } },
    _sum: { amount: true },
  });

  return results.map((r) => ({
    tipo: r.type,
    total: r._sum.amount?.toNumber() || 0,
  }));
}

export async function getExpenseByType(from: Date, to: Date) {
  const results = await prisma.expense.groupBy({
    by: ["type"],
    where: { date: { gte: from, lt: to } },
    _sum: { amount: true },
  });

  return results.map((r) => ({
    tipo: r.type,
    total: r._sum.amount?.toNumber() || 0,
  }));
}

