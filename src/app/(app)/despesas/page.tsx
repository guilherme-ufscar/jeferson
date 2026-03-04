"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: string;
  vehicle?: { placa: string; modelo: string } | null;
}

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/despesas")
      .then((r) => r.json())
      .then(setExpenses)
      .catch(() => toast.error("Erro ao carregar despesas"))
      .finally(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, string> = {
    IPVA: "IPVA",
    SEGURO: "Seguro",
    MANUTENCAO: "Manutenção",
    COMBUSTIVEL: "Combustível",
    MULTA: "Multa",
    LAVAGEM: "Lavagem",
    PNEU: "Pneu",
    DOCUMENTACAO: "Documentação",
    OUTROS: "Outros",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Despesas" />
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Fechar" : "Nova Despesa"}
        </Button>
      </div>

      {showForm && <ExpenseForm onSuccess={() => { setShowForm(false); window.location.reload(); }} />}

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma despesa encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Descrição</th>
                    <th className="pb-3 font-medium">Categoria</th>
                    <th className="pb-3 font-medium">Tipo</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/50">
                      <td className="py-3">{formatDate(d.date)}</td>
                      <td className="py-3">{d.description}</td>
                      <td className="py-3">
                        <Badge variant={d.category === "FIXA" ? "info" : "warning"}>
                          {d.category === "FIXA" ? "Fixa" : "Variável"}
                        </Badge>
                      </td>
                      <td className="py-3">{typeLabels[d.type] || d.type}</td>
                      <td className="py-3">{d.vehicle ? d.vehicle.placa : "Geral"}</td>
                      <td className="py-3 text-right font-medium text-red-600">{formatCurrency(d.amount)}</td>
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

function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Array<{ id: string; placa: string; modelo: string }>>([]);
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    category: "VARIAVEL",
    type: "OUTROS",
    vehicleId: "",
    paymentMethod: "PIX",
  });

  useEffect(() => {
    fetch("/api/veiculos").then(r => r.json()).then(setVehicles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/despesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleId: form.vehicleId || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Despesa registrada!");
      onSuccess();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Valor *</Label>
            <CurrencyInput value={form.amount} onValueChange={(v) => setForm(f => ({ ...f, amount: v }))} required />
          </div>
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="FIXA">Fixa</option>
              <option value="VARIAVEL">Variável</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="IPVA">IPVA</option>
              <option value="SEGURO">Seguro</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="COMBUSTIVEL">Combustível</option>
              <option value="MULTA">Multa</option>
              <option value="LAVAGEM">Lavagem</option>
              <option value="PNEU">Pneu</option>
              <option value="DOCUMENTACAO">Documentação</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Veículo</Label>
            <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Geral (empresa)</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar Despesa"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
