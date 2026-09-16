import { Info, PlusCircle, Settings, Trash2, X } from 'lucide-react';
import { TAG_COLORS } from '../lib/colors';
import { ROLE_OPTIONS } from '../lib/types';
import type { Project } from '../lib/types';

export interface ProjectDraft {
  name: string;
  color: string;
  owner: string;
  role: string;
  description: string;
  phases: string[];
  keywords: string;
}

export function draftFromProject(project: Project, keywords: string): ProjectDraft {
  return {
    name: project.name,
    color: project.color || TAG_COLORS[0].hex,
    owner: project.owner || 'Tú',
    role: project.role || 'Project Manager',
    description: project.description || '',
    phases: project.phases && project.phases.length ? [...project.phases] : ['Fase 1'],
    keywords,
  };
}

export function EditProjectPanel({
  draft,
  onChange,
  onSave,
  onClose,
}: {
  draft: ProjectDraft;
  onChange: (updater: (d: ProjectDraft) => ProjectDraft) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const updatePhase = (idx: number, val: string) =>
    onChange((d) => {
      const phases = [...d.phases];
      phases[idx] = val;
      return { ...d, phases };
    });
  const addPhase = () => onChange((d) => ({ ...d, phases: [...d.phases, `Fase ${d.phases.length + 1}`] }));
  const removePhase = (idx: number) => onChange((d) => ({ ...d, phases: d.phases.filter((_, i) => i !== idx) }));

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(30,32,28,0.35)', display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end', zIndex: 50 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '440px', maxWidth: '90vw', height: '100%', overflowY: 'auto', background: '#FFFFFF', boxShadow: '-16px 0 48px rgba(0,0,0,0.22)', padding: '24px', animation: 'slideInPanel 0.18s ease-out' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="qs" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Editar Proyecto</h2>
          <button className="btn" onClick={onClose} style={{ background: 'none', border: 'none', display: 'flex' }}>
            <X size={18} color="#9A9D93" />
          </button>
        </div>

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Cliente</div>
        <input
          value={draft.name}
          onChange={(e) => onChange((d) => ({ ...d, name: e.target.value }))}
          style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8', marginBottom: '14px' }}
        />

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Color</div>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '18px' }}>
          {TAG_COLORS.map((c) => (
            <span
              key={c.hex}
              className="swatch"
              onClick={() => onChange((d) => ({ ...d, color: c.hex }))}
              style={{ width: '15px', height: '15px', borderRadius: '50%', background: c.hex, boxShadow: draft.color === c.hex ? `0 0 0 2px #FFFFFF, 0 0 0 3px ${c.hex}` : 'none' }}
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
            onChange={(e) => onChange((d) => ({ ...d, owner: e.target.value }))}
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', fontSize: '13px', color: '#20231F' }}
          />
          <select
            value={draft.role}
            onChange={(e) => onChange((d) => ({ ...d, role: e.target.value }))}
            style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px 8px', fontSize: '12px', outline: 'none' }}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button className="btn" onClick={() => onChange((d) => ({ ...d, owner: '' }))} aria-label="Quitar persona" style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '6px', background: 'none', display: 'flex' }}>
            <Trash2 size={13} color="#B8BBB1" />
          </button>
        </div>

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Descripción</div>
        <textarea
          value={draft.description}
          onChange={(e) => onChange((d) => ({ ...d, description: e.target.value }))}
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
              onChange={(e) => updatePhase(i, e.target.value)}
              style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
            />
            {draft.phases.length > 1 && (
              <button className="btn" onClick={() => removePhase(i)} style={{ border: '1px solid #E5E5E0', borderRadius: '7px', padding: '0 10px', background: 'none' }}>
                <X size={13} color="#9A9D93" />
              </button>
            )}
          </div>
        ))}
        <div className="btn" onClick={addPhase} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#5B8DBF', fontSize: '12.5px', fontWeight: 500, marginBottom: '18px' }}>
          <PlusCircle size={14} /> Añadir fase
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F' }}>Palabras clave (reglas)</span>
          <Info size={12} color="#9A9D93" />
        </div>
        <textarea
          value={draft.keywords}
          onChange={(e) => onChange((d) => ({ ...d, keywords: e.target.value }))}
          placeholder="p. ej. figma.com/acme, notion.so/proyecto, vscode — proyecto"
          rows={3}
          style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8', marginBottom: '20px', resize: 'vertical', fontFamily: "'JetBrains Mono', monospace" }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={onSave} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            Guardar
          </button>
          <button className="btn" onClick={onClose} style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #E5E5E0', background: '#fff', color: '#5A5D55', fontSize: '13px', fontWeight: 600 }}>
            Cancela
          </button>
        </div>
      </div>
    </div>
  );
}
