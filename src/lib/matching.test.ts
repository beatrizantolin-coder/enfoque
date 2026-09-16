import { describe, expect, it } from 'vitest';
import { keywordMatches, resolveProjectForTitle } from './matching';
import type { Rule } from './types';

describe('keywordMatches', () => {
  it('hace match por substring sin importar mayúsculas', () => {
    expect(keywordMatches('Figma.com/Acme', 'FIGMA.COM/acme — Rediseño')).toBe(true);
  });

  it('no hace match si la keyword no aparece', () => {
    expect(keywordMatches('overleaf.com', 'Visual Studio Code — enfoque')).toBe(false);
  });

  it('ignora keywords vacías', () => {
    expect(keywordMatches('   ', 'cualquier título')).toBe(false);
  });
});

describe('resolveProjectForTitle', () => {
  const rules: Rule[] = [
    { id: 'r1', keyword: 'figma.com/acme', projectId: 'proj_1' },
    { id: 'r2', keyword: 'notion.so/finanzas', projectId: 'proj_2' },
    { id: 'r3', keyword: 'proyecto', projectId: 'proj_3' },
  ];

  it('devuelve null si no hay ninguna coincidencia', () => {
    expect(resolveProjectForTitle('Terminal — zsh', rules)).toBeNull();
  });

  it('devuelve el único proyecto que coincide', () => {
    const result = resolveProjectForTitle('Figma — figma.com/acme', rules);
    expect(result?.projectId).toBe('proj_1');
  });

  it('con conflicto entre proyectos, gana el usado más recientemente', () => {
    // Título que coincide con proj_1 (figma.com/acme) y proj_3 (proyecto)
    const title = 'figma.com/acme — mi proyecto';
    const recency = new Map([
      ['proj_1', 1000],
      ['proj_3', 2000],
    ]);
    const result = resolveProjectForTitle(title, rules, recency);
    expect(result?.projectId).toBe('proj_3');
  });

  it('sin recencia registrada, gana la primera regla en orden estable', () => {
    const title = 'figma.com/acme — mi proyecto';
    const result = resolveProjectForTitle(title, rules);
    expect(result?.projectId).toBe('proj_1');
  });
});
