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

interface Fine {
  id: string;
  description: string;
  amount: number;
  date: string;
  dueDate: string | null;
  status: string;
  autoInfracao: string | null;
  vehicle: { placa: string; modelo: string };
}

const statusMap: Record<string, { label: string; variant: "warning" | "success" | "info" | "destructive" | "secondary" }> = {
  PENDENTE: { label: "Pendente", variant: "warning" },
  PAGA: { label: "Paga", variant: "success" },
  RECURSO: { label: "Em Recurso", variant: "info" },
  CANCELADA: { label: "Cancelada", variant: "secondary" },
};

export default function MultasPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchFines = () => {
    setLoading(true);
    fetch("/api/multas")
      .then(r => r.json())
      .then(setFines)
      .catch(() => toast.error("Erro ao carregar multas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFines(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "PAGA") {
        body.paymentMethod = "PIX";
        body.paidAt = new Date().toISOString();
      }
      const res = await fetch(`/api/multas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Status atualizado!");
      fetchFines();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Multas" />
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Fechar" : "Registrar Multa"}
        </Button>
      </div>

      {showForm && <FineForm onSuccess={() => { setShowForm(false); fetchFines(); }} />}

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : fines.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nenhuma multa encontrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Veículo</th>
                    <th className="pb-3 font-medium">Auto Infração</th>
                    <th className="pb-3 font-medium">Descrição</th>
                    <th className="pb-3 font-medium">Vencimento</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map(f => {
                    const st = statusMap[f.status] || { label: f.status, variant: "default" as const };
                    return (
                      <tr key={f.id} className="border-b hover:bg-muted/50">
                        <td className="py-3">{formatDate(f.date)}</td>
                        <td className="py-3">{f.vehicle?.placa}</td>
                        <td className="py-3 font-mono">{f.autoInfracao || "—"}</td>
                        <td className="py-3">{f.description}</td>
                        <td className="py-3">{f.dueDate ? formatDate(f.dueDate) : "—"}</td>
                        <td className="py-3 text-right">{formatCurrency(f.amount)}</td>
                        <td className="py-3"><Badge variant={st.variant}>{st.label}</Badge></td>
                        <td className="py-3 text-right">
                          {f.status === "PENDENTE" && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(f.id, "PAGA")}>Pagar</Button>
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(f.id, "RECURSO")}>Recurso</Button>
                            </div>
                          )}
                          {f.status === "RECURSO" && (
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(f.id, "PAGA")}>Pagar</Button>
                              <Button size="sm" variant="outline" onClick={() => handleStatusChange(f.id, "CANCELADA")}>Cancelar</Button>
                            </div>
                          )}
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

function FineForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Array<{ id: string; placa: string; modelo: string }>>([]);
  const [form, setForm] = useState({
    vehicleId: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    dueDate: "",
    autoInfracao: "",
  });

  useEffect(() => {
    fetch("/api/veiculos").then(r => r.json()).then(setVehicles);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/multas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || undefined,
          autoInfracao: form.autoInfracao || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Multa registrada!");
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
            <Label>Veículo *</Label>
            <select value={form.vehicleId} onChange={e => setForm(f => ({ ...f, vehicleId: e.target.value }))} required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Selecione</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Valor *</Label>
            <CurrencyInput value={form.amount} onValueChange={(v) => setForm(f => ({ ...f, amount: v }))} required />
          </div>
          <div className="space-y-2">
            <Label>Data Infração *</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Auto de Infração</Label>
            <Input value={form.autoInfracao} onChange={e => setForm(f => ({ ...f, autoInfracao: e.target.value }))} />
          </div>
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar Multa"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
