import { z } from 'zod';

export const updateAppSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  slug: z.string().optional(),
  is_public: z.boolean().optional(),
  build_command: z.string().optional(),
  output_path: z.string().optional(),
  entrypoint: z.string().optional(),
  git_repo_url: z.string().optional(),
  git_repo_branch: z.string().optional(),
  git_repo_path: z.string().optional(),
});

export type UpdateAppInput = z.infer<typeof updateAppSchema>;

export const createAppSchema = z.object({
  slug: z.string().min(1),
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  is_public: z.boolean().optional(),
  build_command: z.string().optional(),
  output_path: z.string().optional(),
  entrypoint: z.string().optional(),
  git_repo_url: z.string().min(1),
  git_repo_branch: z.string().optional(),
  git_repo_path: z.string().optional(),
});

export type CreateAppInput = z.infer<typeof createAppSchema>;
