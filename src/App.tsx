import { useState } from 'react';
import { ALL_NAV_ITEMS, IMPLEMENTED_SECTIONS, Sidebar } from './components/Sidebar';
import { Actividades } from './components/screens/Actividades';
import { Calendario } from './components/screens/Calendario';
import { Clientes } from './components/screens/Clientes';
import { Configuracion } from './components/screens/Configuracion';
import { Placeholder } from './components/screens/Placeholder';
import { Proyectos } from './components/screens/Proyectos';
import { RegistroHoy } from './components/screens/RegistroHoy';
import { Reglas } from './components/screens/Reglas';
import { Tarifas } from './components/screens/Tarifas';
import { TiempoResumen } from './components/screens/TiempoResumen';
import { useAppData } from './hooks/useAppData';

export default function App() {
  const [section, setSection] = useState('registro');
  const [tiempoExpanded, setTiempoExpanded] = useState(true);
  const data = useAppData();

  if (data.loading) {
    return (
      <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9A9D93', fontSize: '13px' }}>
        Cargando…
      </div>
    );
  }

  const renderSection = () => {
    switch (section) {
      case 'registro':
        return <RegistroHoy data={data} />;
      case 'tiempo-resumen':
        return <TiempoResumen data={data} />;
      case 'actividades':
        return <Actividades data={data} />;
      case 'proyectos':
        return <Proyectos data={data} />;
      case 'reglas':
        return <Reglas data={data} />;
      case 'tarifas-1':
        return <Tarifas data={data} />;
      case 'clientes':
        return <Clientes data={data} />;
      case 'calendario':
        return <Calendario data={data} />;
      case 'configuracion':
        return <Configuracion data={data} />;
      default: {
        if (IMPLEMENTED_SECTIONS.includes(section)) return null;
        const label = ALL_NAV_ITEMS.find((i) => i.id === section)?.label ?? section;
        return <Placeholder label={label} />;
      }
    }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', background: '#FFFFFF', color: '#20231F' }}>
      <Sidebar
        section={section}
        onSelect={setSection}
        tiempoExpanded={tiempoExpanded}
        onToggleTiempo={() => setTiempoExpanded((v) => !v)}
      />
      <div style={{ flex: 1, padding: '22px 32px', minWidth: 0, overflowY: 'auto' }}>{renderSection()}</div>
    </div>
  );
}
