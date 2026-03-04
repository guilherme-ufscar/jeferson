"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Contract {
  id: string;
  startDate: string;
  endDate: string;
  monthlyValue: number;
  status: string;
  client: { name: string };
  vehicle: { placa: string; marca: string; modelo: string };
}

const statusMap: Record<string, { label: string; variant: "success" | "secondary" | "destructive" | "default" }> = {
  ATIVO: { label: "Ativo", variant: "success" },
  ENCERRADO: { label: "Encerrado", variant: "secondary" },
  CANCELADO: { label: "Cancelado", variant: "destructive" },
};

export default function ContratosPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contratos")
      .then((r) => r.json())
      .then(setContracts)
      .catch(() => toast.error("Erro ao carregar contratos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        action={{ label: "Novo Contrato", href: "/contratos/novo" }}
      />

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhum contrato encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium">Início</th>
                    <th className="pb-3 font-medium">Fim</th>
                    <th className="pb-3 font-medium text-right">Valor Mensal</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => {
                    const st = statusMap[c.status] || { label: c.status, variant: "default" as const };
                    return (
                      <tr key={c.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 font-medium">{c.client.name}</td>
                        <td className="py-3">{c.vehicle.placa} - {c.vehicle.marca} {c.vehicle.modelo}</td>
                        <td className="py-3">{formatDate(c.startDate)}</td>
                        <td className="py-3">{formatDate(c.endDate)}</td>
                        <td className="py-3 text-right">{formatCurrency(c.monthlyValue)}</td>
                        <td className="py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/contratos/${c.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
