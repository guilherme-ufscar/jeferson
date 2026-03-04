import { z } from "zod";

export const vehicleSchema = z.object({
  placa: z
    .string()
    .min(7, "Placa é obrigatória")
    .max(8, "Placa inválida")
    .transform((val) => val.toUpperCase().replace(/[^A-Z0-9]/g, ""))
    .refine(
      (val) => /^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/.test(val),
      "Formato de placa inválido (ex: ABC1D23 ou ABC1234)"
    ),
  tipo: z.enum(["CARRO", "MOTO", "CAMINHONETE", "VAN", "CAMINHAO", "ONIBUS", "UTILITARIO"], { message: "Tipo é obrigatório" }),
  marca: z.string().min(1, "Marca é obrigatória").max(100),
  modelo: z.string().min(1, "Modelo é obrigatório").max(100),
  anoFabricacao: z.coerce.number().int().min(1900, "Ano inválido").max(new Date().getFullYear() + 1, "Ano inválido"),
  anoModelo: z.coerce.number().int().min(1900, "Ano inválido").max(new Date().getFullYear() + 2, "Ano inválido"),
  cor: z.string().min(1, "Cor é obrigatória").max(50),
  chassi: z.string().max(20).optional().nullable(),
  renavam: z.string().max(15).optional().nullable(),
  kmAtual: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  valorMensal: z.coerce.number().min(0, "Valor mensal deve ser >= 0"),
  status: z.enum(["DISPONIVEL", "ALUGADO", "MANUTENCAO", "INATIVO"]).optional(),
  kmProximaTroca: z.coerce.number().int().min(0).optional().nullable(),
  observacoes: z.string().optional().nullable(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
