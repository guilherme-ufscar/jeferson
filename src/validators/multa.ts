import { z } from "zod";

export const fineSchema = z.object({
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  date: z.string().min(1, "Data da infração é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  dueDate: z.string().optional().nullable(),
  autoInfracao: z.string().optional().nullable(),
});

export type FineFormData = z.infer<typeof fineSchema>;
