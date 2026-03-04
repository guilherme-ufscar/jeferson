import { z } from "zod";

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  km: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  cost: z.coerce.number().min(0).optional().nullable(),
  type: z.string().default("MANUTENCAO"),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export const oilChangeSchema = z.object({
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  km: z.coerce.number().int().min(0, "KM deve ser >= 0"),
  date: z.string().min(1, "Data é obrigatória"),
  nextChangeKm: z.coerce.number().int().min(0).optional(),
});

export type OilChangeFormData = z.infer<typeof oilChangeSchema>;
