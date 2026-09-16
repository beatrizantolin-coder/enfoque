import { Trash2, X } from 'lucide-react';
import { TAG_COLORS } from '../lib/colors';
import { TIER_OPTIONS } from '../lib/types';
import type { Client } from '../lib/types';

export interface ClientDraft {
  name: string;
  color: string;
  nif: string;
  tipo: Client['tipo'];
  porcentaje: number;
  owner: string;
  calle: string;
  cp: string;
  ciudad: string;
}

export function draftFromClient(client: Client): ClientDraft {
  return {
    name: client.name,
    color: client.color || TAG_COLORS[0].hex,
    nif: client.nif || '',
    tipo: client.tipo || 'gran',
    porcentaje: client.porcentaje ?? TIER_OPTIONS.find((t) => t.id === (client.tipo || 'gran'))?.pct ?? 0,
    owner: client.owner || '',
    calle: client.calle || '',
    cp: client.cp || '',
    ciudad: client.ciudad || '',
  };
}

export function EditClientPanel({
  draft,
  onChange,
  onSave,
  onClose,
}: {
  draft: ClientDraft;
  onChange: (updater: (d: ClientDraft) => ClientDraft) => void;
  onSave: () => void;
  onClose: () => void;
}) {
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
          <h2 className="qs" style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Editar Cliente</h2>
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

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>NIF</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <input
            value={draft.nif}
            onChange={(e) => onChange((d) => ({ ...d, nif: e.target.value }))}
            placeholder="12345678A"
            style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
          />
          <button className="btn" onClick={() => onChange((d) => ({ ...d, nif: '' }))} style={{ border: '1px solid #E5E5E0', borderRadius: '8px', padding: '0 12px', background: 'none' }}>
            <Trash2 size={14} color="#B8BBB1" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Tipo</div>
            <select
              value={draft.tipo}
              onChange={(e) => {
                const tipo = e.target.value as Client['tipo'];
                const pct = TIER_OPTIONS.find((t) => t.id === tipo)?.pct ?? draft.porcentaje;
                onChange((d) => ({ ...d, tipo, porcentaje: pct }));
              }}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
            >
              {TIER_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div style={{ width: '110px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Porcentaje</div>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', background: '#FAFAF8' }}>
              <input
                type="number"
                value={draft.porcentaje}
                onChange={(e) => onChange((d) => ({ ...d, porcentaje: Number(e.target.value) }))}
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
            value={draft.owner}
            onChange={(e) => onChange((d) => ({ ...d, owner: e.target.value }))}
            placeholder="Nombre de contacto"
            style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
          />
          <button className="btn" onClick={() => onChange((d) => ({ ...d, owner: '' }))} style={{ border: '1px solid #E5E5E0', borderRadius: '8px', padding: '0 12px', background: 'none' }}>
            <Trash2 size={14} color="#B8BBB1" />
          </button>
        </div>

        <div style={{ borderTop: '1px solid #EBEBE6', margin: '4px 0 18px' }} />

        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#20231F', marginBottom: '8px' }}>Dirección</div>
        <input
          value={draft.calle}
          onChange={(e) => onChange((d) => ({ ...d, calle: e.target.value }))}
          placeholder="Calle"
          style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8', marginBottom: '8px' }}
        />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            value={draft.cp}
            onChange={(e) => onChange((d) => ({ ...d, cp: e.target.value }))}
            placeholder="Código Postal"
            style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
          />
          <input
            value={draft.ciudad}
            onChange={(e) => onChange((d) => ({ ...d, ciudad: e.target.value }))}
            placeholder="Ciudad"
            style={{ flex: 1, border: '1px solid #E5E5E0', borderRadius: '8px', padding: '9px 11px', fontSize: '13.5px', outline: 'none', background: '#FAFAF8' }}
          />
        </div>

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
