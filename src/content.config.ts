import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Neue, optionale Felder aus dem Relaunch. Noch nicht in jedem Eintrag gepflegt,
// deshalb ueberall optional und tolerant.
const relaunchFelder = {
  bereich: z.string().optional().catch(undefined),
  url: z.string().optional().catch(undefined),
  geprueft_am: z.string().optional().catch(undefined),
  kurzantwort: z.string().optional().catch(undefined),
  wege: z.array(z.string()).optional().catch(undefined),
  verwandter_weg: z.string().optional().catch(undefined),
  verwandtes_thema: z.string().optional().catch(undefined),
};

// Ein Baustein aus dem Block-Baukasten. Nur "type" wird geprueft, alles andere
// ist frei, siehe src/components/blocks/BlockRenderer.astro fuer die Zuordnung.
const baustein = z
  .object({
    type: z.string().optional().catch(undefined),
  })
  .passthrough();

const quelle = z
  .object({
    titel: z.string().optional().catch(undefined),
    url: z.string().optional().catch(undefined),
  })
  .passthrough();

const themen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/themen' }),
  schema: z
    .object({
      title: z.string().optional().catch(undefined),
      art: z.string().optional().catch(undefined),
      wissensraum: z.string().optional().catch(undefined),
      gebiet: z.string().optional().catch(undefined),
      untergruppe: z.string().optional().catch(undefined),
      lead: z.string().optional().catch(undefined),
      lesezeit: z.number().optional().catch(undefined),
      vertiefzeit: z.number().optional().catch(undefined),
      bloecke: z.array(baustein).optional().catch([]),
      verwandte_artikel: z.array(z.any()).optional().catch([]),
      verwandte_tools: z.array(z.any()).optional().catch([]),
      verwandte_themen: z.array(z.any()).optional().catch([]),
      quellen: z.array(quelle).optional().catch([]),
      slug: z.string().optional().catch(undefined),
      seo_title: z.string().optional().catch(undefined),
      seo_description: z.string().optional().catch(undefined),
      ...relaunchFelder,
    })
    .passthrough(),
});

const fachgebiete = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/fachgebiete' }),
  schema: z
    .object({
      title: z.string().optional().catch(undefined),
      slug: z.string().optional().catch(undefined),
      world: z.string().optional().catch(undefined),
      description: z.string().optional().catch(undefined),
      order: z.number().optional().catch(undefined),
      status: z.string().optional().catch(undefined),
      visibility: z.string().optional().catch(undefined),
      seo_title: z.string().optional().catch(undefined),
      meta_description: z.string().optional().catch(undefined),
      ...relaunchFelder,
    })
    .passthrough(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/posts' }),
  schema: z
    .object({
      title: z.string().optional().catch(undefined),
      date: z.coerce.date().optional().catch(undefined),
      category: z.string().optional().catch(undefined),
      excerpt: z.string().optional().catch(undefined),
      cover: z.string().optional().catch(undefined),
      ...relaunchFelder,
    })
    .passthrough(),
});

const wissensfragen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/wissensfragen' }),
  schema: z
    .object({
      title: z.string().optional().catch(undefined),
      welten: z.array(z.string()).optional().catch([]),
      lead: z.string().optional().catch(undefined),
      kurzlesezeit: z.number().optional().catch(undefined),
      vertiefzeit: z.number().optional().catch(undefined),
      bloecke: z.array(baustein).optional().catch([]),
      quellen: z.array(quelle).optional().catch([]),
      seo_title: z.string().optional().catch(undefined),
      seo_description: z.string().optional().catch(undefined),
      ...relaunchFelder,
    })
    .passthrough(),
});

const bereiche = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/bereiche' }),
  schema: z
    .object({
      title: z.string().optional().catch(undefined),
      beschreibung: z.string().optional().catch(undefined),
      reihenfolge: z.number().optional().catch(undefined),
      ...relaunchFelder,
    })
    .passthrough(),
});

export const collections = { themen, fachgebiete, posts, wissensfragen, bereiche };
