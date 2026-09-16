import { Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppData } from '../../hooks/useAppData';
import { groupEntriesByApp, sumSecondsByProject } from '../../lib/aggregate';
import { formatHM } from '../../lib/time';

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>{label}</div>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
          border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#3A3D36',
        }}
      >
        {value}
        <ChevronDown size={12} color="#9A9D93" />
      </div>
    </div>
  );
}

export function TiempoResumen({ data }: { data: AppData }) {
  const { projects, todayEntries } = data;
  const [groupBy, setGroupBy] = useState<'proyecto' | 'app'>('proyecto');

  const totalsByProject = useMemo(() => sumSecondsByProject(todayEntries), [todayEntries]);
  const totalGeneral = useMemo(() => [...totalsByProject.values()].reduce((s, v) => s + v, 0), [totalsByProject]);
  const appBreakdown = useMemo(() => groupEntriesByApp(todayEntries), [todayEntries]);

  return (
    <>
      <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 14px' }}>Tiempo — Resumen</h1>

      <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
        {([{ id: 'proyecto', label: 'Por proyecto' }, { id: 'app', label: 'Por app' }] as const).map((t, i) => {
          const active = groupBy === t.id;
          return (
            <button
              key={t.id}
              className="pill-btn"
              onClick={() => setGroupBy(t.id)}
              style={{
                border: 'none', padding: '7px 16px', fontSize: '12.5px', fontWeight: 500,
                background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {active && <Check size={12} strokeWidth={2.5} />}
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
        <FilterField label="RANGO DE FECHAS" value="Hoy" />
        <FilterField label="PROYECTOS" value="Todos los proyectos" />
        <FilterField label="ESTADO" value="Activos" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>BUSCAR</div>
          <input
            placeholder="Buscar app o palabra clave"
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: '11px', color: '#9A9D93', fontWeight: 600, padding: '0 8px 8px', borderBottom: '1px solid #EBEBE6' }}>
        <span style={{ flex: 1 }}>NOMBRE</span>
        <span style={{ width: '100px', textAlign: 'right' }}>HORAS</span>
      </div>

      {groupBy === 'proyecto'
        ? projects.map((p) => {
            const projectSeconds = totalsByProject.get(p.id) ?? 0;
            const children = groupEntriesByApp(todayEntries.filter((e) => e.projectId === p.id));
            return (
              <div key={p.id}>
                <div className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: p.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '13.5px' }}>{p.name}</span>
                  <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '12.5px' }}>
                    {projectSeconds > 0 ? formatHM(projectSeconds) : '–'}
                  </span>
                </div>
                {children.map((c) => (
                  <div key={c.name} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 8px 8px 28px', borderBottom: '1px solid #F5F5F1' }}>
                    <span className="mono" style={{ flex: 1, fontSize: '12.5px', color: '#6B6E64' }}>{c.name}</span>
                    <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: '#9A9D93' }}>
                      {c.seconds > 0 ? formatHM(c.seconds) : '–'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })
        : appBreakdown.map((a) => (
            <div key={a.name} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
              <span style={{ flex: 1, fontSize: '13.5px' }}>{a.name}</span>
              <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '12.5px' }}>{formatHM(a.seconds)}</span>
            </div>
          ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '12px 8px 0' }}>
        <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700 }}>Total</span>
        <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '13.5px', fontWeight: 700 }}>{formatHM(totalGeneral)}</span>
      </div>
    </>
  );
}
