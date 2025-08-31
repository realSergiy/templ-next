import { z } from 'zod';

export const createFeatureSchema = z.object({
  title: z.string().min(1).max(100),
  laneId: z.string(),
  startQuarter: z.number().int().min(20_241).max(20_264),
  endQuarter: z.number().int().min(20_241).max(20_264),
  linkUrl: z.string().url().optional(),
  color: z.string().optional(),
});

export const updateFeatureSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  laneId: z.string().optional(),
  startQuarter: z.number().int().min(20_241).max(20_264).optional(),
  endQuarter: z.number().int().min(20_241).max(20_264).optional(),
  linkUrl: z.string().url().nullable().optional(),
  color: z.string().nullable().optional(),
});

export const deleteFeatureSchema = z.object({
  id: z.string(),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;
export type DeleteFeatureInput = z.infer<typeof deleteFeatureSchema>;
