"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Car } from "lucide-react";
import { addMonths, format } from "date-fns";

interface VehicleInfo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  cor: string;
  status: string;
}

interface ClientOption {
  id: string;
  label: string;
}

const DEFAULT_DURATION_MONTHS = 6;

export default function NovoContratoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);

  const [placaInput, setPlacaInput] = useState("");
  const [searchingPlate, setSearchingPlate] = useState(false);
  const [foundVehicle, setFoundVehicle] = useState<VehicleInfo | null>(null);
  const [plateError, setPlateError] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    vehicleId: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: format(addMonths(new Date(), DEFAULT_DURATION_MONTHS), "yyyy-MM-dd"),
    weeklyValue: 0,
    valorCaucao: 0,
    valorMultaAtraso: 0,
    kmEntrega: 0,
    porcentagemMensal: 0,
    paymentDay: 5,
    observacoes: "",
  });

  useEffect(() => {
    fetch("/api/clientes?status=ATIVO")
      .then((r) => r.json())
      .then((clientes) =>
        setClients(clientes.map((c: Record<string, string>) => ({ id: c.id, label: c.name })))
      );
  }, []);

  const handleStartDateChange = (value: string) => {
    const start = new Date(value + "T12:00:00");
    const end = addMonths(start, DEFAULT_DURATION_MONTHS);
    setForm((f) => ({
      ...f,
      startDate: value,
      endDate: format(end, "yyyy-MM-dd"),
    }));
  };

  const searchByPlate = useCallback(async () => {
    const placa = placaInput.trim().toUpperCase();
    if (!placa) return;

    setSearchingPlate(true);
    setPlateError("");
    setFoundVehicle(null);
    setForm((f) => ({ ...f, vehicleId: "" }));

    try {
      const res = await fetch(`/api/veiculos?search=${encodeURIComponent(placa)}`);
      const vehicles: VehicleInfo[] = await res.json();
      const match = vehicles.find((v) => v.placa.toUpperCase() === placa);

      if (!match) {
        setPlateError("Veículo não encontrado com esta placa.");
        return;
      }

      if (match.status !== "DISPONIVEL") {
        const statusLabel: Record<string, string> = {
          ALUGADO: "Alugado",
          MANUTENCAO: "Em Manutenção",
          INATIVO: "Inativo",
        };
        setPlateError(
          `Veículo ${match.placa} está "${statusLabel[match.status] || match.status}" e não está disponível para locação.`
        );
        return;
      }

      setFoundVehicle(match);
      setForm((f) => ({ ...f, vehicleId: match.id }));
    } catch {
      setPlateError("Erro ao buscar veículo. Tente novamente.");
    } finally {
      setSearchingPlate(false);
    }
  }, [placaInput]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.vehicleId) {
      toast.error("Busque e selecione um veículo pela placa antes de continuar.");
      return;
    }

    if (form.weeklyValue <= 0) {
      toast.error("Informe o valor do aluguel semanal.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        weeklyValue: form.weeklyValue > 0 ? form.weeklyValue : undefined,
        valorCaucao: form.valorCaucao > 0 ? form.valorCaucao : undefined,
        valorMultaAtraso: form.valorMultaAtraso > 0 ? form.valorMultaAtraso : undefined,
        kmEntrega: form.kmEntrega > 0 ? form.kmEntrega : undefined,
        porcentagemMensal: form.porcentagemMensal > 0 ? form.porcentagemMensal : undefined,
        observacoes: form.observacoes || undefined,
      };

      const res = await fetch("/api/contratos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

        {/* Plate Search */}
        <Card>
          <CardHeader>
            <CardTitle>Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite a placa (ex: ABC1D23)"
                value={placaInput}
                onChange={(e) => {
                  setPlacaInput(e.target.value.toUpperCase());
                  if (foundVehicle) {
                    setFoundVehicle(null);
                    setForm((f) => ({ ...f, vehicleId: "" }));
                  }
                  setPlateError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchByPlate())}
                className="uppercase font-mono max-w-xs"
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchByPlate}
                disabled={searchingPlate || !placaInput.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                {searchingPlate ? "Buscando..." : "Buscar Placa"}
              </Button>
            </div>

            {plateError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{plateError}</p>
              </div>
            )}

            {foundVehicle && (
              <div className="flex items-center gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                <Car className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold font-mono text-green-900">{foundVehicle.placa}</span>
                    <Badge variant="success">Disponível</Badge>
                  </div>
                  <p className="text-sm text-green-800 mt-0.5">
                    {foundVehicle.marca} {foundVehicle.modelo} · {foundVehicle.cor}
                  </p>
                </div>
                <span className="text-xs font-medium text-green-600">✓ Selecionado</span>
              </div>
            )}

            {!foundVehicle && !plateError && (
              <p className="text-xs text-muted-foreground">
                Digite a placa e clique em "Buscar Placa". Somente veículos disponíveis podem ser selecionados.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Contract Data */}
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
              <Label htmlFor="kmEntrega">KM na Entrega do Veículo</Label>
              <Input
                id="kmEntrega"
                name="kmEntrega"
                type="number"
                min="0"
                value={form.kmEntrega || ""}
                onChange={handleChange}
                placeholder="Quilometragem no ato da entrega"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Padrão: {DEFAULT_DURATION_MONTHS} meses a partir do início
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Data */}
        <Card>
          <CardHeader>
            <CardTitle>Valores Financeiros</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weeklyValue">
                Valor do Aluguel Semanal *
              </Label>
              <CurrencyInput
                id="weeklyValue"
                value={form.weeklyValue}
                onValueChange={(v) => setForm((f) => ({ ...f, weeklyValue: v }))}
              />
              <p className="text-xs text-muted-foreground">
                Cobranças serão geradas automaticamente toda semana
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorCaucao">Caução (Depósito de Garantia)</Label>
              <CurrencyInput
                id="valorCaucao"
                value={form.valorCaucao}
                onValueChange={(v) => setForm((f) => ({ ...f, valorCaucao: v }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorMultaAtraso">Multa por Atraso no Pagamento</Label>
              <CurrencyInput
                id="valorMultaAtraso"
                value={form.valorMultaAtraso}
                onValueChange={(v) => setForm((f) => ({ ...f, valorMultaAtraso: v }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentagemMensal">Taxa Percentual Mensal (%)</Label>
              <Input
                id="porcentagemMensal"
                name="porcentagemMensal"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.porcentagemMensal || ""}
                onChange={handleChange}
                placeholder="0.00"
              />
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
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || !form.vehicleId}>
            {loading ? "Criando..." : "Criar Contrato"}
          </Button>
        </div>
      </form>
    </div>
  );
}
