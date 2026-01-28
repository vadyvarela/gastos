import { z } from 'zod';

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'),
  is_default: z.boolean().optional().default(false),
  created_at: z.string().optional(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoryFormSchema = categorySchema.omit({
  id: true,
  created_at: true,
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
