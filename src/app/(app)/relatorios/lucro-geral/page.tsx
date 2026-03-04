"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface CompanyProfit {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
  revenueByType: Array<{ type: string; total: number }>;
  expenseByType: Array<{ type: string; total: number }>;
}

interface MonthlySeries {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export default function LucroGeralPage() {
  const [data, setData] = useState<CompanyProfit | null>(null);
  const [monthly, setMonthly] = useState<MonthlySeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReport = () => {
    setLoading(true);
    const params = new URLSearchParams({ type: "company" });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    Promise.all([
      fetch(`/api/relatorios?${params}`).then(r => r.json()),
      fetch(`/api/relatorios?type=monthly`).then(r => r.json()),
    ])
      .then(([company, monthlySeries]) => {
        setData(company);
        setMonthly(monthlySeries);
      })
      .catch(() => toast.error("Erro ao gerar relatório"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, []);

  const typeLabelsRevenue: Record<string, string> = {
    ALUGUEL: "Aluguel",
    MULTA_CLIENTE: "Multa Cliente",
    SEGURO: "Seguro",
    OUTROS: "Outros",
  };

  const typeLabelsExpense: Record<string, string> = {
    IPVA: "IPVA", SEGURO: "Seguro", MANUTENCAO: "Manutenção",
    COMBUSTIVEL: "Combustível", MULTA: "Multa", LAVAGEM: "Lavagem",
    PNEU: "Pneu", DOCUMENTACAO: "Documentação", OUTROS: "Outros",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Lucro Geral da Empresa" />

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
            <Button onClick={fetchReport} disabled={loading}>{loading ? "Gerando..." : "Filtrar"}</Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <>
          {/* Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-green-800">Total Receitas</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-700">{formatCurrency(data.totalRevenue)}</p></CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-red-800">Total Despesas</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-red-700">{formatCurrency(data.totalExpense)}</p></CardContent>
            </Card>
            <Card className={data.profit >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lucro Líquido</CardTitle></CardHeader>
              <CardContent><p className={`text-2xl font-bold ${data.profit >= 0 ? "text-emerald-700" : "text-red-700"}`}>{formatCurrency(data.profit)}</p></CardContent>
            </Card>
          </div>

          {/* Revenue/Expense by type */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Receitas por Tipo</CardTitle></CardHeader>
              <CardContent>
                {data.revenueByType?.length ? (
                  <div className="space-y-2">
                    {data.revenueByType.map(r => (
                      <div key={r.type} className="flex justify-between py-1 border-b">
                        <span className="text-sm">{typeLabelsRevenue[r.type] || r.type}</span>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(r.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">Nenhum registro.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Despesas por Tipo</CardTitle></CardHeader>
              <CardContent>
                {data.expenseByType?.length ? (
                  <div className="space-y-2">
                    {data.expenseByType.map(e => (
                      <div key={e.type} className="flex justify-between py-1 border-b">
                        <span className="text-sm">{typeLabelsExpense[e.type] || e.type}</span>
                        <span className="text-sm font-medium text-red-600">{formatCurrency(e.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">Nenhum registro.</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Monthly evolution */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Evolução Mensal (últimos 12 meses)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Mês</th>
                    <th className="pb-3 font-medium text-right">Receitas</th>
                    <th className="pb-3 font-medium text-right">Despesas</th>
                    <th className="pb-3 font-medium text-right">Lucro</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map(m => (
                    <tr key={m.month} className="border-b">
                      <td className="py-2">{m.month}</td>
                      <td className="py-2 text-right text-green-600">{formatCurrency(m.revenue)}</td>
                      <td className="py-2 text-right text-red-600">{formatCurrency(m.expense)}</td>
                      <td className={`py-2 text-right font-medium ${m.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(m.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
