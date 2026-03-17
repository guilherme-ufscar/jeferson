"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, XCircle, FileDown } from "lucide-react";
import { toast } from "sonner";

export default function ContratoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch(`/api/contratos/${id}`)
      .then((r) => r.json())
      .then(setContract)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleClose = async () => {
    if (!confirm("Tem certeza que deseja encerrar este contrato?")) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/contratos/${id}/encerrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate: new Date().toISOString().slice(0, 10) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Contrato encerrado com sucesso!");
      router.refresh();
      // Reload contract data
      const updated = await fetch(`/api/contratos/${id}`).then(r => r.json());
      setContract(updated);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao encerrar");
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Contrato" />
        <Card><CardContent className="p-6"><div className="h-40 animate-pulse rounded bg-muted" /></CardContent></Card>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contrato não encontrado" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const client = contract.client as Record<string, string>;
  const vehicle = contract.vehicle as Record<string, string>;
  const billings = (contract.billings as Array<Record<string, unknown>>) || [];

  const statusMap: Record<string, { label: string; variant: "success" | "secondary" | "destructive" | "default" }> = {
    ATIVO: { label: "Ativo", variant: "success" },
    ENCERRADO: { label: "Encerrado", variant: "secondary" },
    CANCELADO: { label: "Cancelado", variant: "destructive" },
  };
  const st = statusMap[contract.status as string] || { label: contract.status, variant: "default" as const };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Detalhes do Contrato" />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <Button variant="outline" asChild>
            <a href={`/api/contratos/${id}/pdf`} target="_blank" rel="noopener noreferrer">
              <FileDown className="h-4 w-4 mr-2" /> Gerar PDF
            </a>
          </Button>
          {contract.status === "ATIVO" && (
            <Button variant="destructive" onClick={handleClose} disabled={closing}>
              <XCircle className="h-4 w-4 mr-2" />
              {closing ? "Encerrando..." : "Encerrar Contrato"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados do Contrato</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <InfoRow label="Data Início" value={formatDate(contract.startDate as string)} />
            <InfoRow label="Data Fim" value={formatDate(contract.endDate as string)} />
            {(contract.weeklyValue as number) > 0 && (
              <InfoRow label="Valor Semanal" value={formatCurrency(contract.weeklyValue as number)} />
            )}
            {(contract.monthlyValue as number) > 0 && (
              <InfoRow label="Valor Mensal" value={formatCurrency(contract.monthlyValue as number)} />
            )}
            {(contract.valorCaucao as number) > 0 && (
              <InfoRow label="Caução" value={formatCurrency(contract.valorCaucao as number)} />
            )}
            {(contract.valorMultaAtraso as number) > 0 && (
              <InfoRow label="Multa por Atraso" value={formatCurrency(contract.valorMultaAtraso as number)} />
            )}
            {(contract.kmEntrega as number) > 0 && (
              <InfoRow label="KM na Entrega" value={`${(contract.kmEntrega as number).toLocaleString("pt-BR")} km`} />
            )}
            {(contract.porcentagemMensal as number) > 0 && (
              <InfoRow label="Taxa Mensal" value={`${contract.porcentagemMensal}%`} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Partes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Cliente" value={client?.name || "—"} />
            <InfoRow label="CPF" value={client?.cpf || "—"} />
            <InfoRow label="Veículo" value={`${vehicle?.marca} ${vehicle?.modelo}`} />
            <InfoRow label="Placa" value={vehicle?.placa || "—"} />
          </CardContent>
        </Card>
      </div>

      {/* Billings list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobranças ({billings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {billings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cobrança registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Vencimento</th>
                    <th className="pb-2 font-medium text-right">Valor</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Pago em</th>
                  </tr>
                </thead>
                <tbody>
                  {billings.map((b) => {
                    const bStatus = b.status as string;
                    return (
                      <tr key={b.id as string} className="border-b">
                        <td className="py-2">{formatDate(b.dueDate as string)}</td>
                        <td className="py-2 text-right">{formatCurrency(b.amount as number)}</td>
                        <td className="py-2">
                          <Badge variant={bStatus === "PAGO" ? "success" : bStatus === "VENCIDO" ? "destructive" : bStatus === "CANCELADO" ? "secondary" : "warning"}>
                            {bStatus}
                          </Badge>
                        </td>
                        <td className="py-2">{b.paidAt ? formatDate(b.paidAt as string) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {(contract.observacoes as string) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{contract.observacoes as string}</p>
          </CardContent>
        </Card>
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
