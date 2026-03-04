"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anoFabricacao: number;
  anoModelo: number;
  cor: string;
  tipo: string;
  status: string;
  valorMensal: number;
  kmAtual: number;
}

const statusMap: Record<string, { label: string; variant: "success" | "default" | "warning" | "destructive" | "info" }> = {
  DISPONIVEL: { label: "Disponível", variant: "success" },
  ALUGADO: { label: "Alugado", variant: "info" },
  MANUTENCAO: { label: "Manutenção", variant: "warning" },
  INATIVO: { label: "Inativo", variant: "destructive" },
};

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchVehicles = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/veiculos?${params}`)
      .then((r) => r.json())
      .then(setVehicles)
      .catch(() => toast.error("Erro ao carregar veículos"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleDelete = async (id: string, placa: string) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo ${placa}?`)) return;
    try {
      const res = await fetch(`/api/veiculos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Veículo excluído com sucesso");
      fetchVehicles();
    } catch {
      toast.error("Erro ao excluir veículo");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Veículos"
        action={{ label: "Novo Veículo", href: "/veiculos/novo" }}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, marca ou modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum veículo encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Placa</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium">Ano</th>
                    <th className="pb-3 font-medium">Cor</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Valor Mensal</th>
                    <th className="pb-3 font-medium text-right">KM Atual</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => {
                    const st = statusMap[v.status] || { label: v.status, variant: "default" as const };
                    return (
                      <tr key={v.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 font-mono font-medium">{v.placa}</td>
                        <td className="py-3">{v.marca} {v.modelo}</td>
                        <td className="py-3">{v.anoFabricacao}/{v.anoModelo}</td>
                        <td className="py-3">{v.cor}</td>
                        <td className="py-3">{v.tipo}</td>
                        <td className="py-3">
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </td>
                        <td className="py-3 text-right">{formatCurrency(v.valorMensal)}</td>
                        <td className="py-3 text-right">{v.kmAtual?.toLocaleString("pt-BR")} km</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/veiculos/${v.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/veiculos/${v.id}/editar`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(v.id, v.placa)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
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
