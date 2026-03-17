import { z } from "zod";

export const contractSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data de término é obrigatória"),
  weeklyValue: z.coerce.number().positive("Valor semanal deve ser positivo").optional(),
  monthlyValue: z.coerce.number().positive("Valor mensal deve ser positivo").optional(),
  valorCaucao: z.coerce.number().min(0).optional().nullable(),
  valorMultaAtraso: z.coerce.number().min(0).optional().nullable(),
  kmEntrega: z.coerce.number().int().min(0).optional().nullable(),
  porcentagemMensal: z.coerce.number().min(0).max(100).optional().nullable(),
  paymentDay: z.coerce.number().int().min(1).max(31, "Dia de vencimento inválido (1-31)").default(5),
  observacoes: z.string().optional().nullable(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

export const closeContractSchema = z.object({
  reason: z.enum(["ENCERRADO", "CANCELADO"]),
  novoStatusVeiculo: z.enum(["DISPONIVEL", "MANUTENCAO", "INATIVO"]).default("DISPONIVEL"),
});
