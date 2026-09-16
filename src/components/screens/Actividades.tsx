import { Monitor } from 'lucide-react';
import { useMemo } from 'react';
import type { AppData } from '../../hooks/useAppData';
import { groupEntriesByApp } from '../../lib/aggregate';
import { formatHM } from '../../lib/time';

export function Actividades({ data }: { data: AppData }) {
  const { todayEntries } = data;
  const apps = useMemo(() => groupEntriesByApp(todayEntries), [todayEntries]);

  return (
    <>
      <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 20px' }}>Actividades de apps</h1>
      <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '14px' }}>
        Tiempo de hoy agrupado por aplicación, sin importar el proyecto.
      </div>
      {apps.map((a) => (
        <div key={a.name} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderBottom: '1px solid #F1F1EC' }}>
          <Monitor size={14} color="#9A9D93" />
          <span style={{ flex: 1, fontSize: '13.5px' }}>{a.name}</span>
          <span className="mono" style={{ fontSize: '12.5px', color: '#9A9D93' }}>{formatHM(a.seconds)}</span>
        </div>
      ))}
      {apps.length === 0 && (
        <div style={{ padding: '20px 8px', fontSize: '12.5px', color: '#9A9D93' }}>Todavía no hay actividad registrada hoy.</div>
      )}
    </>
  );
}
