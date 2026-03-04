import { z } from "zod";
import { validateCPF } from "@/lib/utils";

export const clientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  cpf: z
    .string()
    .min(11, "CPF é obrigatório")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => val.length === 11, "CPF deve ter 11 dígitos")
    .refine(validateCPF, "CPF inválido"),
  rg: z.string().max(20).optional().nullable(),
  phone: z.string().min(10, "Telefone é obrigatório").max(20),
  email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  cep: z.string().max(10).optional().nullable(),
  endereco: z.string().max(300).optional().nullable(),
  numero: z.string().max(20).optional().nullable(),
  complemento: z.string().max(100).optional().nullable(),
  bairro: z.string().max(100).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
  cnh: z.string().max(20).optional().nullable(),
  cnhValidade: z.string().optional().nullable(),
  status: z.enum(["ATIVO", "INATIVO", "INADIMPLENTE"]).optional(),
  observacoes: z.string().optional().nullable(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
