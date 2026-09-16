import { ChevronDown, ChevronLeft, ChevronRight, Copy, MoreVertical, Pencil, Play, Plus, Settings, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AppData } from '../../hooks/useAppData';
import { entrySeconds, formatHM, timeToMinutes, todayISO } from '../../lib/time';
import type { Project } from '../../lib/types';

const emptyEntryForm = { projectId: '', app: '', start: '', end: '' };

function shiftDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const isToday = iso === todayISO();
  const monthDay = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  if (isToday) return `Hoy, ${monthDay}`;
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${monthDay}`;
}

export function RegistroHoy({ data }: { data: AppData }) {
  const { projects, entries, selectedDate, setSelectedDate, createEntry, updateEntry, deleteEntry } = data;

  const [dayTab, setDayTab] = useState<'dia' | 'semana'>('dia');
  const [bulkEdit, setBulkEdit] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entryForm, setEntryForm] = useState(emptyEntryForm);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryError, setEntryError] = useState('');

  const projectById = (id: string): Project | undefined => projects.find((p) => p.id === id);
  const entriesTotal = useMemo(() => entries.reduce((s, e) => s + entrySeconds(e), 0), [entries]);

  const openAddEntry = () => {
    setEditingEntryId(null);
    setEntryForm({ ...emptyEntryForm, projectId: projects[0]?.id || '' });
    setEntryError('');
    setShowAddEntry(true);
  };
  const openEditEntry = (entry: (typeof entries)[number]) => {
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
  const validateEntryForm = (): string => {
    if (!entryForm.projectId) return 'Elige un proyecto.';
    const startMin = timeToMinutes(entryForm.start);
    const endMin = timeToMinutes(entryForm.end);
    if (startMin === null || endMin === null) return 'Rellena la hora de inicio y fin.';
    if (endMin <= startMin) return 'La hora de fin debe ser posterior a la de inicio.';
    return '';
  };
  const saveNewEntry = async () => {
    const msg = validateEntryForm();
    if (msg) { setEntryError(msg); return; }
    await createEntry({
      id: `e_${Date.now()}`,
      projectId: entryForm.projectId,
      app: entryForm.app.trim() || 'Entrada manual',
      date: selectedDate,
      start: entryForm.start,
      end: entryForm.end,
    });
    setShowAddEntry(false);
    setEntryError('');
  };
  const saveEditedEntry = async () => {
    const msg = validateEntryForm();
    if (msg) { setEntryError(msg); return; }
    if (!editingEntryId) return;
    await updateEntry(editingEntryId, {
      projectId: entryForm.projectId,
      app: entryForm.app.trim() || 'Entrada manual',
      start: entryForm.start,
      end: entryForm.end,
    });
    setEditingEntryId(null);
    setEntryError('');
  };
  const handleDeleteEntry = async (id: string) => {
    await deleteEntry(id);
    if (editingEntryId === id) cancelEntryForm();
  };
  const duplicateLastEntry = async () => {
    if (entries.length === 0) return;
    const last = entries[entries.length - 1];
    await createEntry({
      id: `e_${Date.now()}`,
      projectId: last.projectId,
      app: last.app,
      date: selectedDate,
      start: last.start,
      end: last.end,
    });
  };

  const entryFormFields = (onSave: () => void) => (
    <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '12px', margin: '6px 0' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <select
          value={entryForm.projectId}
          onChange={(ev) => setEntryForm((f) => ({ ...f, projectId: ev.target.value }))}
          style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
        >
          <option value="">Elige un proyecto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          value={entryForm.app}
          onChange={(ev) => setEntryForm((f) => ({ ...f, app: ev.target.value }))}
          placeholder="App o descripción (opcional)"
          style={{ flex: '1 1 160px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 9px', fontSize: '13px', outline: 'none' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <input
          type="time"
          value={entryForm.start}
          onChange={(ev) => setEntryForm((f) => ({ ...f, start: ev.target.value }))}
          style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }}
        />
        <span style={{ color: '#9A9D93', fontSize: '13px' }}>—</span>
        <input
          type="time"
          value={entryForm.end}
          onChange={(ev) => setEntryForm((f) => ({ ...f, end: ev.target.value }))}
          style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '13px', outline: 'none' }}
        />
      </div>
      {entryError && <div style={{ fontSize: '12px', color: '#E2725B', marginBottom: '8px' }}>{entryError}</div>}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn" onClick={onSave} style={{ padding: '6px 14px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}>
          {editingEntryId ? 'Guardar' : 'Añadir'}
        </button>
        <button className="btn" onClick={cancelEntryForm} style={{ padding: '6px 14px', borderRadius: '7px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '12.5px', fontWeight: 500 }}>
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
        <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Registro de hoy</h1>
        <Settings size={16} color="#9A9D93" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            className="icon-btn"
            onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
            style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronLeft size={14} color="#5A5D55" />
          </div>
          <div className="icon-btn" style={{ display: 'flex', alignItems: 'center', gap: '2px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px' }}>
            <ChevronDown size={13} color="#5A5D55" />
          </div>
          <div
            className="icon-btn"
            onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
            style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronRight size={14} color="#5A5D55" />
          </div>
          <span style={{ fontSize: '14.5px', fontWeight: 500, marginLeft: '6px', textTransform: 'capitalize' }}>
            {formatDayLabel(selectedDate)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden' }}>
            {(['dia', 'semana'] as const).map((tab, i) => (
              <button
                key={tab}
                className="pill-btn"
                onClick={() => setDayTab(tab)}
                style={{
                  border: 'none',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: dayTab === tab ? '#F1F6EC' : '#FFFFFF',
                  color: dayTab === tab ? '#5C8A3C' : '#5A5D55',
                  borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                }}
              >
                {tab === 'dia' ? 'Día' : 'Semana'}
              </button>
            ))}
          </div>
          <div className="icon-btn" style={{ width: '30px', height: '30px', border: '1px solid #E5E5E0', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MoreVertical size={15} color="#5A5D55" />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex', alignItems: 'center', gap: '10px', border: '1.5px solid #7FB35C',
          borderRadius: '10px', padding: '11px 14px', marginBottom: '22px', boxShadow: '0 0 0 3px #EDF5E6',
        }}
      >
        <span style={{ flex: 1, fontSize: '14px', color: '#9A9D93' }}>¿En qué proyecto estás trabajando?</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#5A5D55', borderRight: '1px solid #E5E5E0', paddingRight: '10px' }}>
          Sin proyecto <ChevronDown size={12} />
        </div>
        <div className="btn" style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#7FB35C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Play size={13} color="#FFFFFF" fill="#FFFFFF" />
        </div>
      </div>

      {dayTab === 'semana' ? (
        <div style={{ border: '1px dashed #E5E5E0', borderRadius: '12px', padding: '48px 20px', textAlign: 'center', color: '#9A9D93', fontSize: '13px' }}>
          La vista semanal todavía no está diseñada — vuelve a la vista de Día.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '3px', height: '14px', background: '#D7D9D2', borderRadius: '2px' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B6E64', flex: 1 }}>Día laboral</span>
            <span className="mono" style={{ fontSize: '12.5px', color: '#5A5D55', marginRight: '2px' }}>{formatHM(entriesTotal)}</span>
            <div className="header-icon" onClick={openAddEntry} aria-label="Añadir entrada" style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} color="#5A5D55" />
            </div>
            <div className="header-icon" onClick={duplicateLastEntry} aria-label="Duplicar última entrada" style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Copy size={13} color="#5A5D55" />
            </div>
            <div
              className="header-icon"
              onClick={() => setBulkEdit((v) => !v)}
              aria-label="Activar edición"
              style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bulkEdit ? '#EDEEE8' : 'transparent' }}
            >
              <Pencil size={13} color={bulkEdit ? '#5C8A3C' : '#5A5D55'} />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            {entries.map((e) => {
              const proj = projectById(e.projectId);
              if (editingEntryId === e.id) return <div key={e.id}>{entryFormFields(saveEditedEntry)}</div>;
              if (!proj) return null;
              return (
                <div key={e.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 8px', borderBottom: '1px solid #F1F1EC' }}>
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
                    <button className="header-icon btn" onClick={() => handleDeleteEntry(e.id)} aria-label="Eliminar entrada" style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={12} color="#9A9D93" />
                    </button>
                  </div>
                </div>
              );
            })}

            {showAddEntry && entryFormFields(saveNewEntry)}

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
    </>
  );
}
