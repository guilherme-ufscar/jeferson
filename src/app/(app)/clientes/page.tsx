"use client";

import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCPF } from "@/lib/utils";
import { Pencil, Trash2, Eye, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string | null;
  status: string;
  _count?: { contracts: number };
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/clientes?${params}`)
      .then((r) => r.json())
      .then(setClients)
      .catch(() => toast.error("Erro ao carregar clientes"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${name}?`)) return;
    try {
      const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro");
      }
      toast.success("Cliente excluído com sucesso");
      fetchClients();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        action={{ label: "Novo Cliente", href: "/clientes/novo" }}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou telefone..."
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
          ) : clients.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">CPF</th>
                    <th className="pb-3 font-medium">Telefone</th>
                    <th className="pb-3 font-medium">E-mail</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 font-mono">{formatCPF(c.cpf)}</td>
                      <td className="py-3">{c.phone}</td>
                      <td className="py-3">{c.email || "—"}</td>
                      <td className="py-3">
                        <Badge variant={c.status === "ATIVO" ? "success" : c.status === "INADIMPLENTE" ? "destructive" : "secondary"}>
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/clientes/${c.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/clientes/${c.id}/editar`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id, c.name)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
