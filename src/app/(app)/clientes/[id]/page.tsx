"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCPF } from "@/lib/utils";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ClienteDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clientes/${id}`)
      .then((r) => r.json())
      .then(setClient)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Cliente" />
        <Card><CardContent className="p-6"><div className="h-40 animate-pulse rounded bg-muted" /></CardContent></Card>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <PageHeader title="Cliente não encontrado" />
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title={client.name as string} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <Button asChild>
            <Link href={`/clientes/${id}/editar`}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados Pessoais</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nome" value={client.name as string} />
            <InfoRow label="CPF" value={formatCPF(client.cpf as string)} />
            <InfoRow label="RG" value={(client.rg as string) || "—"} />
            <InfoRow label="Telefone" value={client.phone as string} />
            <InfoRow label="E-mail" value={(client.email as string) || "—"} />
            <InfoRow label="CNH" value={(client.cnh as string) || "—"} />
            <InfoRow label="Validade CNH" value={client.cnhValidade ? new Date(client.cnhValidade as string).toLocaleDateString("pt-BR") : "—"} />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={client.status === "ATIVO" ? "success" : client.status === "INADIMPLENTE" ? "destructive" : "secondary"}>
                {client.status as string}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="CEP" value={(client.cep as string) || "—"} />
            <InfoRow label="Endereço" value={(client.endereco as string) || "—"} />
            <InfoRow label="Número" value={(client.numero as string) || "—"} />
            <InfoRow label="Complemento" value={(client.complemento as string) || "—"} />
            <InfoRow label="Bairro" value={(client.bairro as string) || "—"} />
            <InfoRow label="Cidade" value={(client.cidade as string) || "—"} />
            <InfoRow label="Estado" value={(client.estado as string) || "—"} />
          </CardContent>
        </Card>
      </div>

      {(client.observacoes as string) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{client.observacoes as string}</p>
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
