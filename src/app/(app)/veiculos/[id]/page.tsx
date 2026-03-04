"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "destructive" | "info" }> = {
  DISPONIVEL: { label: "Disponível", variant: "success" },
  ALUGADO: { label: "Alugado", variant: "info" },
  MANUTENCAO: { label: "Manutenção", variant: "warning" },
  INATIVO: { label: "Inativo", variant: "destructive" },
};

export default function VeiculoDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/veiculos/${id}`)
      .then((r) => r.json())
      .then(setVehicle)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
        <PageHeader title={`${vehicle.marca} ${vehicle.modelo} - ${vehicle.placa}`} />
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
