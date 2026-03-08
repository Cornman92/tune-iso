import { z } from 'zod';

const MAX_ARRAY_LENGTH = 500;

export const projectDataSchema = z.object({
  version: z.string().min(1),
  name: z.string().max(200).default(''),
  exportedAt: z.string().default(''),
  customizations: z.object({
    programs: z.array(z.string().max(200)).max(MAX_ARRAY_LENGTH),
    tweaks: z.array(z.string().max(200)).max(MAX_ARRAY_LENGTH),
    optimizations: z.array(z.string().max(200)).max(MAX_ARRAY_LENGTH),
  }),
  drivers: z.array(z.object({
    name: z.string().max(500),
    path: z.string().max(1000),
    type: z.enum(['inf', 'folder']),
  })).max(MAX_ARRAY_LENGTH).default([]),
  updates: z.array(z.object({
    kb: z.string().max(50),
    title: z.string().max(500),
    category: z.string().max(100),
    source: z.string().max(100),
    filePath: z.string().max(1000).optional(),
  })).max(MAX_ARRAY_LENGTH).default([]),
  unattend: z.array(z.object({
    id: z.string().max(200),
    value: z.string().max(2000),
    enabled: z.boolean(),
  })).max(MAX_ARRAY_LENGTH).default([]),
  buildSteps: z.array(z.object({
    id: z.string().max(200),
    label: z.string().max(200),
    enabled: z.boolean(),
  })).max(50).optional(),
});

export type ValidatedProjectData = z.infer<typeof projectDataSchema>;
