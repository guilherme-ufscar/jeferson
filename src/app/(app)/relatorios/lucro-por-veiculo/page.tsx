"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface VehicleProfit {
  vehicleId: string;
  placa: string;
  modelo: string;
  marca: string;
  totalRevenue: number;
  totalExpense: number;
  profit: number;
}

export default function LucroPorVeiculoPage() {
  const [data, setData] = useState<VehicleProfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "vehicle" });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/relatorios?${params}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => toast.error("Erro ao gerar relatório"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, []);

  const totalRevenue = data.reduce((s, v) => s + v.totalRevenue, 0);
  const totalExpense = data.reduce((s, v) => s + v.totalExpense, 0);
  const totalProfit = data.reduce((s, v) => s + v.profit, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Lucro por Veículo" />

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Gerando..." : "Filtrar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Receitas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Despesas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Lucro Total</CardTitle></CardHeader>
          <CardContent><p className={`text-2xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{formatCurrency(totalProfit)}</p></CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="h-40 animate-pulse rounded bg-muted" />
          ) : data.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum dado encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Placa</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium text-right">Receitas</th>
                    <th className="pb-3 font-medium text-right">Despesas</th>
                    <th className="pb-3 font-medium text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(v => (
                    <tr key={v.vehicleId} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-mono">{v.placa}</td>
                      <td className="py-3">{v.marca} {v.modelo}</td>
                      <td className="py-3 text-right text-green-600">{formatCurrency(v.totalRevenue)}</td>
                      <td className="py-3 text-right text-red-600">{formatCurrency(v.totalExpense)}</td>
                      <td className={`py-3 text-right font-medium ${v.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(v.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 font-bold">
                    <td className="py-3" colSpan={2}>TOTAL</td>
                    <td className="py-3 text-right text-green-600">{formatCurrency(totalRevenue)}</td>
                    <td className="py-3 text-right text-red-600">{formatCurrency(totalExpense)}</td>
                    <td className={`py-3 text-right ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(totalProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
