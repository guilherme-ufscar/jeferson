import { z } from "zod";

export const revenueSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  vehicleId: z.string().optional().nullable(),
  contractId: z.string().optional().nullable(),
  billingId: z.string().optional().nullable(),
  type: z.enum(["ALUGUEL", "MULTA_CLIENTE", "SEGURO", "OUTROS"], {
    message: "Tipo de receita é obrigatório",
  }),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  paymentMethod: z.enum(["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO", "TRANSFERENCIA"], {
    message: "Forma de pagamento é obrigatória",
  }),
  description: z.string().min(1, "Descrição é obrigatória"),
});

export type RevenueFormData = z.infer<typeof revenueSchema>;
