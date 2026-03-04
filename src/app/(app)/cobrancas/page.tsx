"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Billing {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
  paidAt: string | null;
  contract: {
    client: { name: string };
    vehicle: { placa: string; modelo: string };
  };
}

type TabView = "all" | "today" | "overdue";

export default function CobrancasPage() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabView>("all");
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchBillings = (view: TabView) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (view !== "all") params.set("view", view);
    fetch(`/api/cobrancas?${params}`)
      .then((r) => r.json())
      .then(setBillings)
      .catch(() => toast.error("Erro ao carregar cobranças"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBillings(tab);
  }, [tab]);

  const handlePay = async (id: string) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/cobrancas/${id}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: "PIX", paidAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Pagamento registrado!");
      fetchBillings(tab);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao pagar");
    } finally {
      setPayingId(null);
    }
  };

  const tabs = [
    { key: "all" as TabView, label: "Todas" },
    { key: "today" as TabView, label: "Hoje" },
    { key: "overdue" as TabView, label: "Vencidas" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranças" />

      <div className="flex gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : billings.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma cobrança encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium">Vencimento</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {billings.map((b) => (
                    <tr key={b.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{b.contract?.client?.name || "—"}</td>
                      <td className="py-3">{b.contract?.vehicle?.placa || "—"}</td>
                      <td className="py-3">{formatDate(b.dueDate)}</td>
                      <td className="py-3 text-right">{formatCurrency(b.amount)}</td>
                      <td className="py-3">
                        <Badge
                          variant={
                            b.status === "PAGO" ? "success"
                            : b.status === "VENCIDO" ? "destructive"
                            : b.status === "CANCELADO" ? "secondary"
                            : "warning"
                          }
                        >
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {b.status === "PENDENTE" || b.status === "VENCIDO" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePay(b.id)}
                            disabled={payingId === b.id}
                          >
                            {payingId === b.id ? "Pagando..." : "Registrar Pgto"}
                          </Button>
                        ) : b.paidAt ? (
                          <span className="text-xs text-muted-foreground">
                            Pago em {formatDate(b.paidAt)}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
