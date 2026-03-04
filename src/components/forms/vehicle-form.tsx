"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { maskPlaca } from "@/lib/masks";

const vehicleTypes = [
  { value: "CARRO", label: "Carro" },
  { value: "MOTO", label: "Moto" },
  { value: "CAMINHONETE", label: "Caminhonete" },
  { value: "VAN", label: "Van" },
  { value: "CAMINHAO", label: "Caminhão" },
  { value: "ONIBUS", label: "Ônibus" },
  { value: "UTILITARIO", label: "Utilitário" },
];

const statusOptions = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "ALUGADO", label: "Alugado" },
  { value: "MANUTENCAO", label: "Manutenção" },
  { value: "INATIVO", label: "Inativo" },
];

interface VehicleFormProps {
  initialData?: Record<string, unknown>;
  isEditing?: boolean;
}

export function VehicleForm({ initialData, isEditing }: VehicleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    placa: maskPlaca((initialData?.placa as string) || ""),
    marca: (initialData?.marca as string) || "",
    modelo: (initialData?.modelo as string) || "",
    anoFabricacao: (initialData?.anoFabricacao as number) || new Date().getFullYear(),
    anoModelo: (initialData?.anoModelo as number) || new Date().getFullYear(),
    cor: (initialData?.cor as string) || "",
    chassi: (initialData?.chassi as string) || "",
    renavam: (initialData?.renavam as string) || "",
    tipo: (initialData?.tipo as string) || "CARRO",
    status: (initialData?.status as string) || "DISPONIVEL",
    valorMensal: (initialData?.valorMensal as number) || 0,
    kmAtual: (initialData?.kmAtual as number) || 0,
    kmProximaTroca: (initialData?.kmProximaTroca as number) || 0,
    observacoes: (initialData?.observacoes as string) || "",
  });

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
      const url = isEditing ? `/api/veiculos/${initialData?.id}` : "/api/veiculos";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          placa: form.placa.replace(/[^A-Z0-9]/gi, "").toUpperCase(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(typeof err.error === "string" ? err.error : "Erro ao salvar veículo");
      }

      toast.success(isEditing ? "Veículo atualizado com sucesso" : "Veículo criado com sucesso");
      router.push("/veiculos");
      router.refresh();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Veículo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa *</Label>
            <MaskedInput
              id="placa"
              mask={maskPlaca}
              value={form.placa}
              onValueChange={(_raw, masked) => setForm((f) => ({ ...f, placa: masked }))}
              placeholder="ABC-1D23"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marca">Marca *</Label>
            <Input
              id="marca"
              name="marca"
              value={form.marca}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelo">Modelo *</Label>
            <Input
              id="modelo"
              name="modelo"
              value={form.modelo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anoFabricacao">Ano Fabricação *</Label>
            <Input
              id="anoFabricacao"
              name="anoFabricacao"
              type="number"
              value={form.anoFabricacao}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anoModelo">Ano Modelo *</Label>
            <Input
              id="anoModelo"
              name="anoModelo"
              type="number"
              value={form.anoModelo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cor">Cor *</Label>
            <Input
              id="cor"
              name="cor"
              value={form.cor}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chassi">Chassi</Label>
            <Input
              id="chassi"
              name="chassi"
              value={form.chassi}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="renavam">RENAVAM</Label>
            <Input
              id="renavam"
              name="renavam"
              value={form.renavam}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {vehicleTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="valorMensal">Valor Mensal *</Label>
            <CurrencyInput
              id="valorMensal"
              value={form.valorMensal}
              onValueChange={(v) => setForm((f) => ({ ...f, valorMensal: v }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmAtual">KM Atual</Label>
            <Input
              id="kmAtual"
              name="kmAtual"
              type="number"
              min="0"
              value={form.kmAtual}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kmProximaTroca">KM Próxima Troca Óleo</Label>
            <Input
              id="kmProximaTroca"
              name="kmProximaTroca"
              type="number"
              min="0"
              value={form.kmProximaTroca}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2 md:col-span-2 lg:col-span-3">
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
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
