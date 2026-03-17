"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Pencil, ArrowLeft, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "destructive" | "info" }> = {
  DISPONIVEL: { label: "Disponível", variant: "success" },
  ALUGADO: { label: "Alugado", variant: "info" },
  MANUTENCAO: { label: "Manutenção", variant: "warning" },
  INATIVO: { label: "Inativo", variant: "destructive" },
};

const revenueTypeLabel: Record<string, string> = {
  ALUGUEL: "Aluguel",
  MULTA_CLIENTE: "Multa do Cliente",
  SEGURO: "Seguro",
  OUTROS: "Outros",
};

const expenseTypeLabel: Record<string, string> = {
  IPVA: "IPVA",
  SEGURO: "Seguro",
  MANUTENCAO: "Manutenção",
  COMBUSTIVEL: "Combustível",
  MULTA: "Multa",
  LAVAGEM: "Lavagem",
  PNEU: "Pneu",
  DOCUMENTACAO: "Documentação",
  OUTROS: "Outros",
};

interface FinanceItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: string;
  category?: string;
}

interface FinancialData {
  revenues: FinanceItem[];
  expenses: FinanceItem[];
  totalReceita: number;
  totalDespesa: number;
  resultado: number;
}

export default function VeiculoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "financeiro">("info");

  const [financial, setFinancial] = useState<FinancialData | null>(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  useEffect(() => {
    fetch(`/api/veiculos/${id}`)
      .then((r) => r.json())
      .then(setVehicle)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const loadFinancial = (start?: string, end?: string) => {
    setFinancialLoading(true);
    const params = new URLSearchParams();
    if (start) params.set("startDate", start);
    if (end) params.set("endDate", end);
    fetch(`/api/veiculos/${id}/financeiro?${params}`)
      .then((r) => r.json())
      .then(setFinancial)
      .catch(console.error)
      .finally(() => setFinancialLoading(false));
  };

  useEffect(() => {
    if (activeTab === "financeiro" && !financial) {
      loadFinancial();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Veículo" />
        <Card><CardContent className="p-6"><div className="h-40 animate-pulse rounded bg-muted" /></CardContent></Card>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <PageHeader title="Veículo não encontrado" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const st = statusMap[vehicle.status as string] || { label: vehicle.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={`${vehicle.marca} ${vehicle.modelo} — ${vehicle.placa}`} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <Button asChild>
            <Link href={`/veiculos/${id}/editar`}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "info"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Informações
        </button>
        <button
          onClick={() => setActiveTab("financeiro")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "financeiro"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Financeiro
        </button>
      </div>

      {/* INFO TAB */}
      {activeTab === "info" && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Placa" value={vehicle.placa as string} />
                <InfoRow label="Marca" value={vehicle.marca as string} />
                <InfoRow label="Modelo" value={vehicle.modelo as string} />
                <InfoRow label="Ano" value={`${vehicle.anoFabricacao}/${vehicle.anoModelo}`} />
                <InfoRow label="Cor" value={vehicle.cor as string} />
                <InfoRow label="Tipo" value={vehicle.tipo as string} />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Chassi" value={(vehicle.chassi as string) || "—"} />
                <InfoRow label="RENAVAM" value={(vehicle.renavam as string) || "—"} />
                <InfoRow label="Valor Mensal" value={formatCurrency(vehicle.valorMensal as number)} />
                <InfoRow label="KM Atual" value={`${((vehicle.kmAtual as number) || 0).toLocaleString("pt-BR")} km`} />
                <InfoRow label="KM Próxima Troca" value={`${((vehicle.kmProximaTroca as number) || 0).toLocaleString("pt-BR")} km`} />
              </CardContent>
            </Card>
          </div>

          {(vehicle.observacoes as string) && (
            <Card>
              <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{vehicle.observacoes as string}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* FINANCIAL TAB */}
      {activeTab === "financeiro" && (
        <div className="space-y-4">
          {/* Date Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Data Início</Label>
                  <Input
                    type="date"
                    value={filterStart}
                    onChange={(e) => setFilterStart(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Fim</Label>
                  <Input
                    type="date"
                    value={filterEnd}
                    onChange={(e) => setFilterEnd(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => loadFinancial(filterStart, filterEnd)}
                  disabled={financialLoading}
                >
                  {financialLoading ? "Filtrando..." : "Filtrar"}
                </Button>
                {(filterStart || filterEnd) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFilterStart("");
                      setFilterEnd("");
                      loadFinancial();
                    }}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {financialLoading && (
            <Card>
              <CardContent className="p-6">
                <div className="h-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          )}

          {financial && !financialLoading && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Total Receitas</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(financial.totalReceita)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {financial.revenues.length} lançamento(s)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Total Despesas</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(financial.totalDespesa)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {financial.expenses.length} lançamento(s)
                    </p>
                  </CardContent>
                </Card>

                <Card className={financial.resultado >= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">
                      {financial.resultado >= 0 ? "Lucro" : "Prejuízo"}
                    </CardTitle>
                    <DollarSign className={`h-4 w-4 ${financial.resultado >= 0 ? "text-green-600" : "text-red-600"}`} />
                  </CardHeader>
                  <CardContent>
                    <p className={`text-2xl font-bold ${financial.resultado >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {formatCurrency(Math.abs(financial.resultado))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Receitas − Despesas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Combined Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Lançamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  {financial.revenues.length === 0 && financial.expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum lançamento no período.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 font-medium">Data</th>
                            <th className="pb-3 font-medium">Tipo</th>
                            <th className="pb-3 font-medium">Descrição</th>
                            <th className="pb-3 font-medium text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {financial.revenues.map((r) => (
                            <tr key={`r-${r.id}`} className="border-b hover:bg-muted/50">
                              <td className="py-2">{formatDate(r.date)}</td>
                              <td className="py-2">
                                <Badge variant="success" className="text-xs">Receita</Badge>
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {r.description} · {revenueTypeLabel[r.type] || r.type}
                              </td>
                              <td className="py-2 text-right font-medium text-green-600">
                                +{formatCurrency(r.amount)}
                              </td>
                            </tr>
                          ))}
                          {financial.expenses.map((e) => (
                            <tr key={`e-${e.id}`} className="border-b hover:bg-muted/50">
                              <td className="py-2">{formatDate(e.date)}</td>
                              <td className="py-2">
                                <Badge variant="destructive" className="text-xs">Despesa</Badge>
                              </td>
                              <td className="py-2 text-muted-foreground">
                                {e.description} · {expenseTypeLabel[e.type] || e.type}
                              </td>
                              <td className="py-2 text-right font-medium text-red-600">
                                -{formatCurrency(e.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2">
                            <td colSpan={3} className="py-3 font-semibold">Resultado</td>
                            <td className={`py-3 text-right font-bold text-lg ${financial.resultado >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {financial.resultado >= 0 ? "+" : ""}{formatCurrency(financial.resultado)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
