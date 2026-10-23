import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

const SINGLETONS = new Set(['siteSettings']);

export default defineConfig({
  name: 'aroma-langit',
  title: 'Aroma Langit',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'eo2zthve',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Konten')
          .items([
            S.listItem()
              .title('Layanan & harga')
              .child(S.documentTypeList('service').title('Layanan & harga').defaultOrdering([{ field: 'order', direction: 'asc' }])),
            S.listItem()
              .title('Preset kalkulator')
              .child(S.documentTypeList('calculatorPreset').title('Preset kalkulator').defaultOrdering([{ field: 'order', direction: 'asc' }])),
            S.divider(),
            S.listItem()
              .title('Pengaturan situs')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Pengaturan situs')),
          ]),
    }),
    visionTool({ defaultApiVersion: '2025-01-01' }),
  ],
  schema: {
    types: schemaTypes,
    // The settings document is a singleton: hide it from "create new".
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.has(schemaType)),
  },
  document: {
    actions: (input, context) =>
      SINGLETONS.has(context.schemaType)
        ? input.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
});
