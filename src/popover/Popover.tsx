import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { exit } from '@tauri-apps/plugin-process';
import { Check, ChevronDown, Power, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { groupEntriesByApp, sumSecondsByProject } from '../lib/aggregate';
import * as db from '../lib/db';
import { entrySeconds, formatHM, todayISO } from '../lib/time';
import type { Project, TimeEntry, TrackingMode } from '../lib/types';

const MODE_KEY = 'tracking_mode';

export function Popover() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [groupBy, setGroupBy] = useState<'proyectos' | 'apps'>('proyectos');
  const [mode, setModeState] = useState<TrackingMode>('automatico');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const [projectRows, entryRows, storedMode] = await Promise.all([
        db.listProjects(),
        db.listEntriesForDate(todayISO()),
        db.getSetting(MODE_KEY),
      ]);
      setProjects(projectRows);
      setEntries(entryRows);
      if (storedMode === 'automatico' || storedMode === 'manual') setModeState(storedMode);
    })();
  }, []);

  const setMode = async (value: TrackingMode) => {
    setModeState(value);
    await db.setSetting(MODE_KEY, value);
    setModeMenuOpen(false);
  };

  const totalToday = useMemo(() => entries.reduce((s, e) => s + entrySeconds(e), 0), [entries]);

  interface BarRow {
    key: string;
    name: string;
    color: string;
    seconds: number;
  }

  const projectRows: BarRow[] = useMemo(() => {
    const totals = sumSecondsByProject(entries);
    return projects
      .map((p) => ({ key: p.id, name: p.name, color: p.color, seconds: totals.get(p.id) ?? 0 }))
      .filter((p) => p.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);
  }, [projects, entries]);

  const appRows: BarRow[] = useMemo(
    () => groupEntriesByApp(entries).map((a, i) => ({ key: a.name, name: a.name, seconds: a.seconds, color: PALETTE[i % PALETTE.length] })),
    [entries],
  );

  const rows = groupBy === 'proyectos' ? projectRows : appRows;

  const openApp = async () => {
    const main = await WebviewWindow.getByLabel('main');
    await main?.show();
    await main?.setFocus();
  };

  const quit = async () => {
    await exit(0);
  };

  return (
    <div
      style={{
        width: '320px',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderRadius: '14px',
        border: '1px solid rgba(229,229,224,0.8)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        padding: '16px',
        fontFamily: "'Inter', -apple-system, sans-serif",
        color: '#20231F',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span className="qs" style={{ fontSize: '15px', fontWeight: 600 }}>Hoy</span>
        <span className="mono" style={{ fontSize: '15px', fontWeight: 600, color: '#5C8A3C' }}>{formatHM(totalToday)}</span>
      </div>

      <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '7px', overflow: 'hidden', marginBottom: '10px' }}>
        {([{ id: 'proyectos', label: 'Proyectos' }, { id: 'apps', label: 'Aplicaciones' }] as const).map((t, i) => {
          const active = groupBy === t.id;
          return (
            <button
              key={t.id}
              className="pill-btn"
              onClick={() => setGroupBy(t.id)}
              style={{
                border: 'none', padding: '5px 10px', fontSize: '11.5px', fontWeight: 500,
                background: active ? '#F1F6EC' : 'transparent', color: active ? '#5C8A3C' : '#5A5D55',
                borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {rows.length > 0 && (
        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
          {rows.map((r) => (
            <span key={r.key} style={{ flex: r.seconds, background: r.color }} />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '10px', maxHeight: '160px', overflowY: 'auto' }}>
        {rows.map((r) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 2px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: r.color, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '12.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
            <span className="mono" style={{ fontSize: '12px', color: '#5A5D55' }}>{formatHM(r.seconds)}</span>
          </div>
        ))}
        {rows.length === 0 && <div style={{ fontSize: '12px', color: '#9A9D93', padding: '4px 2px' }}>Sin actividad todavía hoy.</div>}
      </div>

      <div style={{ borderTop: '1px solid rgba(229,229,224,0.8)', margin: '4px 0 6px' }} />

      <div style={{ position: 'relative' }}>
        <div
          className="nav-item"
          onClick={() => setModeMenuOpen((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 4px', borderRadius: '7px' }}
        >
          <Settings size={13} color="#5A5D55" />
          <span style={{ flex: 1, fontSize: '12.5px' }}>
            Configuración: <strong>{mode === 'automatico' ? 'Automático' : 'Manual'}</strong>
          </span>
          <ChevronDown size={12} color="#9A9D93" />
        </div>
        {modeMenuOpen && (
          <div style={{ paddingLeft: '22px', marginBottom: '4px' }}>
            {(['automatico', 'manual'] as const).map((m) => (
              <div
                key={m}
                className="nav-item"
                onClick={() => setMode(m)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 6px', borderRadius: '6px', fontSize: '12px' }}
              >
                {mode === m ? <Check size={11} color="#5C8A3C" strokeWidth={2.5} /> : <span style={{ width: '11px' }} />}
                {m === 'automatico' ? 'Automático' : 'Manual'}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav-item" onClick={openApp} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 4px', borderRadius: '7px' }}>
        <span style={{ width: '13px' }} />
        <span style={{ fontSize: '12.5px' }}>Abrir aplicación</span>
      </div>

      <div className="nav-item" onClick={quit} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 4px', borderRadius: '7px' }}>
        <Power size={13} color="#E2725B" />
        <span style={{ fontSize: '12.5px', color: '#E2725B' }}>Salir</span>
      </div>
    </div>
  );
}

const PALETTE = ['#E2725B', '#E8A33D', '#7FB35C', '#5B8DBF', '#9080C4', '#9A9D93', '#D97FA6', '#4FAFA8', '#D9B23D'];
