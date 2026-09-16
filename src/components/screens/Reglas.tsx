import { Check, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { AppData } from '../../hooks/useAppData';

export function Reglas({ data }: { data: AppData }) {
  const { projects, rules, createRule, deleteRule } = data;
  const [order, setOrder] = useState<'regla-proyecto' | 'proyecto-regla'>('regla-proyecto');
  const [showAdd, setShowAdd] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newRuleProject, setNewRuleProject] = useState(projects[0]?.id ?? '');
  const [error, setError] = useState('');

  const projectById = (id: string) => projects.find((p) => p.id === id);

  const addRule = async () => {
    const kw = newKeyword.trim();
    if (!kw) { setError('Escribe una palabra clave o parte del título.'); return; }
    if (!newRuleProject) { setError('Elige un proyecto.'); return; }
    await createRule({ id: `r_${Date.now()}`, keyword: kw, projectId: newRuleProject });
    setNewKeyword('');
    setShowAdd(false);
    setError('');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: 0 }}>Reglas</h1>
        <button
          className="btn"
          onClick={() => setShowAdd(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}
        >
          <Plus size={13} /> Regla
        </button>
      </div>
      <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '14px' }}>
        Cuando el título de la app o pestaña activa contenga esto, se suma al proyecto.
      </div>

      <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
        {([{ id: 'regla-proyecto', label: 'Regla → Proyecto' }, { id: 'proyecto-regla', label: 'Proyecto → Regla' }] as const).map((opt, i) => {
          const active = order === opt.id;
          return (
            <button
              key={opt.id}
              className="pill-btn"
              onClick={() => setOrder(opt.id)}
              style={{
                border: 'none', padding: '7px 16px', fontSize: '12.5px', fontWeight: 500,
                background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
                borderRight: i === 0 ? '1px solid #E5E5E0' : 'none',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {active && <Check size={12} strokeWidth={2.5} />}
              {opt.label}
            </button>
          );
        })}
      </div>

      {order === 'regla-proyecto' ? (
        <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
          {rules.map((r) => {
            const proj = projectById(r.projectId);
            return (
              <div key={r.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderBottom: '1px solid #F1F1EC' }}>
                <span className="mono" style={{ fontSize: '12px', background: '#F1F1EC', borderRadius: '6px', padding: '5px 9px', flex: '0 1 auto' }}>{r.keyword}</span>
                {proj ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: proj.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{proj.name}</span>
                  </span>
                ) : (
                  <span style={{ flex: 1, fontSize: '13px', color: '#B8BBB1' }}>(proyecto eliminado)</span>
                )}
                <button className="btn" onClick={() => deleteRule(r.id)} aria-label="Eliminar regla" style={{ background: 'none', border: 'none', display: 'flex' }}>
                  <Trash2 size={13} color="#B8BBB1" />
                </button>
              </div>
            );
          })}
          {rules.length === 0 && <div style={{ padding: '18px 14px', fontSize: '12.5px', color: '#9A9D93' }}>Todavía no has añadido ninguna regla.</div>}
        </div>
      ) : (
        <div style={{ border: '1px solid #EBEBE6', borderRadius: '12px', overflow: 'hidden' }}>
          {projects.map((p) => {
            const projRules = rules.filter((r) => r.projectId === p.id);
            return (
              <div key={p.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: '#FAFAF8', borderBottom: '1px solid #EBEBE6' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</span>
                </div>
                {projRules.length === 0 && (
                  <div style={{ padding: '10px 14px 10px 32px', fontSize: '12px', color: '#9A9D93', borderBottom: '1px solid #F1F1EC' }}>Sin reglas asociadas.</div>
                )}
                {projRules.map((r) => (
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

      {showAdd && (
        <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px', marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Nueva regla</span>
            <button className="btn" onClick={() => { setShowAdd(false); setError(''); }} style={{ background: 'none', border: 'none', display: 'flex' }}>
              <X size={14} color="#9A9D93" />
            </button>
          </div>
          <input
            value={newKeyword}
            onChange={(e) => { setNewKeyword(e.target.value); if (error) setError(''); }}
            placeholder="p. ej. notion.so/finanzas"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && addRule()}
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '8px 10px', fontSize: '13px', marginBottom: '8px', outline: 'none', fontFamily: "'JetBrains Mono', monospace" }}
          />
          <select
            value={newRuleProject}
            onChange={(e) => setNewRuleProject(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '8px 10px', fontSize: '13px', marginBottom: '10px', outline: 'none' }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {error && <div style={{ fontSize: '12px', color: '#E2725B', marginBottom: '8px' }}>{error}</div>}
          <button className="btn" onClick={addRule} style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', background: '#7FB35C', color: '#fff', fontSize: '12.5px', fontWeight: 500 }}>
            Crear regla
          </button>
        </div>
      )}
    </>
  );
}
