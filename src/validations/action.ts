import { z } from 'zod';

export const solanaActionSchema = z.object({
  icon: z.string().url(),
  label: z.string(),
  title: z.string(),
  description: z.string(),
  disabled: z.boolean()
});

export type SolanaAction = z.infer<
  typeof solanaActionSchema
>;
