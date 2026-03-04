"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface MaintenanceRecord {
  id: string;
  type: string;
  description: string;
  cost: number;
  date: string;
  km: number;
  vehicle: { placa: string; modelo: string; marca: string };
}

export default function ManutencaoPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Array<{ id: string; placa: string; modelo: string; kmAtual: number; kmProximaTroca: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/veiculos").then(r => r.json()).then(setVehicles);
  }, []);

  useEffect(() => {
    if (!selectedVehicle) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/manutencao?vehicleId=${selectedVehicle}`)
      .then(r => r.json())
      .then(setRecords)
      .catch(() => toast.error("Erro ao carregar manutenções"))
      .finally(() => setLoading(false));
  }, [selectedVehicle]);

  const getOilStatus = (v: { kmAtual: number; kmProximaTroca: number }) => {
    if (!v.kmProximaTroca) return null;
    const diff = v.kmProximaTroca - v.kmAtual;
    if (diff <= 0) return { label: "Atrasado", variant: "destructive" as const };
    if (diff <= 1000) return { label: "Próximo", variant: "warning" as const };
    return { label: "Em dia", variant: "success" as const };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manutenção & Troca de Óleo" />

      {/* Oil change status overview */}
      <Card>
        <CardHeader><CardTitle className="text-base">Status Troca de Óleo - Frota</CardTitle></CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
          ) : (
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map(v => {
                const status = getOilStatus(v);
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => setSelectedVehicle(v.id)}>
                    <div>
                      <p className="text-sm font-medium">{v.placa} - {v.modelo}</p>
                      <p className="text-xs text-muted-foreground">
                        KM: {v.kmAtual?.toLocaleString("pt-BR")} | Próx troca: {v.kmProximaTroca?.toLocaleString("pt-BR") || "—"}
                      </p>
                    </div>
                    {status && <Badge variant={status.variant}>{status.label}</Badge>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected vehicle maintenance history */}
      {selectedVehicle && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Histórico - {vehicles.find(v => v.id === selectedVehicle)?.placa}
            </h3>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? "Fechar" : "Registrar Manutenção"}
            </Button>
          </div>

          {showForm && (
            <MaintenanceForm
              vehicleId={selectedVehicle}
              onSuccess={() => {
                setShowForm(false);
                // Reload
                fetch(`/api/manutencao?vehicleId=${selectedVehicle}`).then(r => r.json()).then(setRecords);
              }}
            />
          )}

          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="h-24 animate-pulse rounded bg-muted" />
              ) : records.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Nenhum registro encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 font-medium">Data</th>
                        <th className="pb-3 font-medium">Tipo</th>
                        <th className="pb-3 font-medium">Descrição</th>
                        <th className="pb-3 font-medium text-right">KM</th>
                        <th className="pb-3 font-medium text-right">Custo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map(r => (
                        <tr key={r.id} className="border-b">
                          <td className="py-2">{formatDate(r.date)}</td>
                          <td className="py-2">
                            <Badge variant={r.type === "TROCA_OLEO" ? "info" : "default"}>
                              {r.type === "TROCA_OLEO" ? "Troca Óleo" : "Manutenção"}
                            </Badge>
                          </td>
                          <td className="py-2">{r.description}</td>
                          <td className="py-2 text-right">{r.km?.toLocaleString("pt-BR")}</td>
                          <td className="py-2 text-right">{formatCurrency(r.cost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function MaintenanceForm({ vehicleId, onSuccess }: { vehicleId: string; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "maintenance",
    vehicleId,
    description: "",
    cost: 0,
    date: new Date().toISOString().slice(0, 10),
    km: 0,
    nextChangeKm: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/manutencao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Manutenção registrada!");
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
            <Label>Tipo</Label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="maintenance">Manutenção Geral</option>
              <option value="oil_change">Troca de Óleo</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>Custo</Label>
            <CurrencyInput value={form.cost} onValueChange={(v) => setForm(f => ({ ...f, cost: v }))} />
          </div>
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label>KM Atual *</Label>
            <Input type="number" min="0" value={form.km} onChange={e => setForm(f => ({ ...f, km: Number(e.target.value) }))} required />
          </div>
          {form.type === "oil_change" && (
            <div className="space-y-2">
              <Label>KM Próxima Troca</Label>
              <Input type="number" min="0" value={form.nextChangeKm} onChange={e => setForm(f => ({ ...f, nextChangeKm: Number(e.target.value) }))} />
            </div>
          )}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
