"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SelectOption {
  id: string;
  label: string;
}

export default function NovoContratoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<SelectOption[]>([]);
  const [clients, setClients] = useState<SelectOption[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    vehicleId: "",
    startDate: "",
    endDate: "",
    monthlyValue: 0,
    paymentDay: 5,
    observacoes: "",
  });

  useEffect(() => {
    // Fetch available vehicles and active clients
    Promise.all([
      fetch("/api/veiculos?status=DISPONIVEL").then((r) => r.json()),
      fetch("/api/clientes?status=ATIVO").then((r) => r.json()),
    ]).then(([veiculos, clientes]) => {
      setVehicles(
        veiculos.map((v: Record<string, string>) => ({
          id: v.id,
          label: `${v.placa} - ${v.marca} ${v.modelo}`,
        }))
      );
      setClients(
        clientes.map((c: Record<string, string>) => ({
          id: c.id,
          label: c.name,
        }))
      );
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(typeof err.error === "string" ? err.error : "Erro ao criar contrato");
      }
      toast.success("Contrato criado com sucesso!");
      router.push("/contratos");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Novo Contrato" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Dados do Contrato</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <select
                id="clientId"
                name="clientId"
                value={form.clientId}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Veículo *</Label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione um veículo</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Início *</Label>
              <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Fim *</Label>
              <Input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyValue">Valor Mensal *</Label>
              <CurrencyInput id="monthlyValue" value={form.monthlyValue} onValueChange={(v) => setForm((f) => ({ ...f, monthlyValue: v }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDay">Dia do Vencimento *</Label>
              <Input id="paymentDay" name="paymentDay" type="number" min="1" max="28" value={form.paymentDay} onChange={handleChange} required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Contrato"}
          </Button>
        </div>
      </form>
    </div>
  );
}
