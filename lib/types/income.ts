import { z } from 'zod';

export const incomeSchema = z.object({
  id: z.string().optional(),
  value: z.number().positive('O valor deve ser maior que zero'),
  category_id: z.string().min(1, 'Categoria é obrigatória'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Descrição muito longa'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  synced: z.union([z.boolean(), z.number()]).optional().default(false),
});

export type Income = z.infer<typeof incomeSchema>;

export const incomeFormSchema = incomeSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  synced: true,
});

export type IncomeFormData = z.infer<typeof incomeFormSchema>;
