import { describe, expect, it } from 'vitest';
import { groupEntriesByApp, sumSecondsByProject } from './aggregate';
import type { TimeEntry } from './types';

const entries: TimeEntry[] = [
  { id: 'e1', projectId: 'proj_1', app: 'Figma', date: '2026-08-13', start: '09:00', end: '10:00' },
  { id: 'e2', projectId: 'proj_1', app: 'Figma', date: '2026-08-13', start: '10:00', end: '10:30' },
  { id: 'e3', projectId: 'proj_1', app: 'VS Code', date: '2026-08-13', start: '11:00', end: '11:15' },
  { id: 'e4', projectId: 'proj_2', app: 'Slack', date: '2026-08-13', start: '12:00', end: '12:10' },
];

describe('sumSecondsByProject', () => {
  it('suma segundos por proyecto', () => {
    const totals = sumSecondsByProject(entries);
    expect(totals.get('proj_1')).toBe(105 * 60);
    expect(totals.get('proj_2')).toBe(10 * 60);
  });
});

describe('groupEntriesByApp', () => {
  it('agrupa por app y ordena de mayor a menor', () => {
    const grouped = groupEntriesByApp(entries.filter((e) => e.projectId === 'proj_1'));
    expect(grouped).toEqual([
      { name: 'Figma', seconds: 90 * 60 },
      { name: 'VS Code', seconds: 15 * 60 },
    ]);
  });

  it('usa "Sin descripción" cuando el campo app está vacío', () => {
    const grouped = groupEntriesByApp([{ id: 'e', projectId: 'p', app: '  ', date: 'd', start: '09:00', end: '09:10' }]);
    expect(grouped[0].name).toBe('Sin descripción');
  });
});
