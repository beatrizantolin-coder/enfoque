import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { groupEntriesByApp } from '../../lib/aggregate';
import * as db from '../../lib/db';
import { entrySeconds, formatHM, lastNDates, todayISO } from '../../lib/time';
import type { Project, Rule, TimeEntry } from '../../lib/types';

export function ProyectoDetalle({ project, rules, onBack }: { project: Project; rules: Rule[]; onBack: () => void }) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    db.listEntriesForProject(project.id).then((rows) => {
      if (!cancelled) {
        setEntries(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  const series = useMemo(() => {
    const days = lastNDates(10);
    const byDate = new Map<string, number>();
    for (const e of entries) byDate.set(e.date, (byDate.get(e.date) ?? 0) + entrySeconds(e));
    return days.map((label) => ({ label, seconds: byDate.get(label) ?? 0 }));
  }, [entries]);

  const totalAllTime = useMemo(() => entries.reduce((s, e) => s + entrySeconds(e), 0), [entries]);
  const startDate = useMemo(() => entries.map((e) => e.date).sort()[0] ?? null, [entries]);
  const lastActivity = useMemo(() => {
    const dates = entries.map((e) => e.date).sort();
    return dates.length ? dates[dates.length - 1] : null;
  }, [entries]);

  const last7 = useMemo(() => {
    const days = new Set(lastNDates(7));
    const relevant = entries.filter((e) => days.has(e.date));
    const total = relevant.reduce((s, e) => s + entrySeconds(e), 0);
    const activeDays = new Set(relevant.map((e) => e.date)).size;
    return { total, activeDays };
  }, [entries]);

  const appBreakdown = useMemo(() => {
    const byApp = groupEntriesByApp(entries);
    const daysByApp = new Map<string, Set<string>>();
    for (const e of entries) {
      const key = e.app.trim() || 'Sin descripción';
      if (!daysByApp.has(key)) daysByApp.set(key, new Set());
      daysByApp.get(key)!.add(e.date);
    }
    return byApp.map((row) => ({ ...row, activeDays: daysByApp.get(row.name)?.size ?? 0 }));
  }, [entries]);

  const maxVal = Math.max(...series.map((s) => s.seconds), 60);
  const chartW = 680;
  const chartH = 200;
  const padL = 46;
  const padB = 34;
  const padT = 10;
  const padR = 10;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;
  const xStep = plotW / (series.length - 1 || 1);
  const points = series.map((s, i) => ({
    x: padL + i * xStep,
    y: padT + plotH - (s.seconds / maxVal) * plotH,
  }));
  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

  return (
    <>
      <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#5A5D55', fontSize: '13px', marginBottom: '14px' }}>
        <ChevronLeft size={14} /> Proyectos
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
        <h1 className="qs" style={{ fontSize: '20px', fontWeight: 700, color: '#5C8A3C', margin: 0 }}>PROYECTO:</h1>
        <span style={{ fontSize: '15px', fontWeight: 600, color: '#20231F' }}>{project.name.toUpperCase()}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>RANGO DE FECHAS</div>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E0', borderRadius: '7px', overflow: 'hidden' }}>
            <span className="icon-btn" style={{ padding: '7px 8px', display: 'flex' }}><ChevronLeft size={13} color="#5A5D55" /></span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', fontSize: '12.5px', borderLeft: '1px solid #E5E5E0', borderRight: '1px solid #E5E5E0' }}>
              <Calendar size={12} color="#5A5D55" /> Últimos 10 días
            </span>
            <span className="icon-btn" style={{ padding: '7px 8px', display: 'flex' }}><ChevronRight size={13} color="#5A5D55" /></span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>DESDE</div>
          <div style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#9A9D93' }}>{series[0]?.label ?? '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>HASTA</div>
          <div style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#9A9D93' }}>{todayISO()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: '11px', color: '#9A9D93', fontWeight: 600, padding: '0 8px 8px', borderBottom: '1px solid #EBEBE6' }}>
        <span style={{ flex: 1 }}>REGLA / APP</span>
        <span style={{ width: '90px', textAlign: 'right' }}>HORAS</span>
        <span style={{ width: '90px', textAlign: 'right' }}>DÍAS ACTIVOS</span>
      </div>
      {!loading && rules.length === 0 && appBreakdown.length === 0 && (
        <div style={{ padding: '14px 8px', fontSize: '12.5px', color: '#9A9D93' }}>Este proyecto todavía no tiene reglas asociadas.</div>
      )}
      {appBreakdown.map((row) => (
        <div key={row.name} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
          <span className="mono" style={{ flex: 1, fontSize: '12.5px' }}>{row.name}</span>
          <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '12.5px' }}>{row.seconds > 0 ? formatHM(row.seconds) : '–'}</span>
          <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '12.5px', color: '#9A9D93' }}>{row.activeDays}d</span>
        </div>
      ))}
      {appBreakdown.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px' }}>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>Total</span>
          <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '13px', fontWeight: 700 }}>{formatHM(totalAllTime)}</span>
          <span style={{ width: '90px' }} />
        </div>
      )}

      <div style={{ fontSize: '13px', fontWeight: 500, color: '#20231F', margin: '24px 0 10px' }}>Horas dedicadas por día</div>
      <div style={{ border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 8px 6px' }}>
        <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH}>
          {gridSteps.map((g) => {
            const y = padT + plotH - g * plotH;
            return (
              <g key={g}>
                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#EEEEE8" strokeWidth="1" strokeDasharray="3 3" />
                <text x={padL - 8} y={y + 4} fontSize="10" fill="#9A9D93" textAnchor="end">{formatHM(g * maxVal)}</text>
              </g>
            );
          })}
          <path d={pathD} fill="none" stroke="#7FB35C" strokeWidth="2.5" />
          {points.map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#FFFFFF" stroke="#7FB35C" strokeWidth="2.5" />
          ))}
          {series.map((s, i) => (
            <text key={s.label} x={points[i].x} y={chartH - 8} fontSize="9.5" fill="#9A9D93" textAnchor="end" transform={`rotate(-35 ${points[i].x} ${chartH - 8})`}>
              {s.label.slice(5)}
            </text>
          ))}
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '22px' }}>
        {[
          { label: 'FECHA DE INICIO', value: fmtDate(startDate), sub: null },
          { label: 'ÚLTIMA ACTIVIDAD', value: fmtDate(lastActivity), sub: null },
          { label: 'TIEMPO TOTAL', value: formatHM(totalAllTime), sub: null },
          { label: 'MEDIA DIARIA (7D)', value: formatHM(Math.round(last7.total / 7)), sub: `${last7.activeDays} días activos` },
        ].map((card) => (
          <div key={card.label} style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#9A9D93', letterSpacing: '0.03em', marginBottom: '8px' }}>{card.label}</div>
            <div className="qs" style={{ fontSize: '18px', fontWeight: 700, color: '#5C8A3C' }}>{card.value}</div>
            {card.sub && <div style={{ fontSize: '11.5px', color: '#9A9D93', marginTop: '4px' }}>{card.sub}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
