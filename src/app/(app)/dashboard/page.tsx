"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Car,
  Users,
  FileText,
  DollarSign,
  AlertTriangle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Clock,
  Ban,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  activeClients: number;
  activeContracts: number;
  overdueCount: number;
  openFinesCount: number;
  monthRevenue: number;
  monthExpense: number;
  monthProfit: number;
  upcomingMaintenance: Array<{
    vehicle: { placa: string; modelo: string };
    urgency: string;
  }>;
  recentContracts: Array<{
    id: string;
    client: { name: string };
    vehicle: { placa: string; modelo: string };
    startDate: string;
    status: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <p className="text-muted-foreground">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total de Veículos",
      value: data.totalVehicles,
      icon: Car,
      description: `${data.availableVehicles} disponíveis`,
      color: "text-blue-600",
    },
    {
      title: "Veículos Alugados",
      value: data.rentedVehicles,
      icon: Car,
      description: `${data.maintenanceVehicles} em manutenção`,
      color: "text-green-600",
    },
    {
      title: "Clientes Ativos",
      value: data.activeClients,
      icon: Users,
      color: "text-violet-600",
    },
    {
      title: "Contratos Ativos",
      value: data.activeContracts,
      icon: FileText,
      color: "text-orange-600",
    },
    {
      title: "Receita do Mês",
      value: formatCurrency(data.monthRevenue),
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Despesa do Mês",
      value: formatCurrency(data.monthExpense),
      icon: TrendingDown,
      color: "text-red-600",
    },
    {
      title: "Lucro do Mês",
      value: formatCurrency(data.monthProfit),
      icon: DollarSign,
      color: data.monthProfit >= 0 ? "text-emerald-600" : "text-red-600",
    },
    {
      title: "Cobranças Vencidas",
      value: data.overdueCount,
      icon: AlertTriangle,
      color: data.overdueCount > 0 ? "text-red-600" : "text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              {card.description && (
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue Billings Alert */}
        {data.overdueCount > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" />
                Cobranças Vencidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Existem <strong>{data.overdueCount}</strong> cobranças vencidas.
              </p>
              <Link
                href="/cobrancas"
                className="text-sm text-red-600 underline hover:text-red-800 mt-2 inline-block"
              >
                Ver cobranças →
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Open Fines Alert */}
        {data.openFinesCount > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-800">
                <Ban className="h-4 w-4" />
                Multas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                Existem <strong>{data.openFinesCount}</strong> multas pendentes.
              </p>
              <Link
                href="/multas"
                className="text-sm text-amber-600 underline hover:text-amber-800 mt-2 inline-block"
              >
                Ver multas →
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Maintenance Alerts */}
      {data.upcomingMaintenance && data.upcomingMaintenance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Manutenções Próximas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.upcomingMaintenance.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm">
                    {item.vehicle.placa} - {item.vehicle.modelo}
                  </span>
                  <Badge variant={item.urgency === "atrasado" ? "destructive" : "warning"}>
                    {item.urgency === "atrasado" ? "Atrasado" : "Próximo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Contracts */}
      {data.recentContracts && data.recentContracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Contratos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.recentContracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contratos/${contract.id}`}
                  className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 rounded px-2 -mx-2"
                >
                  <div>
                    <span className="text-sm font-medium">{contract.client.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {contract.vehicle.placa} - {contract.vehicle.modelo}
                    </span>
                  </div>
                  <Badge
                    variant={
                      contract.status === "ATIVO"
                        ? "success"
                        : contract.status === "ENCERRADO"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {contract.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
