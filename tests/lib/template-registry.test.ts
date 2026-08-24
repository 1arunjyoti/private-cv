import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '@/lib/constants';
import { TEMPLATE_THEMES } from '@/lib/theme-system';
import { FACTORY_TEMPLATES } from '@/components/templates/FactoryTemplates';

/**
 * Adding a template requires registering it in three places (see
 * docs/TEMPLATE_GUIDE.md): TEMPLATE_THEMES keys, FACTORY_TEMPLATES config ids,
 * and the TemplateType union + TEMPLATES array in lib/constants.ts.
 * These tests catch partial registrations that would otherwise surface as
 * runtime "template not found" bugs only visible in the UI.
 */
describe('template registry consistency', () => {
  const templateTypeIds = new Set<string>(TEMPLATES.map((t) => t.id));
  const themeKeys = new Set(Object.keys(TEMPLATE_THEMES));
  const factoryIds = new Set(Object.keys(FACTORY_TEMPLATES));

  it('registers every TEMPLATES entry in TEMPLATE_THEMES', () => {
    const missing = [...templateTypeIds].filter((id) => !themeKeys.has(id));
    expect(missing).toEqual([]);
  });

  it('registers every TEMPLATES entry in FACTORY_TEMPLATES', () => {
    const missing = [...templateTypeIds].filter((id) => !factoryIds.has(id));
    expect(missing).toEqual([]);
  });

  it('has a TEMPLATES entry for every theme key', () => {
    const orphaned = [...themeKeys].filter((id) => !templateTypeIds.has(id));
    expect(orphaned).toEqual([]);
  });

  it('has a TEMPLATES entry for every factory template id', () => {
    const orphaned = [...factoryIds].filter((id) => !templateTypeIds.has(id));
    expect(orphaned).toEqual([]);
  });

  it('keeps template ids unique in the TEMPLATES array', () => {
    expect(templateTypeIds.size).toBe(TEMPLATES.length);
  });

  it('gives every factory config a non-empty name matching its id key', () => {
    for (const [id, factory] of Object.entries(FACTORY_TEMPLATES)) {
      expect(factory.config.id).toBe(id);
      expect(factory.config.name.trim().length).toBeGreaterThan(0);
    }
  });
});
