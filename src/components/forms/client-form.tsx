"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { maskCPF, maskPhone, maskCEP, maskRG } from "@/lib/masks";
import { useCepLookup } from "@/hooks/use-cep-lookup";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  initialData?: Record<string, unknown>;
  isEditing?: boolean;
}

export function ClientForm({ initialData, isEditing }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: (initialData?.name as string) || "",
    cpf: maskCPF((initialData?.cpf as string) || ""),
    rg: maskRG((initialData?.rg as string) || ""),
    phone: maskPhone((initialData?.phone as string) || ""),
    email: (initialData?.email as string) || "",
    cep: maskCEP((initialData?.cep as string) || ""),
    endereco: (initialData?.endereco as string) || "",
    numero: (initialData?.numero as string) || "",
    complemento: (initialData?.complemento as string) || "",
    bairro: (initialData?.bairro as string) || "",
    cidade: (initialData?.cidade as string) || "",
    estado: (initialData?.estado as string) || "",
    cnh: (initialData?.cnh as string) || "",
    cnhValidade: (initialData?.cnhValidade as string)?.slice(0, 10) || "",
    observacoes: (initialData?.observacoes as string) || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCepSuccess = useCallback((data: { endereco: string; bairro: string; cidade: string; estado: string }) => {
    setForm((prev) => ({
      ...prev,
      endereco: data.endereco,
      bairro: data.bairro,
      cidade: data.cidade,
      estado: data.estado,
    }));
  }, []);

  const { lookup: lookupCep, loading: cepLoading } = useCepLookup(handleCepSuccess);

  const handleCepChange = (_raw: string, masked: string) => {
    setForm((prev) => ({ ...prev, cep: masked }));
    const digits = masked.replace(/\D/g, "");
    if (digits.length === 8) {
      lookupCep(digits);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/clientes/${initialData?.id}` : "/api/clientes";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Envia só dígitos para o backend
          cpf: form.cpf.replace(/\D/g, ""),
          rg: form.rg.replace(/[^0-9Xx]/g, ""),
          phone: form.phone.replace(/\D/g, ""),
          cep: form.cep.replace(/\D/g, ""),
          cnhValidade: form.cnhValidade || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(typeof err.error === "string" ? err.error : "Erro ao salvar");
      }
      toast.success(isEditing ? "Cliente atualizado!" : "Cliente cadastrado!");
      router.push("/clientes");
      router.refresh();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Dados Pessoais</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <MaskedInput
              id="cpf"
              mask={maskCPF}
              value={form.cpf}
              onValueChange={(_raw, masked) => setForm((f) => ({ ...f, cpf: masked }))}
              placeholder="000.000.000-00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rg">RG</Label>
            <MaskedInput
              id="rg"
              mask={maskRG}
              value={form.rg}
              onValueChange={(_raw, masked) => setForm((f) => ({ ...f, rg: masked }))}
              placeholder="00.000.000-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <MaskedInput
              id="phone"
              mask={maskPhone}
              value={form.phone}
              onValueChange={(_raw, masked) => setForm((f) => ({ ...f, phone: masked }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnh">CNH</Label>
            <Input id="cnh" name="cnh" value={form.cnh} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnhValidade">Validade CNH</Label>
            <Input id="cnhValidade" name="cnhValidade" type="date" value={form.cnhValidade} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Endereço</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <div className="relative">
              <MaskedInput
                id="cep"
                mask={maskCEP}
                value={form.cep}
                onValueChange={handleCepChange}
                placeholder="00000-000"
              />
              {cepLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-400" />
              )}
            </div>
          </div>
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" name="endereco" value={form.endereco} onChange={handleChange} readOnly={cepLoading} className={cepLoading ? "bg-zinc-100" : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" value={form.numero} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" value={form.complemento} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} readOnly={cepLoading} className={cepLoading ? "bg-zinc-100" : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} readOnly={cepLoading} className={cepLoading ? "bg-zinc-100" : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" name="estado" value={form.estado} onChange={handleChange} maxLength={2} placeholder="SP" readOnly={cepLoading} className={cepLoading ? "bg-zinc-100" : ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
        <CardContent>
          <textarea
            id="observacoes"
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
}
