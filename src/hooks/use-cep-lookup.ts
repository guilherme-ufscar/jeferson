"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface CepData {
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export function useCepLookup(
  onSuccess: (data: CepData) => void
) {
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(
    async (cep: string) => {
      const digits = cep.replace(/\D/g, "");
      if (digits.length !== 8) return;

      setLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data: ViaCepResponse = await res.json();

        if (data.erro) {
          toast.error("CEP não encontrado");
          return;
        }

        onSuccess({
          endereco: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        });
      } catch {
        toast.error("Erro ao buscar CEP");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return { lookup, loading };
}
