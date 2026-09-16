import { ChevronRight, LineChart, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { draftFromProject, EditProjectPanel, type ProjectDraft } from '../EditProjectPanel';
import type { AppData } from '../../hooks/useAppData';
import { nextPaletteColor } from '../../lib/colors';
import type { Rule } from '../../lib/types';
import { ProyectoDetalle } from './ProyectoDetalle';

export function Proyectos({ data }: { data: AppData }) {
  const { projects, rules, createProject, updateProject, deleteProject, replaceProjectRules } = data;
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProjectDraft | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));

  const createFromSearch = async () => {
    const name = search.trim();
    if (!name) return;
    await createProject({ id: `proj_${Date.now()}`, name, color: nextPaletteColor(projects.length) });
    setSearch('');
  };

  const rulesKeywords = (projectRules: Rule[]) => projectRules.map((r) => r.keyword).join(', ');

  const openEdit = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setDraft(draftFromProject(project, rulesKeywords(rules.filter((r) => r.projectId === id))));
    setEditingId(id);
  };
  const closeEdit = () => {
    setEditingId(null);
    setDraft(null);
  };
  const saveEdit = async () => {
    if (!draft || !editingId) return;
    await updateProject(editingId, {
      name: draft.name.trim() || undefined,
      color: draft.color,
      owner: draft.owner,
      role: draft.role,
      description: draft.description,
      phases: draft.phases.filter((f) => f.trim()),
    });
    const keywords = draft.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    await replaceProjectRules(editingId, keywords);
    closeEdit();
  };

  if (detailId) {
    const project = projects.find((p) => p.id === detailId);
    if (!project) {
      setDetailId(null);
      return null;
    }
    return <ProyectoDetalle project={project} rules={rules.filter((r) => r.projectId === project.id)} onBack={() => setDetailId(null)} />;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Proyectos</h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') createFromSearch(); }}
          placeholder="Buscar"
          style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
        />
        <button
          className="btn"
          onClick={createFromSearch}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', whiteSpace: 'nowrap', borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600 }}
        >
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
        {filtered.map((p) => (
          <div
            key={p.id}
            className="row"
            onClick={() => openEdit(p.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #F1F1EC', cursor: 'pointer' }}
          >
            {p.phases && p.phases.length > 1 ? (
              <ChevronRight size={14} color="#B3B6AB" style={{ flexShrink: 0 }} />
            ) : (
              <span style={{ width: '14px', flexShrink: 0 }} />
            )}
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#20231F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#9A9D93' }}>{p.owner || 'Tú'}</div>
            </div>
            <button
              className="btn"
              onClick={(ev) => { ev.stopPropagation(); setDetailId(p.id); }}
              aria-label="Ver detalle"
              title="Ver detalle"
              style={{ background: 'none', border: 'none', display: 'flex', padding: '4px' }}
            >
              <LineChart size={15} color="#9A9D93" />
            </button>
            <button
              className="btn"
              onClick={(ev) => { ev.stopPropagation(); deleteProject(p.id); }}
              aria-label="Eliminar"
              title="Eliminar"
              style={{ background: 'none', border: 'none', display: 'flex', padding: '4px' }}
            >
              <Trash2 size={14} color="#B8BBB1" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '20px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Sin resultados para "{search}".</div>
        )}
      </div>

      {editingId && draft && (
        <EditProjectPanel draft={draft} onChange={(updater) => setDraft((d) => (d ? updater(d) : d))} onSave={saveEdit} onClose={closeEdit} />
      )}
    </>
  );
}
