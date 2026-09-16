import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { AppData } from '../../hooks/useAppData';
import * as db from '../../lib/db';
import { todayISO } from '../../lib/time';
import type { TimeEntry } from '../../lib/types';

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function Calendario({ data }: { data: AppData }) {
  const { projects } = data;
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  useEffect(() => {
    const first = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const last = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    db.listEntriesBetween(first, last).then(setEntries);
  }, [year, month]);

  const projectById = (id: string) => projects.find((p) => p.id === id);
  const today = todayISO();
  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const workedByDay = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, new Set());
      map.get(e.date)!.add(e.projectId);
    }
    return map;
  }, [entries]);

  const cells = useMemo(() => {
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lunes
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  return (
    <>
      <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 18px' }}>Calendario</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
        <button className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
          <ChevronLeft size={14} color="#5A5D55" />
        </button>
        <span style={{ fontSize: '14.5px', fontWeight: 600, textTransform: 'capitalize' }}>{monthLabel}</span>
        <button className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none' }}>
          <ChevronRight size={14} color="#5A5D55" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#EBEBE6', border: '1px solid #EBEBE6', borderRadius: '10px', overflow: 'hidden' }}>
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} style={{ background: '#FAFAF8', padding: '8px 0', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#9A9D93' }}>{w}</div>
        ))}
        {cells.map((d, i) => {
          const dateISO = d ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
          const worked = dateISO ? [...(workedByDay.get(dateISO) ?? [])] : [];
          const isToday = dateISO === today;
          return (
            <div
              key={i}
              style={{
                background: '#FFFFFF', minHeight: '84px', padding: '6px 8px',
                display: 'flex', flexDirection: 'column', gap: '6px',
                border: isToday ? '2px solid #7FB35C' : 'none',
                opacity: d ? 1 : 0.4,
              }}
            >
              {d && (
                <>
                  <span style={{ fontSize: '12px', fontWeight: isToday ? 700 : 500, color: isToday ? '#5C8A3C' : '#20231F' }}>{d}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {worked.map((pid) => {
                      const p = projectById(pid);
                      if (!p) return null;
                      return <span key={pid} title={p.name} style={{ width: '7px', height: '7px', borderRadius: '2px', background: p.color }} />;
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '18px' }}>
        {projects.map((p) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: '#5A5D55' }}>{p.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
