import { z } from "zod";

export const expenseSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  category: z.enum(["FIXA", "VARIAVEL"], {
    message: "Categoria é obrigatória",
  }),
  type: z.enum([
    "IPVA", "SEGURO", "MANUTENCAO", "COMBUSTIVEL", "MULTA",
    "LAVAGEM", "PNEU", "DOCUMENTACAO", "OUTROS",
  ], {
    message: "Tipo é obrigatório",
  }),
  vehicleId: z.string().optional().nullable(),
  amount: z.coerce.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  paymentMethod: z.enum(["PIX", "DINHEIRO", "CARTAO_CREDITO", "CARTAO_DEBITO", "BOLETO", "TRANSFERENCIA"]).optional().nullable(),
}).refine(
  (data) => {
    if (data.category === "VARIAVEL" && !data.vehicleId) {
      return false;
    }
    return true;
  },
  {
    message: "Veículo é obrigatório para despesas variáveis",
    path: ["vehicleId"],
  }
);

export type ExpenseFormData = z.infer<typeof expenseSchema>;
