import {
  BadgeCheck,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Folder,
  Gauge,
  MapPin,
  Monitor,
  PanelLeft,
  Rows3,
  Search,
  Settings,
  Tag,
  Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  expandable?: boolean;
}

export const TIEMPO_SUBGROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Tiempo',
    items: [
      { id: 'tiempo-resumen', label: 'Resumen', icon: Gauge },
      { id: 'tiempo-detallado', label: 'Detallado', icon: Search },
      { id: 'tiempo-por-dias', label: 'Por días', icon: Calendar },
    ],
  },
  {
    label: 'Persona',
    items: [
      { id: 'tiempo-por-tareas', label: 'Por tareas', icon: Users },
      { id: 'tiempo-por-dias-tareas', label: 'Por días y tareas', icon: Users },
      { id: 'tiempo-por-dias-persona', label: 'Por días', icon: Users },
      { id: 'tiempo-por-proyectos', label: 'Por proyectos', icon: Users },
    ],
  },
  {
    label: 'Otro',
    items: [{ id: 'tiempo-localizacion', label: 'Informe de localización', icon: MapPin }],
  },
];

export const NAV: { group: string; items: NavItem[] }[] = [
  { group: 'Seguimiento', items: [{ id: 'registro', label: 'Registro de hoy', icon: Clock }] },
  {
    group: 'Informes',
    items: [
      { id: 'finanzas', label: 'Finanzas', icon: DollarSign, expandable: true },
      { id: 'actividades', label: 'Actividades de apps', icon: Monitor, expandable: true },
      { id: 'informes-personalizados', label: 'Informes personalizados', icon: Rows3 },
    ],
  },
  {
    group: 'Gestionar',
    items: [
      { id: 'proyectos', label: 'Proyectos', icon: Folder },
      { id: 'reglas', label: 'Reglas', icon: Tag },
      { id: 'tarifas-1', label: 'Tarifas de facturación', icon: DollarSign },
      { id: 'clientes', label: 'Clientes', icon: Users },
    ],
  },
  {
    group: 'Asistencia',
    items: [
      { id: 'calendario', label: 'Calendario', icon: Calendar },
      { id: 'horas-trabajo', label: 'Horas de trabajo', icon: BadgeCheck },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = [
  ...NAV.flatMap((g) => g.items),
  ...TIEMPO_SUBGROUPS.flatMap((g) => g.items),
  { id: 'configuracion', label: 'Configuración' },
];

export const IMPLEMENTED_SECTIONS = [
  'registro',
  'tiempo-resumen',
  'actividades',
  'proyectos',
  'reglas',
  'tarifas-1',
  'clientes',
  'calendario',
  'configuracion',
];

interface SidebarProps {
  section: string;
  onSelect: (section: string) => void;
  tiempoExpanded: boolean;
  onToggleTiempo: () => void;
}

export function Sidebar({ section, onSelect, tiempoExpanded, onToggleTiempo }: SidebarProps) {
  return (
    <div
      style={{
        width: '236px',
        flexShrink: 0,
        borderRight: '1px solid #EBEBE6',
        padding: '18px 12px',
        background: '#FBFBF9',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#7FB35C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={15} color="#FFFFFF" strokeWidth={2.3} />
          </div>
          <span className="qs" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Enfoque
          </span>
        </div>
        <div className="icon-btn" style={{ padding: '5px', borderRadius: '6px', display: 'flex' }}>
          <PanelLeft size={15} color="#9A9D93" />
        </div>
      </div>

      {NAV.map((group) => (
        <div key={group.group} style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              color: '#A3A79B',
              fontWeight: 500,
              padding: '0 8px 6px',
              letterSpacing: '0.02em',
            }}
          >
            {group.group.toUpperCase()}
          </div>

          {group.group === 'Informes' && (
            <div style={{ marginBottom: '2px' }}>
              <div
                className="nav-item"
                onClick={onToggleTiempo}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  background: section.startsWith('tiempo-') ? '#EDEEE8' : 'transparent',
                }}
              >
                <Gauge size={15} color="#3A3D36" strokeWidth={2} />
                <span
                  style={{
                    fontSize: '13.5px',
                    fontWeight: section.startsWith('tiempo-') ? 600 : 400,
                    color: '#20231F',
                    flex: 1,
                  }}
                >
                  Tiempo
                </span>
                {tiempoExpanded ? (
                  <ChevronDown size={13} color="#9A9D93" />
                ) : (
                  <ChevronRight size={13} color="#9A9D93" />
                )}
              </div>

              {tiempoExpanded && (
                <div style={{ paddingLeft: '10px', marginBottom: '4px' }}>
                  {TIEMPO_SUBGROUPS.map((sub) => (
                    <div key={sub.label} style={{ marginBottom: '6px' }}>
                      <div
                        style={{
                          fontSize: '10.5px',
                          color: '#B3B6AB',
                          fontWeight: 500,
                          padding: '4px 10px 2px',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {sub.label}
                      </div>
                      {sub.items.map((item) => {
                        const Icon = item.icon!;
                        const active = section === item.id;
                        return (
                          <div
                            key={item.id}
                            className="nav-item"
                            onClick={() => onSelect(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '9px',
                              padding: '6px 10px',
                              borderRadius: '7px',
                              marginBottom: '1px',
                              background: active ? '#EDEEE8' : 'transparent',
                            }}
                          >
                            <Icon size={13} color="#3A3D36" strokeWidth={2} />
                            <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: '#20231F' }}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {group.items.map((item) => {
            const Icon = item.icon!;
            const active = section === item.id;
            return (
              <div
                key={item.id}
                className="nav-item"
                onClick={() => onSelect(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  background: active ? '#EDEEE8' : 'transparent',
                }}
              >
                <Icon size={15} color="#3A3D36" strokeWidth={2} />
                <span style={{ fontSize: '13.5px', fontWeight: active ? 600 : 400, color: '#20231F', flex: 1 }}>
                  {item.label}
                </span>
                {item.expandable && <ChevronRight size={13} color="#B3B6AB" />}
              </div>
            );
          })}
        </div>
      ))}

      <div style={{ marginTop: '28px' }}>
        <div style={{ fontSize: '11px', color: '#A3A79B', fontWeight: 500, padding: '0 8px 6px', letterSpacing: '0.02em' }}>
          EQUIPO
        </div>
        <div
          className="nav-item"
          onClick={() => onSelect('configuracion')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '8px',
            background: section === 'configuracion' ? '#EDEEE8' : 'transparent',
          }}
        >
          <Settings size={15} color="#3A3D36" strokeWidth={2} />
          <span style={{ fontSize: '13.5px', fontWeight: section === 'configuracion' ? 600 : 400, color: '#20231F' }}>
            Configuración
          </span>
        </div>
      </div>
    </div>
  );
}
