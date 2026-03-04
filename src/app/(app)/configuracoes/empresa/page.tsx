"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Save } from "lucide-react";
import Link from "next/link";

interface CompanyData {
  id: string;
  companyName: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
}

export default function EmpresaPage() {
  const [data, setData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/configuracoes/empresa")
      .then((r) => r.json())
      .then(setData)
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setSaving(true);

    try {
      const res = await fetch("/api/configuracoes/empresa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: data.companyName,
          cnpj: data.cnpj,
          endereco: data.endereco,
          telefone: data.telefone,
          email: data.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao salvar");
        return;
      }

      toast.success("Dados da empresa atualizados com sucesso!");
    } catch {
      toast.error("Erro ao salvar dados");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dados da Empresa" />
        <div className="h-60 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dados da Empresa" />
        <p className="text-muted-foreground">Erro ao carregar dados da empresa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dados da Empresa"
        breadcrumbs={[
          { label: "Configurações", href: "/configuracoes" },
          { label: "Empresa" },
        ]}
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={data.cnpj}
                  onChange={(e) => setData({ ...data, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={data.endereco}
                  onChange={(e) => setData({ ...data, endereco: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={data.telefone}
                    onChange={(e) => setData({ ...data, telefone: e.target.value })}
                    placeholder="(00) 0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Link href="/configuracoes">
                  <Button type="button" variant="outline">
                    Voltar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
