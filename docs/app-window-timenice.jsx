import React, { useState } from 'react';
import {
  Clock, Gauge, Monitor, Folder, Tag, Settings, PanelLeft,
  ChevronLeft, ChevronRight, ChevronDown, MoreVertical, Play,
  Plus, Trash2, X, Check, ShieldCheck, Copy, Pencil,
  DollarSign, Rows3, Users, Calendar, BadgeCheck,
  LineChart, Search, MapPin, PlusCircle, Info,
} from 'lucide-react';

const TAG_COLORS = [
  { name: 'rojo', hex: '#E2725B' },
  { name: 'naranja', hex: '#E8A33D' },
  { name: 'verde', hex: '#7FB35C' },
  { name: 'azul', hex: '#5B8DBF' },
  { name: 'morado', hex: '#9080C4' },
  { name: 'gris', hex: '#9A9D93' },
  { name: 'rosa', hex: '#D97FA6' },
  { name: 'cian', hex: '#4FAFA8' },
  { name: 'amarillo', hex: '#D9B23D' },
];

const INITIAL_PROJECTS = [
  { id: 'proj_1', name: 'Cliente Acme — rediseño', color: '#5B8DBF', today: 2 * 3600 + 50 * 60, total: 34 * 3600 + 10 * 60, owner: 'Tú', role: 'Project Manager', description: 'Rediseño de la web y el dossier de marca.', phases: ['Fase 1', 'Fase 2'] },
  { id: 'proj_2', name: 'App finanzas personal', color: '#7FB35C', today: 1 * 3600 + 20 * 60, total: 18 * 3600 + 40 * 60, owner: 'Tú', role: 'Project Manager', description: '', phases: ['Fase 1'] },
  { id: 'proj_3', name: 'Tesis / investigación', color: '#9080C4', today: 35 * 60, total: 9 * 3600 + 5 * 60, owner: 'Tú', role: 'Project Manager', description: '', phases: ['Fase 1'] },
  { id: 'proj_4', name: 'Sin clasificar', color: '#9A9D93', today: 15 * 60, total: 4 * 3600, owner: 'Tú', role: 'Project Manager', description: '', phases: ['Fase 1'] },
];

const APPS_TODAY = [
  { id: 'app_1', name: 'Figma', color: '#E8A33D', seconds: 2 * 3600 + 5 * 60 },
  { id: 'app_2', name: 'Visual Studio Code', color: '#5B8DBF', seconds: 1 * 3600 },
  { id: 'app_3', name: 'Overleaf', color: '#9080C4', seconds: 35 * 60 },
  { id: 'app_4', name: 'Google Chrome', color: '#E2725B', seconds: 45 * 60 },
  { id: 'app_5', name: 'Slack', color: '#7FB35C', seconds: 15 * 60 },
];

const INITIAL_ENTRIES = [
  { id: 'e1', projectId: 'proj_1', app: 'Figma — acme-redesign', start: '09:15', end: '12:05' },
  { id: 'e2', projectId: 'proj_2', app: 'VS Code — finance-app', start: '12:30', end: '13:50' },
  { id: 'e3', projectId: 'proj_3', app: 'overleaf.com', start: '14:00', end: '14:35' },
  { id: 'e4', projectId: 'proj_4', app: 'Chrome — varias pestañas', start: '14:40', end: '14:55' },
];

const INITIAL_RULES = [
  { id: 'r1', keyword: 'figma.com/acme', projectId: 'proj_1' },
  { id: 'r2', keyword: 'acme-redesign', projectId: 'proj_1' },
  { id: 'r3', keyword: 'notion.so/finanzas', projectId: 'proj_2' },
  { id: 'r4', keyword: 'vscode — finance-app', projectId: 'proj_2' },
  { id: 'r5', keyword: 'overleaf.com', projectId: 'proj_3' },
];

function formatHM(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}

function timeToMinutes(t) {
  if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function entrySeconds(entry) {
  const startMin = timeToMinutes(entry.start);
  const endMin = timeToMinutes(entry.end);
  if (startMin === null || endMin === null || endMin <= startMin) return 0;
  return (endMin - startMin) * 60;
}

const CHART_RATIOS = [0, 0, 0.03, 0.07, 0.14, 0.27, 0.42, 0.58, 0.8, 1];
function generateDailySeries(baseSeconds) {
  const today = new Date(2026, 7, 13); // 13 agosto 2026
  return CHART_RATIOS.map((ratio, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (CHART_RATIOS.length - 1 - i));
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { label, seconds: Math.round(baseSeconds * ratio) };
  });
}

const TIEMPO_SUBGROUPS = [
  { label: 'Tiempo', items: [
    { id: 'tiempo-resumen', label: 'Resumen', icon: LineChart },
    { id: 'tiempo-detallado', label: 'Detallado', icon: Search },
    { id: 'tiempo-por-dias', label: 'Por días', icon: Calendar },
  ] },
  { label: 'Persona', items: [
    { id: 'tiempo-por-tareas', label: 'Por tareas', icon: Users },
    { id: 'tiempo-por-dias-tareas', label: 'Por días y tareas', icon: Users },
    { id: 'tiempo-por-dias-persona', label: 'Por días', icon: Users },
    { id: 'tiempo-por-proyectos', label: 'Por proyectos', icon: Users },
  ] },
  { label: 'Otro', items: [
    { id: 'tiempo-localizacion', label: 'Informe de localización', icon: MapPin },
  ] },
];

const NAV = [
  { group: 'Seguimiento', items: [{ id: 'registro', label: 'Registro de hoy', icon: Clock }] },
  { group: 'Informes', items: [
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign, expandable: true },
    { id: 'actividades', label: 'Actividades de apps', icon: Monitor, expandable: true },
    { id: 'informes-personalizados', label: 'Informes personalizados', icon: Rows3 },
  ] },
  { group: 'Gestionar', items: [
    { id: 'proyectos', label: 'Proyectos', icon: Folder },
    { id: 'reglas', label: 'Reglas', icon: Tag },
    { id: 'tarifas-1', label: 'Tarifas de facturación', icon: DollarSign },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ] },
  { group: 'Asistencia', items: [
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'horas-trabajo', label: 'Horas de trabajo', icon: BadgeCheck },
  ] },
];

const ALL_NAV_ITEMS = [
  ...NAV.flatMap(g => g.items),
  ...TIEMPO_SUBGROUPS.flatMap(g => g.items),
  { id: 'configuracion', label: 'Configuración' },
];

const IMPLEMENTED_SECTIONS = ['registro', 'tiempo-resumen', 'actividades', 'proyectos', 'reglas', 'tarifas-1', 'clientes', 'calendario', 'configuracion'];

const CAL_YEAR = 2026, CAL_MONTH = 7; // Agosto 2026 (0-indexado)
const DAILY_WORK = {
  1: ['proj_1'], 2: ['proj_1', 'proj_2'], 3: ['proj_1'], 4: ['proj_2'],
  5: ['proj_1', 'proj_3'], 6: [], 7: ['proj_2'], 8: ['proj_1'],
  9: ['proj_3'], 10: ['proj_1', 'proj_2'], 11: [], 12: ['proj_1'],
  13: ['proj_1', 'proj_2', 'proj_3', 'proj_4'],
};
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const TIER_OPTIONS = [
  { id: 'gran', label: 'Gran Cliente', pct: 30 },
  { id: 'medio', label: 'Cliente medio', pct: 15 },
  { id: 'pequeno', label: 'Cliente pequeño', pct: 0 },
];

const INITIAL_RATES = [
  { id: 'rate_1', name: 'Hora standard', value: 60, type: 'ingresos', role: 'Project Manager' },
];

const ROLE_OPTIONS = ['Project Manager', 'Diseñador', 'Desarrollador', 'Colaborador'];

const INITIAL_CLIENTS = [
  { id: 'cli_1', name: 'Acme Corp', color: '#5B8DBF', contact: 'Laura Gómez', linkedProjects: ['proj_1'], nif: '', tipo: 'gran', porcentaje: 30, owner: 'Laura Gómez', calle: '', cp: '', ciudad: '' },
  { id: 'cli_2', name: 'Bright Studio', color: '#7FB35C', contact: 'Marcos Ruiz', linkedProjects: [], nif: '', tipo: 'medio', porcentaje: 15, owner: 'Marcos Ruiz', calle: '', cp: '', ciudad: '' },
  { id: 'cli_3', name: 'Universidad Complutense', color: '#9080C4', contact: '—', linkedProjects: ['proj_3'], nif: '', tipo: 'pequeno', porcentaje: 0, owner: '', calle: '', cp: '', ciudad: '' },
  { id: 'cli_4', name: 'Particular', color: '#9A9D93', contact: '—', linkedProjects: ['proj_2', 'proj_4'], nif: '', tipo: 'pequeno', porcentaje: 0, owner: '', calle: '', cp: '', ciudad: '' },
];

const emptyEntryForm = { projectId: '', app: '', start: '', end: '' };

export default function AppWindow() {
  const [section, setSection] = useState('registro');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [mode, setMode] = useState('automatico');
  const [launchAtLogin, setLaunchAtLogin] = useState(true);

  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjColor, setNewProjColor] = useState(TAG_COLORS[0].hex);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleProject, setNewRuleProject] = useState(INITIAL_PROJECTS[0].id);
  const [error, setError] = useState('');

  // Registro de hoy: edición de entradas
  const [bulkEdit, setBulkEdit] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [entryForm, setEntryForm] = useState(emptyEntryForm);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryError, setEntryError] = useState('');
  const [tiempoGroupBy, setTiempoGroupBy] = useState('proyecto');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [rates, setRates] = useState(INITIAL_RATES);
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const [projectSearch, setProjectSearch] = useState('');
  const [editModalId, setEditModalId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [clientSearch, setClientSearch] = useState('');
  const [editClientId, setEditClientId] = useState(null);
  const [clientDraft, setClientDraft] = useState(null);
  const [ruleOrder, setRuleOrder] = useState('regla-proyecto');
  const [tiempoExpanded, setTiempoExpanded] = useState(true);

  const projectById = (id) => projects.find(p => p.id === id);
  const totalToday = projects.reduce((s, p) => s + p.today, 0);
  const entriesTotal = entries.reduce((s, e) => s + entrySeconds(e), 0);

  const addProject = () => {
    const name = newProjName.trim();
    if (!name) { setError('Ponle un nombre al proyecto.'); return; }
    setProjects(prev => [...prev, { id: `proj_${Date.now()}`, name, color: newProjColor, today: 0, total: 0 }]);
    setNewProjName(''); setShowAddProject(false); setError('');
  };
  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setRules(prev => prev.filter(r => r.projectId !== id));
  };
  const addRule = () => {
    const kw = newKeyword.trim();
    if (!kw) { setError('Escribe una palabra clave o parte del título.'); return; }
    setRules(prev => [...prev, { id: `r_${Date.now()}`, keyword: kw, projectId: newRuleProject }]);
    setNewKeyword(''); setShowAddRule(false); setError('');
  };
  const deleteRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const addRate = () => setRates(prev => [...prev, { id: `rate_${Date.now()}`, name: '', value: 0, type: 'ingresos', role: selectedRole }]);
  const updateRate = (id, field, val) => setRates(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const deleteRate = (id) => setRates(prev => prev.filter(r => r.id !== id));

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(projectSearch.trim().toLowerCase()));
  const createProjectFromSearch = () => {
    const name = projectSearch.trim();
    if (!name) return;
    const color = TAG_COLORS[projects.length % TAG_COLORS.length].hex;
    setProjects(prev => [...prev, {
      id: `proj_${Date.now()}`, name, color, today: 0, total: 0,
      owner: 'Tú', role: 'Project Manager', description: '', phases: ['Fase 1'],
    }]);
    setProjectSearch('');
  };

  const openEditModal = (project) => {
    const kw = rules.filter(r => r.projectId === project.id).map(r => r.keyword).join(', ');
    setDraft({
      name: project.name,
      color: project.color || TAG_COLORS[0].hex,
      owner: project.owner || 'Tú',
      role: project.role || 'Project Manager',
      description: project.description || '',
      phases: project.phases && project.phases.length ? [...project.phases] : ['Fase 1'],
      keywords: kw,
    });
    setEditModalId(project.id);
  };
  const closeEditModal = () => { setEditModalId(null); setDraft(null); };
  const saveEditModal = () => {
    if (!draft || !editModalId) return;
    setProjects(prev => prev.map(p => p.id === editModalId
      ? { ...p, name: draft.name.trim() || p.name, color: draft.color, owner: draft.owner, role: draft.role, description: draft.description, phases: draft.phases.filter(f => f.trim()) }
      : p));
    const newKeywords = draft.keywords.split(',').map(k => k.trim()).filter(Boolean);
    setRules(prev => [
      ...prev.filter(r => r.projectId !== editModalId),
      ...newKeywords.map((kw, i) => ({ id: `r_${editModalId}_${Date.now()}_${i}`, keyword: kw, projectId: editModalId })),
    ]);
    closeEditModal();
  };
  const updateDraftPhase = (idx, val) => setDraft(d => { const phases = [...d.phases]; phases[idx] = val; return { ...d, phases }; });
  const addDraftPhase = () => setDraft(d => ({ ...d, phases: [...d.phases, `Fase ${d.phases.length + 1}`] }));
  const removeDraftPhase = (idx) => setDraft(d => ({ ...d, phases: d.phases.filter((_, i) => i !== idx) }));

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.trim().toLowerCase()));
  const createClientFromSearch = () => {
    const name = clientSearch.trim();
    if (!name) return;
    const color = TAG_COLORS[clients.length % TAG_COLORS.length].hex;
    setClients(prev => [...prev, { id: `cli_${Date.now()}`, name, color, contact: '—', linkedProjects: [] }]);
    setClientSearch('');
  };
  const deleteClient = (id) => setClients(prev => prev.filter(c => c.id !== id));

  const openEditClient = (client) => {
    setClientDraft({
      name: client.name, color: client.color || TAG_COLORS[0].hex, nif: client.nif || '', tipo: client.tipo || 'gran',
      porcentaje: client.porcentaje ?? (TIER_OPTIONS.find(t => t.id === (client.tipo || 'gran'))?.pct || 0),
      owner: client.owner || '', calle: client.calle || '', cp: client.cp || '', ciudad: client.ciudad || '',
    });
    setEditClientId(client.id);
  };
  const closeEditClient = () => { setEditClientId(null); setClientDraft(null); };
  const saveEditClient = () => {
    if (!clientDraft || !editClientId) return;
    setClients(prev => prev.map(c => c.id === editClientId
      ? { ...c, name: clientDraft.name.trim() || c.name, color: clientDraft.color, nif: clientDraft.nif, tipo: clientDraft.tipo, porcentaje: clientDraft.porcentaje, owner: clientDraft.owner, contact: clientDraft.owner || c.contact, calle: clientDraft.calle, cp: clientDraft.cp, ciudad: clientDraft.ciudad }
      : c));
    closeEditClient();
  };

  // --- Entradas del día ---
  const openAddEntry = () => {
    setEditingEntryId(null);
    setEntryForm({ ...emptyEntryForm, projectId: projects[0]?.id || '' });
    setEntryError('');
    setShowAddEntry(true);
  };
  const openEditEntry = (entry) => {
    setShowAddEntry(false);
    setEntryError('');
    setEditingEntryId(entry.id);
    setEntryForm({ projectId: entry.projectId, app: entry.app, start: entry.start, end: entry.end });
  };
  const cancelEntryForm = () => {
    setShowAddEntry(false);
    setEditingEntryId(null);
    setEntryError('');
  };
  const validateEntryForm = () => {
    if (!entryForm.projectId) return 'Elige un proyecto.';
    const startMin = timeToMinutes(entryForm.start);
    const endMin = timeToMinutes(entryForm.end);
    if (startMin === null || endMin === null) return 'Rellena la hora de inicio y fin.';
    if (endMin <= startMin) return 'La hora de fin debe ser posterior a la de inicio.';
    return '';
  };
  const saveNewEntry = () => {
    const msg = validateEntryForm();
    if (msg) { setEntryError(msg); return; }
    setEntries(prev => [...prev, {
      id: `e_${Date.now()}`, projectId: entryForm.projectId,
      app: entryForm.app.trim() || 'Entrada manual', start: entryForm.start, end: entryForm.end,
    }]);
    setShowAddEntry(false); setEntryError('');
  };
  const saveEditedEntry = () => {
    const msg = validateEntryForm();
    if (msg) { setEntryError(msg); return; }
    setEntries(prev => prev.map(e => e.id === editingEntryId
      ? { ...e, projectId: entryForm.projectId, app: entryForm.app.trim() || 'Entrada manual', start: entryForm.start, end: entryForm.end }
      : e));
    setEditingEntryId(null); setEntryError('');
  };
  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (editingEntryId === id) cancelEntryForm();
  };
  const duplicateLastEntry = () => {
    if (entries.length === 0) return;
    const last = entries[entries.length - 1];
    setEntries(prev => [...prev, { ...last, id: `e_${Date.now()}` }]);
  };

  return (
    <div style={{
      minHeight: '100%', display: 'flex', background: '#FFFFFF',
      fontFamily: "'Inter', -apple-system, sans-serif", color: '#20231F',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .qs { font-family: 'Quicksand', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .nav-item { transition: background 0.12s ease; cursor: pointer; }
        .nav-item:hover { background: #F0F0EC; }
        .row { transition: background 0.12s ease; position: relative; }
        .row:hover { background: #FAFAF8 !important; }
        .row-actions { opacity: 0; transition: opacity 0.12s ease; display: flex; gap: 2px; }
        .row:hover .row-actions { opacity: 1; }
        .row-actions.always { opacity: 1; }
        .btn { transition: transform 0.08s ease, background 0.12s ease; cursor: pointer; }
        .btn:active { transform: scale(0.97); }
        .pill-btn { transition: background 0.12s ease, color 0.12s ease; cursor: pointer; }
        .swatch { transition: transform 0.1s ease; cursor: pointer; }
        .swatch:hover { transform: scale(1.15); }
        .switch { cursor: pointer; }
        .icon-btn { transition: background 0.12s ease; cursor: pointer; }
        .icon-btn:hover { background: #F0F0EC; }
        .header-icon { transition: background 0.12s ease; cursor: pointer; }
        .header-icon:hover { background: #F0F0EC; }
        @keyframes slideInPanel { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      {/* Sidebar */}
      <div style={{ width: '236px', flexShrink: 0, borderRight: '1px solid #EBEBE6', padding: '18px 12px', background: '#FBFBF9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', background: '#7FB35C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={15} color="#FFFFFF" strokeWidth={2.3} />
            </div>
            <span className="qs" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>Enfoque</span>
          </div>
          <div className="icon-btn" style={{ padding: '5px', borderRadius: '6px', display: 'flex' }}>
            <PanelLeft size={15} color="#9A9D93" />
          </div>
        </div>

        {NAV.map(group => (
          <div key={group.group} style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: '#A3A79B', fontWeight: 500, padding: '0 8px 6px', letterSpacing: '0.02em' }}>
              {group.group.toUpperCase()}
            </div>

            {group.group === 'Informes' && (
              <div style={{ marginBottom: '2px' }}>
                <div
                  className="nav-item"
                  onClick={() => setTiempoExpanded(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
                    background: section.startsWith('tiempo-') ? '#EDEEE8' : 'transparent',
                  }}
                >
                  <Gauge size={15} color="#3A3D36" strokeWidth={2} />
                  <span style={{ fontSize: '13.5px', fontWeight: section.startsWith('tiempo-') ? 600 : 400, color: '#20231F', flex: 1 }}>Tiempo</span>
                  {tiempoExpanded
                    ? <ChevronDown size={13} color="#9A9D93" />
                    : <ChevronRight size={13} color="#9A9D93" />}
                </div>

                {tiempoExpanded && (
                  <div style={{ paddingLeft: '10px', marginBottom: '4px' }}>
                    {TIEMPO_SUBGROUPS.map(sub => (
                      <div key={sub.label} style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '10.5px', color: '#B3B6AB', fontWeight: 500, padding: '4px 10px 2px', letterSpacing: '0.02em' }}>
                          {sub.label}
                        </div>
                        {sub.items.map(item => {
                          const Icon = item.icon;
                          const active = section === item.id;
                          return (
                            <div
                              key={item.id}
                              className="nav-item"
                              onClick={() => { setSection(item.id); setSelectedProjectId(null); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '9px',
                                padding: '6px 10px', borderRadius: '7px', marginBottom: '1px',
                                background: active ? '#EDEEE8' : 'transparent',
                              }}
                            >
                              <Icon size={13} color="#3A3D36" strokeWidth={2} />
                              <span style={{ fontSize: '13px', fontWeight: active ? 600 : 400, color: '#20231F' }}>{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {group.items.map(item => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <div
                  key={item.id}
                  className="nav-item"
                  onClick={() => { setSection(item.id); setSelectedProjectId(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
                    background: active ? '#EDEEE8' : 'transparent',
                  }}
                >
                  <Icon size={15} color="#3A3D36" strokeWidth={2} />
                  <span style={{ fontSize: '13.5px', fontWeight: active ? 600 : 400, color: '#20231F', flex: 1 }}>{item.label}</span>
                  {item.expandable && <ChevronRight size={13} color="#B3B6AB" />}
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: '28px' }}>
          <div style={{ fontSize: '11px', color: '#A3A79B', fontWeight: 500, padding: '0 8px 6px', letterSpacing: '0.02em' }}>EQUIPO</div>
          <div
            className="nav-item"
            onClick={() => setSection('configuracion')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
              borderRadius: '8px', background: section === 'configuracion' ? '#EDEEE8' : 'transparent',
            }}
          >
            <Settings size={15} color="#3A3D36" strokeWidth={2} />
            <span style={{ fontSize: '13.5px', fontWeight: section === 'configuracion' ? 600 : 400, color: '#20231F' }}>Configuración</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '22px 32px', minWidth: 0 }}>

        {section === 'registro' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Registro de hoy</h1>
              <Settings size={16} color="#9A9D93" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={14} color="#5A5D55" />
                </div>
                <div className="icon-btn" style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px' }}>
                  <ChevronDown size={13} color="#5A5D55" />
                </div>
                <div className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={14} color="#5A5D55" />
                </div>
                <span style={{ fontSize: '14.5px', fontWeight: 500, marginLeft: '6px' }}>Hoy, 13 agosto</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden' }}>
                  {['Día', 'Semana'].map((label, i) => (
                    <button key={label} className="pill-btn" style={{
                      border: 'none', padding: '7px 16px', fontSize: '13px', fontWeight: 500,
                      background: i === 0 ? '#F1F6EC' : '#FFFFFF',
                      color: i === 0 ? '#5C8A3C' : '#5A5D55',
                      borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                    }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MoreVertical size={15} color="#5A5D55" />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #7FB35C',
              borderRadius: '10px', padding: '11px 14px', marginBottom: '22px', boxShadow: '0 0 0 3px #EDF5E6',
            }}>
              <span style={{ flex: 1, fontSize: '14px', color: '#9A9D93' }}>¿En qué proyecto estás trabajando?</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5A5D55', borderRight: '1px solid #E5E5E0', paddingRight: '10px' }}>
                Sin proyecto <ChevronDown size={12} />
              </div>
              <div className="btn" style={{
                width: '30px', height: '30px', borderRadius: '50%', background: '#7FB35C',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '3px', height: '14px', background: '#D7D9D2', borderRadius: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B6E64', flex: 1 }}>Día laboral</span>
              <span className="mono" style={{ fontSize: '12.5px', color: '#5A5D55', marginRight: '2px' }}>{formatHM(entriesTotal)}</span>
              <div
                className="header-icon" onClick={openAddEntry} aria-label="Añadir entrada"
                style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Plus size={14} color="#5A5D55" />
              </div>
              <div
                className="header-icon" onClick={duplicateLastEntry} aria-label="Duplicar última entrada"
                style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Copy size={13} color="#5A5D55" />
              </div>
              <div
                className="header-icon" onClick={() => setBulkEdit(v => !v)} aria-label="Activar edición"
                style={{
                  width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: bulkEdit ? '#EDEEE8' : 'transparent',
                }}
              >
                <Pencil size={13} color={bulkEdit ? '#5C8A3C' : '#5A5D55'} />
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              {entries.map(e => {
                const proj = projectById(e.projectId);
                const isEditing = editingEntryId === e.id;

                if (isEditing) {
                  return (
                    <div key={e.id} style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '12px', margin: '6px 0' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <select
                          value={entryForm.projectId}
                          onChange={(ev) => setEntryForm(f => ({ ...f, projectId: ev.target.value }))}
                          style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
                        >
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input
                          value={entryForm.app}
                          onChange={(ev) => setEntryForm(f => ({ ...f, app: ev.target.value }))}
                          placeholder="App o descripción (opcional)"
                          style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <input type="time" value={entryForm.start} onChange={(ev) => setEntryForm(f => ({ ...f, start: ev.target.value }))}
                          style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }} />
                        <span style={{ color: '#9A9D93', fontSize: '13px' }}>—</span>
                        <input type="time" value={entryForm.end} onChange={(ev) => setEntryForm(f => ({ ...f, end: ev.target.value }))}
                          style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }} />
                      </div>
                      {entryError && <div style={{ fontSize: '12px', color: '#E2725B', marginBottom: '8px' }}>{entryError}</div>}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" onClick={saveEditedEntry} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}>Guardar</button>
                        <button className="btn" onClick={cancelEntryForm} style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '12.5px', fontWeight: 500 }}>Cancelar</button>
                      </div>
                    </div>
                  );
                }

                if (!proj) return null;
                return (
                  <div key={e.id} className="row" style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 8px', borderBottom: '1px solid #F1F1EC',
                  }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: proj.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', color: '#20231F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.name}</div>
                      <div style={{ fontSize: '12px', color: '#9A9D93' }}>{e.app}</div>
                    </div>
                    <span className="mono" style={{ fontSize: '12.5px', color: '#9A9D93' }}>{e.start} – {e.end}</span>
                    <span className="mono" style={{ fontSize: '13px', color: '#20231F', minWidth: '54px', textAlign: 'right' }}>{formatHM(entrySeconds(e))}</span>
                    <div className={`row-actions ${bulkEdit ? 'always' : ''}`}>
                      <button className="header-icon btn" onClick={() => openEditEntry(e)} aria-label="Editar entrada" style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pencil size={12} color="#9A9D93" />
                      </button>
                      <button className="header-icon btn" onClick={() => deleteEntry(e.id)} aria-label="Eliminar entrada" style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={12} color="#9A9D93" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {showAddEntry && (
                <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '12px', margin: '6px 0' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={entryForm.projectId}
                      onChange={(ev) => setEntryForm(f => ({ ...f, projectId: ev.target.value }))}
                      style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
                    >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                      value={entryForm.app}
                      onChange={(ev) => setEntryForm(f => ({ ...f, app: ev.target.value }))}
                      placeholder="App o descripción (opcional)"
                      style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <input type="time" value={entryForm.start} onChange={(ev) => setEntryForm(f => ({ ...f, start: ev.target.value }))}
                      style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }} />
                    <span style={{ color: '#9A9D93', fontSize: '13px' }}>—</span>
                    <input type="time" value={entryForm.end} onChange={(ev) => setEntryForm(f => ({ ...f, end: ev.target.value }))}
                      style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }} />
                  </div>
                  {entryError && <div style={{ fontSize: '12px', color: '#E2725B', marginBottom: '8px' }}>{entryError}</div>}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" onClick={saveNewEntry} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}>Añadir</button>
                    <button className="btn" onClick={cancelEntryForm} style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '12.5px', fontWeight: 500 }}>Cancelar</button>
                  </div>
                </div>
              )}

              {entries.length === 0 && !showAddEntry && (
                <div style={{ textAlign: 'center', padding: '56px 0 30px' }}>
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ margin: '0 auto', display: 'block' }}>
                    <circle cx="60" cy="60" r="52" fill="#8FBC6B" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#6FA04C" strokeWidth="3" />
                    <circle cx="60" cy="60" r="42" fill="#9CC97E" />
                    <line x1="60" y1="60" x2="60" y2="36" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                    <line x1="60" y1="60" x2="78" y2="66" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="60" cy="60" r="4" fill="#FFFFFF" />
                  </svg>
                  <div className="qs" style={{ fontSize: '16px', fontWeight: 600, marginTop: '16px' }}>No hay tiempo registrado hoy</div>
                  <div style={{ fontSize: '12.5px', color: '#9A9D93', marginTop: '4px' }}>
                    Las sesiones aparecerán aquí en cuanto el seguimiento automático detecte actividad.
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {section === 'tiempo-resumen' && (() => {
          const REPORT = projects.map(p => ({
            ...p,
            children: rules.filter(r => r.projectId === p.id).map((r, i) => ({
              id: r.id,
              name: r.keyword,
              // reparte el tiempo del proyecto entre sus reglas solo a modo de ejemplo
              seconds: i === 0 ? Math.round(p.today * 0.65) : Math.round(p.today * 0.35 / Math.max(1, rules.filter(rr => rr.projectId === p.id).length - 1)),
            })),
          }));
          const totalGeneral = projects.reduce((s, p) => s + p.today, 0);

          const FilterField = ({ label, value }) => (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>{label}</div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
                border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#3A3D36',
              }}>
                {value}
                <ChevronDown size={12} color="#9A9D93" />
              </div>
            </div>
          );

          return (
            <>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 14px' }}>Tiempo — Resumen</h1>

              <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden', marginBottom: '18px' }}>
                {[{ id: 'proyecto', label: 'Por proyecto' }, { id: 'app', label: 'Por app' }].map((t, i) => {
                  const active = tiempoGroupBy === t.id;
                  return (
                    <button key={t.id} className="pill-btn" onClick={() => setTiempoGroupBy(t.id)} style={{
                      border: 'none', padding: '7px 16px', fontSize: '12.5px', fontWeight: 500,
                      background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                      borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      {active && <Check size={12} strokeWidth={2.5} />}
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '22px' }}>
                <FilterField label="RANGO DE FECHAS" value="Este mes" />
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

              {tiempoGroupBy === 'proyecto' ? REPORT.map(p => (
                <div key={p.id}>
                  <div className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
                    <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: p.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: '13.5px' }}>{p.name}</span>
                    <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '12.5px' }}>{p.today > 0 ? formatHM(p.today) : '–'}</span>
                  </div>
                  {p.children.map(c => (
                    <div key={c.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 8px 8px 28px', borderBottom: '1px solid #F5F5F1' }}>
                      <span className="mono" style={{ flex: 1, fontSize: '12.5px', color: '#6B6E64' }}>{c.name}</span>
                      <span className="mono" style={{ width: '100px', textAlign: 'right', fontSize: '12px', color: '#9A9D93' }}>{c.seconds > 0 ? formatHM(c.seconds) : '–'}</span>
                    </div>
                  ))}
                </div>
              )) : [...APPS_TODAY].sort((a, b) => b.seconds - a.seconds).map(a => (
                <div key={a.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: a.color, flexShrink: 0 }} />
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
        })()}

        {section === 'actividades' && (
          <>
            <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 20px' }}>Actividades de apps</h1>
            <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '14px' }}>Tiempo de hoy agrupado por aplicación, sin importar el proyecto.</div>
            {[...APPS_TODAY].sort((a, b) => b.seconds - a.seconds).map(a => (
              <div key={a.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 8px', borderBottom: '1px solid #F1F1EC' }}>
                <Monitor size={14} color="#9A9D93" />
                <span style={{ flex: 1, fontSize: '13.5px' }}>{a.name}</span>
                <span className="mono" style={{ fontSize: '12.5px', color: '#9A9D93' }}>{formatHM(a.seconds)}</span>
              </div>
            ))}
          </>
        )}

        {section === 'proyectos' && selectedProjectId && (() => {
          const p = projectById(selectedProjectId);
          if (!p) { setSelectedProjectId(null); return null; }
          const projectRules = rules.filter(r => r.projectId === p.id);
          const series = generateDailySeries(p.today || 3600);
          const maxVal = Math.max(...series.map(s => s.seconds), 60);
          const chartW = 680, chartH = 200, padL = 46, padB = 34, padT = 10, padR = 10;
          const plotW = chartW - padL - padR, plotH = chartH - padT - padB;
          const xStep = plotW / (series.length - 1);
          const points = series.map((s, i) => ({
            x: padL + i * xStep,
            y: padT + plotH - (s.seconds / maxVal) * plotH,
          }));
          const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
          const gridSteps = [0, 0.25, 0.5, 0.75, 1];

          const totalRuleSeconds = projectRules.reduce((s, r, i) => s + (i === 0 ? Math.round(p.today * 0.65) : Math.round(p.today * 0.35 / Math.max(1, projectRules.length - 1))), 0);
          const daysMock = [4, 6, 2, 3, 5];

          return (
            <>
              <div
                onClick={() => setSelectedProjectId(null)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#5A5D55', fontSize: '13px', marginBottom: '14px' }}
              >
                <ChevronLeft size={14} /> Proyectos
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                <h1 className="qs" style={{ fontSize: '20px', fontWeight: 700, color: '#5C8A3C', margin: 0 }}>PROYECTO:</h1>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#20231F' }}>{p.name.toUpperCase()}</span>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px', background: '#FAFAF8',
                border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', marginBottom: '22px', flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>RANGO DE FECHAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E0', borderRadius: '7px', overflow: 'hidden' }}>
                    <span className="icon-btn" style={{ padding: '7px 8px', display: 'flex' }}><ChevronLeft size={13} color="#5A5D55" /></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', fontSize: '12.5px', borderLeft: '1px solid #E5E5E0', borderRight: '1px solid #E5E5E0' }}>
                      <Calendar size={12} color="#5A5D55" /> Este mes <ChevronDown size={11} color="#9A9D93" />
                    </span>
                    <span className="icon-btn" style={{ padding: '7px 8px', display: 'flex' }}><ChevronRight size={13} color="#5A5D55" /></span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>DESDE</div>
                  <div style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#9A9D93' }}>13/08/2026</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#5A5D55', marginBottom: '6px' }}>HASTA</div>
                  <div style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '12.5px', color: '#9A9D93' }}>13/08/2026</div>
                </div>
                <button className="btn" style={{ marginTop: '18px', padding: '8px 18px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 600 }}>
                  MOSTRAR
                </button>
              </div>

              <div style={{ display: 'flex', fontSize: '11px', color: '#9A9D93', fontWeight: 600, padding: '0 8px 8px', borderBottom: '1px solid #EBEBE6' }}>
                <span style={{ flex: 1 }}>REGLA / APP</span>
                <span style={{ width: '90px', textAlign: 'right' }}>HORAS</span>
                <span style={{ width: '90px', textAlign: 'right' }}>DÍAS ACTIVOS</span>
              </div>
              {projectRules.length === 0 && (
                <div style={{ padding: '14px 8px', fontSize: '12.5px', color: '#9A9D93' }}>Este proyecto todavía no tiene reglas asociadas.</div>
              )}
              {projectRules.map((r, i) => {
                const secs = i === 0 ? Math.round(p.today * 0.65) : Math.round(p.today * 0.35 / Math.max(1, projectRules.length - 1));
                return (
                  <div key={r.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px', borderBottom: '1px solid #F5F5F1' }}>
                    <span className="mono" style={{ flex: 1, fontSize: '12.5px' }}>{r.keyword}</span>
                    <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '12.5px' }}>{secs > 0 ? formatHM(secs) : '–'}</span>
                    <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '12.5px', color: '#9A9D93' }}>{daysMock[i % daysMock.length]}d</span>
                  </div>
                );
              })}
              {projectRules.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 8px' }}>
                  <span style={{ flex: 1, fontSize: '13px', fontWeight: 700 }}>Total</span>
                  <span className="mono" style={{ width: '90px', textAlign: 'right', fontSize: '13px', fontWeight: 700 }}>{formatHM(totalRuleSeconds)}</span>
                  <span style={{ width: '90px' }} />
                </div>
              )}

              <div style={{ fontSize: '13px', fontWeight: 500, color: '#20231F', margin: '24px 0 10px' }}>Horas dedicadas por día</div>
              <div style={{ border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 8px 6px' }}>
                <svg viewBox={`0 0 ${chartW} ${chartH}`} width="100%" height={chartH}>
                  {gridSteps.map(g => {
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
                    <text key={s.label} x={points[i].x} y={chartH - 8} fontSize="9.5" fill="#9A9D93" textAnchor="end"
                      transform={`rotate(-35 ${points[i].x} ${chartH - 8})`}>
                      {s.label}
                    </text>
                  ))}
                </svg>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '22px' }}>
                {[
                  { label: 'FECHA DE INICIO', value: '2 Agosto 2026', sub: null },
                  { label: 'ÚLTIMA ACTIVIDAD', value: '13 Agosto 2026', sub: null },
                  { label: 'TIEMPO TOTAL', value: formatHM(p.total), sub: `${formatHM(Math.round(p.total / 12))} / día` },
                  { label: 'MEDIA DIARIA (7D)', value: formatHM(Math.round(p.today * 0.6)), sub: '5 días activos' },
                ].map(card => (
                  <div key={card.label} style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#9A9D93', letterSpacing: '0.03em', marginBottom: '8px' }}>{card.label}</div>
                    <div className="qs" style={{ fontSize: '18px', fontWeight: 700, color: '#5C8A3C' }}>{card.value}</div>
                    {card.sub && <div style={{ fontSize: '11.5px', color: '#9A9D93', marginTop: '4px' }}>{card.sub}</div>}
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {section === 'proyectos' && !selectedProjectId && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Proyectos</h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') createProjectFromSearch(); }}
                placeholder="Buscar"
                style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
              />
              <button className="btn" onClick={createProjectFromSearch} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', whiteSpace: 'nowrap',
                borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600,
              }}>
                <Plus size={14} /> Nuevo proyecto
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '16px' }}>
              Para añadir un nuevo proyecto — nómbralo en el buscador y pulsa{' '}
              <span style={{ border: '1px solid #E5E5E0', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', margin: '0 2px' }}>Ctrl</span>
              +
              <span style={{ border: '1px solid #E5E5E0', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', margin: '0 2px' }}>Enter</span>
            </div>

            <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  className="row"
                  onClick={() => openEditModal(p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #F1F1EC', cursor: 'pointer' }}
                >
                  {p.phases && p.phases.length > 1
                    ? <ChevronRight size={14} color="#B3B6AB" style={{ flexShrink: 0 }} />
                    : <span style={{ width: '14px', flexShrink: 0 }} />}
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#20231F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#9A9D93' }}>{p.owner || 'Tú'}</div>
                  </div>
                  <button
                    className="btn" onClick={(ev) => { ev.stopPropagation(); setSelectedProjectId(p.id); }}
                    aria-label="Ver detalle" title="Ver detalle"
                    style={{ background: 'none', border: 'none', display: 'flex', padding: '4px' }}
                  >
                    <LineChart size={15} color="#9A9D93" />
                  </button>
                  <button
                    className="btn" onClick={(ev) => { ev.stopPropagation(); deleteProject(p.id); }}
                    aria-label="Eliminar" title="Eliminar"
                    style={{ background: 'none', border: 'none', display: 'flex', padding: '4px' }}
                  >
                    <Trash2 size={14} color="#B8BBB1" />
                  </button>
                </div>
              ))}
              {filteredProjects.length === 0 && (
                <div style={{ padding: '20px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Sin resultados para "{projectSearch}".</div>
              )}
            </div>
          </>
        )}

        {editModalId && draft && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(30,32,28,0.35)',
            display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', zIndex: 50,
          }} onClick={closeEditModal}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '440px', maxWidth: '90vw', height: '100%', overflowY: 'auto', background: '#FFFFFF',
                boxShadow: '-16px 0 48px rgba(0,0,0,0.22)', padding: '24px',
                animation: 'slideInPanel 0.18s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="qs" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Editar Proyecto</h2>
                <button className="btn" onClick={closeEditModal} style={{ background: 'none', border: 'none', display: 'flex' }}>
                  <X size={18} color="#9A9D93" />
                </button>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Cliente</div>
              <input
                value={draft.name}
                onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8', marginBottom: '14px' }}
              />

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Color</div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {TAG_COLORS.map(c => (
                  <span
                    key={c.hex}
                    className="swatch"
                    onClick={() => setDraft(d => ({ ...d, color: c.hex }))}
                    style={{
                      width: '15px', height: '15px', borderRadius: '50%', background: c.hex,
                      boxShadow: draft.color === c.hex ? `0 0 0 2px #FFFFFF, 0 0 0 3px ${c.hex}` : 'none',
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Persona encargada</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #E5E5E0', borderRadius: '9px', padding: '10px', marginBottom: '18px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#EDEEE8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: 600, color: '#5A5D55' }}>
                  {(draft.owner || '?').slice(0, 1).toUpperCase()}
                </div>
                <input
                  value={draft.owner}
                  onChange={(e) => setDraft(d => ({ ...d, owner: e.target.value }))}
                  style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '13px', color: '#20231F' }}
                />
                <select
                  value={draft.role}
                  onChange={(e) => setDraft(d => ({ ...d, role: e.target.value }))}
                  style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '12px', outline: 'none' }}
                >
                  {['Project Manager', 'Diseñador', 'Desarrollador', 'Colaborador'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  className="btn" onClick={() => setDraft(d => ({ ...d, owner: '' }))} aria-label="Quitar persona"
                  style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px', background: 'none', display: 'flex' }}
                >
                  <Trash2 size={13} color="#B8BBB1" />
                </button>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Descripción</div>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))}
                placeholder="Descripción breve del proyecto"
                rows={2}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8', marginBottom: '18px', resize: 'vertical', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F' }}>Presupuesto</span>
                <Settings size={12} color="#9A9D93" />
              </div>
              {draft.phases.map((phase, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    value={phase}
                    onChange={(e) => updateDraftPhase(i, e.target.value)}
                    style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
                  />
                  {draft.phases.length > 1 && (
                    <button className="btn" onClick={() => removeDraftPhase(i)} style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '0 10px', background: 'none' }}>
                      <X size={13} color="#9A9D93" />
                    </button>
                  )}
                </div>
              ))}
              <div className="btn" onClick={addDraftPhase} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#5B8DBF', fontSize: '12.5px', fontWeight: 500, marginBottom: '18px' }}>
                <PlusCircle size={14} /> Añadir fase
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F' }}>Palabras clave (reglas)</span>
                <Info size={12} color="#9A9D93" />
              </div>
              <textarea
                value={draft.keywords}
                onChange={(e) => setDraft(d => ({ ...d, keywords: e.target.value }))}
                placeholder="p. ej. figma.com/acme, notion.so/proyecto, vscode — proyecto"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8', marginBottom: '20px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace" }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={saveEditModal} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                  Guardar
                </button>
                <button className="btn" onClick={closeEditModal} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '13px', fontWeight: 600 }}>
                  Cancela
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'reglas' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Reglas</h1>
              <button className="btn" onClick={() => setShowAddRule(true)} style={{
                display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px',
                borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500,
              }}>
                <Plus size={13} /> Regla
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '14px' }}>
              Cuando el título de la app o pestaña activa contenga esto, se suma al proyecto.
            </div>

            <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              {[{ id: 'regla-proyecto', label: 'Regla → Proyecto' }, { id: 'proyecto-regla', label: 'Proyecto → Regla' }].map((opt, i) => {
                const active = ruleOrder === opt.id;
                return (
                  <button key={opt.id} className="pill-btn" onClick={() => setRuleOrder(opt.id)} style={{
                    border: 'none', padding: '7px 16px', fontSize: '12.5px', fontWeight: 500,
                    background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                    borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                    display: 'flex', alignItems: 'center', gap: '5px',
                  }}>
                    {active && <Check size={12} strokeWidth={2.5} />}
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {ruleOrder === 'regla-proyecto' ? (
              <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
                {rules.map(r => {
                  const proj = projectById(r.projectId);
                  return (
                    <div key={r.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: '1px solid #F1F1EC' }}>
                      <span className="mono" style={{ fontSize: '12px', background: '#F1F1EC', borderRadius: '6px', padding: '5px 9px', flex: '0 1 auto' }}>{r.keyword}</span>
                      <ChevronRight size={13} color="#B3B6AB" style={{ flexShrink: 0 }} />
                      {proj ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{proj.name}</span>
                        </span>
                      ) : <span style={{ flex: 1, fontSize: '13px', color: '#B8BBB1' }}>(proyecto eliminado)</span>}
                      <button className="btn" onClick={() => deleteRule(r.id)} aria-label="Eliminar regla" style={{ background: 'none', border: 'none', display: 'flex' }}>
                        <Trash2 size={13} color="#B8BBB1" />
                      </button>
                    </div>
                  );
                })}
                {rules.length === 0 && (
                  <div style={{ padding: '18px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Todavía no has añadido ninguna regla.</div>
                )}
              </div>
            ) : (
              <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
                {projects.map(p => {
                  const projRules = rules.filter(r => r.projectId === p.id);
                  return (
                    <div key={p.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FAFAF8', borderBottom: '1px solid #EBEBE6' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                      </div>
                      {projRules.length === 0 && (
                        <div style={{ padding: '10px 14px 10px 32px', fontSize: '12px', color: '#9A9D93', borderBottom: '1px solid #F1F1EC' }}>Sin reglas asociadas.</div>
                      )}
                      {projRules.map(r => (
                        <div key={r.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px 9px 32px', borderBottom: '1px solid #F1F1EC' }}>
                          <span className="mono" style={{ flex: 1, fontSize: '12px', color: '#5A5D55' }}>{r.keyword}</span>
                          <button className="btn" onClick={() => deleteRule(r.id)} aria-label="Eliminar regla" style={{ background: 'none', border: 'none', display: 'flex' }}>
                            <Trash2 size={13} color="#B8BBB1" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {showAddRule && (
              <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>Nueva regla</span>
                  <button className="btn" onClick={() => { setShowAddRule(false); setError(''); }} style={{ background: 'none', border: 'none', display: 'flex' }}>
                    <X size={14} color="#9A9D93" />
                  </button>
                </div>
                <input
                  value={newKeyword} onChange={(e) => { setNewKeyword(e.target.value); if (error) setError(''); }}
                  placeholder="p. ej. notion.so/finanzas" autoFocus onKeyDown={(e) => e.key === 'Enter' && addRule()}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '8px 10px', fontSize: '13px', marginBottom: '8px', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <select value={newRuleProject} onChange={(e) => setNewRuleProject(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '8px 10px', fontSize: '13px', marginBottom: '10px', outline: 'none' }}>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {error && <div style={{ fontSize: '12px', color: '#E2725B', marginBottom: '8px' }}>{error}</div>}
                <button className="btn" onClick={addRule} style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}>
                  Crear regla
                </button>
              </div>
            )}
          </>
        )}

        {section === 'tarifas-1' && (() => {
          const roleRates = rates.filter(r => r.role === selectedRole);
          return (
            <>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 8px' }}>Tarifas de facturación</h1>
              <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '18px' }}>
                El recargo por tipo de cliente ahora se define en cada ficha de Cliente.
              </div>

              <div style={{ fontSize: '13px', fontWeight: 500, color: '#20231F', marginBottom: '10px' }}>Rol</div>
              <div style={{ display: 'flex', border: '1px solid #E5E5E0', borderRadius: '9px', overflow: 'hidden', marginBottom: '18px' }}>
                {ROLE_OPTIONS.map((role, i) => {
                  const active = selectedRole === role;
                  return (
                    <button
                      key={role}
                      className="pill-btn"
                      onClick={() => setSelectedRole(role)}
                      style={{
                        flex: 1, border: 'none', padding: '10px 8px', fontSize: '13px', fontWeight: 500,
                        background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                        borderRight: i < ROLE_OPTIONS.length - 1 ? '1px solid #E5E5E0' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      }}
                    >
                      {active && <Check size={12} strokeWidth={2.5} />} {role}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '13px', fontWeight: 500, color: '#20231F', marginBottom: '10px' }}>Tarifas — {selectedRole}</div>
              <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', fontSize: '11px', color: '#9A9D93', fontWeight: 600, padding: '10px 14px', background: '#FAFAF8', borderBottom: '1px solid #EBEBE6' }}>
                  <span style={{ flex: '1 1 200px' }}>NOMBRE</span>
                  <span style={{ width: '130px' }}>VALOR PREDET. €/H</span>
                  <span style={{ width: '160px' }}>TIPO</span>
                  <span style={{ width: '40px' }} />
                </div>
                {roleRates.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #F1F1EC', gap: '10px' }}>
                    <input
                      value={r.name}
                      onChange={(e) => updateRate(r.id, 'name', e.target.value)}
                      placeholder="p. ej. Hora standard"
                      style={{ flex: '1 1 200px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
                    />
                    <div style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        value={r.value}
                        onChange={(e) => updateRate(r.id, 'value', Number(e.target.value))}
                        style={{ width: '80px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 8px', fontSize: '13px', outline: 'none' }}
                      />
                      <span style={{ fontSize: '12px', color: '#9A9D93' }}>€/h</span>
                    </div>
                    <div style={{ width: '160px', display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '7px', overflow: 'hidden' }}>
                      {[{ id: 'ingresos', label: 'Ingresos' }, { id: 'costo', label: 'Costo' }].map((opt, i) => {
                        const active = r.type === opt.id;
                        return (
                          <button
                            key={opt.id}
                            className="pill-btn"
                            onClick={() => updateRate(r.id, 'type', opt.id)}
                            style={{
                              border: 'none', flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: 500,
                              background: active ? '#F1F6EC' : '#FFFFFF',
                              color: active ? '#5C8A3C' : '#5A5D55',
                              borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                            }}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <button className="btn" onClick={() => deleteRate(r.id)} aria-label="Eliminar tarifa" style={{ width: '40px', background: 'none', border: 'none', display: 'flex', justifyContent: 'center' }}>
                      <Trash2 size={14} color="#B8BBB1" />
                    </button>
                  </div>
                ))}
                {roleRates.length === 0 && (
                  <div style={{ padding: '18px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Todavía no hay tarifas para {selectedRole}.</div>
                )}
              </div>

              <div
                className="btn"
                onClick={addRate}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', color: '#5B8DBF', fontSize: '13.5px', fontWeight: 500 }}
              >
                <PlusCircle size={17} /> Nueva tarifa de facturación
              </div>
            </>
          );
        })()}

        {section === 'clientes' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Clientes</h1>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') createClientFromSearch(); }}
                placeholder="Buscar"
                style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
              />
              <button className="btn" onClick={createClientFromSearch} style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', whiteSpace: 'nowrap',
                borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600,
              }}>
                <Plus size={14} /> Nuevo cliente
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '16px' }}>
              Para añadir un nuevo cliente — nómbralo en el buscador y pulsa{' '}
              <span style={{ border: '1px solid #E5E5E0', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', margin: '0 2px' }}>Ctrl</span>
              +
              <span style={{ border: '1px solid #E5E5E0', borderRadius: '4px', padding: '1px 5px', fontSize: '11px', margin: '0 2px' }}>Enter</span>
            </div>

            <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
              {filteredClients.map(c => (
                <div
                  key={c.id}
                  className="row"
                  onClick={() => openEditClient(c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #F1F1EC', cursor: 'pointer' }}
                >
                  {c.linkedProjects && c.linkedProjects.length > 1
                    ? <ChevronRight size={14} color="#B3B6AB" style={{ flexShrink: 0 }} />
                    : <span style={{ width: '14px', flexShrink: 0 }} />}
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#20231F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: '12px', color: '#9A9D93' }}>{c.contact}</div>
                  </div>
                  <button
                    className="btn" onClick={(ev) => { ev.stopPropagation(); deleteClient(c.id); }}
                    aria-label="Eliminar" title="Eliminar"
                    style={{ background: 'none', border: 'none', display: 'flex', padding: '4px' }}
                  >
                    <Trash2 size={14} color="#B8BBB1" />
                  </button>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div style={{ padding: '20px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Sin resultados para "{clientSearch}".</div>
              )}
            </div>
          </>
        )}

        {editClientId && clientDraft && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(30,32,28,0.35)',
            display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', zIndex: 50,
          }} onClick={closeEditClient}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '440px', maxWidth: '90vw', height: '100%', overflowY: 'auto', background: '#FFFFFF',
                boxShadow: '-16px 0 48px rgba(0,0,0,0.22)', padding: '24px',
                animation: 'slideInPanel 0.18s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="qs" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Editar Cliente</h2>
                <button className="btn" onClick={closeEditClient} style={{ background: 'none', border: 'none', display: 'flex' }}>
                  <X size={18} color="#9A9D93" />
                </button>
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Cliente</div>
              <input
                value={clientDraft.name}
                onChange={(e) => setClientDraft(d => ({ ...d, name: e.target.value }))}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8', marginBottom: '14px' }}
              />

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Color</div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {TAG_COLORS.map(c => (
                  <span
                    key={c.hex}
                    className="swatch"
                    onClick={() => setClientDraft(d => ({ ...d, color: c.hex }))}
                    style={{
                      width: '15px', height: '15px', borderRadius: '50%', background: c.hex,
                      boxShadow: clientDraft.color === c.hex ? `0 0 0 2px #FFFFFF, 0 0 0 3px ${c.hex}` : 'none',
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>NIF</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                <input
                  value={clientDraft.nif}
                  onChange={(e) => setClientDraft(d => ({ ...d, nif: e.target.value }))}
                  placeholder="12345678A"
                  style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
                />
                <button className="btn" onClick={() => setClientDraft(d => ({ ...d, nif: '' }))} style={{ border: '1px solid #E5E5E0', borderRadius: '8px', padding: '0 12px', background: 'none' }}>
                  <Trash2 size={14} color="#B8BBB1" />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Tipo</div>
                  <select
                    value={clientDraft.tipo}
                    onChange={(e) => {
                      const tipo = e.target.value;
                      const pct = TIER_OPTIONS.find(t => t.id === tipo)?.pct ?? clientDraft.porcentaje;
                      setClientDraft(d => ({ ...d, tipo, porcentaje: pct }));
                    }}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
                  >
                    {TIER_OPTIONS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{ width: '110px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Porcentaje</div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', background: '#FAFAF8' }}>
                    <input
                      type="number"
                      value={clientDraft.porcentaje}
                      onChange={(e) => setClientDraft(d => ({ ...d, porcentaje: Number(e.target.value) }))}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', background: 'transparent' }}
                    />
                    <span style={{ fontSize: '13px', color: '#9A9D93' }}>%</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #EBEBE6', margin: '4px 0 18px' }} />

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Persona encargada</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                <input
                  value={clientDraft.owner}
                  onChange={(e) => setClientDraft(d => ({ ...d, owner: e.target.value }))}
                  placeholder="Nombre de contacto"
                  style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
                />
                <button className="btn" onClick={() => setClientDraft(d => ({ ...d, owner: '' }))} style={{ border: '1px solid #E5E5E0', borderRadius: '8px', padding: '0 12px', background: 'none' }}>
                  <Trash2 size={14} color="#B8BBB1" />
                </button>
              </div>

              <div style={{ borderTop: '1px solid #EBEBE6', margin: '4px 0 18px' }} />

              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Dirección</div>
              <input
                value={clientDraft.calle}
                onChange={(e) => setClientDraft(d => ({ ...d, calle: e.target.value }))}
                placeholder="Calle"
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8', marginBottom: '8px' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  value={clientDraft.cp}
                  onChange={(e) => setClientDraft(d => ({ ...d, cp: e.target.value }))}
                  placeholder="Código Postal"
                  style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
                />
                <input
                  value={clientDraft.ciudad}
                  onChange={(e) => setClientDraft(d => ({ ...d, ciudad: e.target.value }))}
                  placeholder="Ciudad"
                  style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={saveEditClient} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                  Guardar
                </button>
                <button className="btn" onClick={closeEditClient} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '13px', fontWeight: 600 }}>
                  Cancela
                </button>
              </div>
            </div>
          </div>
        )}

        {section === 'calendario' && (() => {
          const firstWeekday = (new Date(CAL_YEAR, CAL_MONTH, 1).getDay() + 6) % 7; // 0 = lunes
          const daysInMonth = new Date(CAL_YEAR, CAL_MONTH + 1, 0).getDate();
          const cells = [];
          for (let i = 0; i < firstWeekday; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);
          const today = 13;
          const monthLabel = new Date(CAL_YEAR, CAL_MONTH, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

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
                {WEEKDAY_LABELS.map(w => (
                  <div key={w} style={{ background: '#FAFAF8', padding: '8px 0', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#9A9D93' }}>{w}</div>
                ))}
                {cells.map((d, i) => {
                  const worked = d ? (DAILY_WORK[d] || []) : [];
                  const isToday = d === today;
                  return (
                    <div key={i} style={{
                      background: '#FFFFFF', minHeight: '84px', padding: '6px 8px',
                      display: 'flex', flexDirection: 'column', gap: '6px',
                      border: isToday ? '2px solid #7FB35C' : 'none',
                      opacity: d ? 1 : 0.4,
                    }}>
                      {d && (
                        <>
                          <span style={{ fontSize: '12px', fontWeight: isToday ? 700 : 500, color: isToday ? '#5C8A3C' : '#20231F' }}>{d}</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {worked.map(pid => {
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
                {projects.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#5A5D55' }}>{p.name}</span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {!IMPLEMENTED_SECTIONS.includes(section) && (
          <>
            <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 10px' }}>
              {ALL_NAV_ITEMS.find(i => i.id === section)?.label}
            </h1>
            <div style={{
              border: '1px dashed #E5E5E0', borderRadius: '12px', padding: '48px 20px',
              textAlign: 'center', color: '#9A9D93', fontSize: '13px', marginTop: '20px',
            }}>
              Todavía no hemos diseñado esta sección — iremos entrando en cada una.
            </div>
          </>
        )}

        {section === 'configuracion' && (
          <>
            <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 20px' }}>Configuración</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Modo de registro</div>
                <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '12px' }}>
                  En automático, el tiempo se asigna solo según tus reglas. En manual, tú decides cuándo empieza y termina cada sesión.
                </div>
                <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden' }}>
                  {[{ id: 'automatico', label: 'Automático' }, { id: 'manual', label: 'Manual' }].map((opt, i) => {
                    const active = mode === opt.id;
                    return (
                      <button key={opt.id} className="pill-btn" onClick={() => setMode(opt.id)} style={{
                        border: 'none', padding: '7px 16px', fontSize: '12.5px', fontWeight: 500,
                        background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                        borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                        display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        {active && <Check size={12} strokeWidth={2.5} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>Abrir al iniciar sesión</div>
                  <div style={{ fontSize: '12px', color: '#9A9D93' }}>La app arrancará sola con el ordenador.</div>
                </div>
                <div className="switch" onClick={() => setLaunchAtLogin(v => !v)} style={{
                  width: '38px', height: '22px', borderRadius: '11px', flexShrink: 0,
                  background: launchAtLogin ? '#7FB35C' : '#DADCD5', position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute', top: '2px', left: launchAtLogin ? '18px' : '2px',
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.15s ease',
                  }} />
                </div>
              </div>

              <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#7FB35C" strokeWidth={2} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Permiso de accesibilidad</div>
                  <div style={{ fontSize: '12px', color: '#9A9D93' }}>Concedido — necesario para leer la ventana activa.</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
