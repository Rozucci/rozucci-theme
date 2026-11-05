/**
 * Content collections.
 *
 * Projects live in src/content/projects/<locale>/<slug>.md. The same file
 * name in each locale folder is the same project — that pairing powers the
 * language switcher and hreflang. (Astro 6+ requires this file at
 * src/content.config.ts.)
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { DISCIPLINES } from './data/disciplines';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      discipline: z.enum(DISCIPLINES),
      year: z.number().int(),
      tools: z.array(z.string()).default([]),
      role: z.string(),
      cover: image(),
      coverAlt: z.string(),
      media: z
        .array(
          z.object({
            src: image(),
            alt: z.string(),
            ratio: z.enum(['square', 'portrait', 'landscape', 'wide', 'cinema']).default('landscape'),
            caption: z.string().optional(),
            /** Span both columns of the media sequence. */
            wide: z.boolean().default(false),
          }),
        )
        .default([]),
      credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
      /** Sort order in the index (ascending). */
      order: z.number().int(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects };
