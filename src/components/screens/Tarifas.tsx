import { Check, PlusCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AppData } from '../../hooks/useAppData';
import { ROLE_OPTIONS } from '../../lib/types';
import type { RateType } from '../../lib/types';

export function Tarifas({ data }: { data: AppData }) {
  const { rates, createRate, updateRate, deleteRate } = data;
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const roleRates = rates.filter((r) => r.role === selectedRole);

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
        {roleRates.map((r) => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #F1F1EC', gap: '10px' }}>
            <input
              value={r.name}
              onChange={(e) => updateRate(r.id, { name: e.target.value })}
              placeholder="p. ej. Hora standard"
              style={{ flex: '1 1 200px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 10px', fontSize: '13px', outline: 'none', background: '#FAFAF8' }}
            />
            <div style={{ width: '130px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input
                type="number"
                value={r.value}
                onChange={(e) => updateRate(r.id, { value: Number(e.target.value) })}
                style={{ width: '80px', border: '1px solid #E5E5E0', borderRadius: '7px', padding: '7px 8px', fontSize: '13px', outline: 'none' }}
              />
              <span style={{ fontSize: '12px', color: '#9A9D93' }}>€/h</span>
            </div>
            <div style={{ width: '160px', display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '7px', overflow: 'hidden' }}>
              {([{ id: 'ingresos', label: 'Ingresos' }, { id: 'costo', label: 'Costo' }] as { id: RateType; label: string }[]).map((opt, i) => {
                const active = r.type === opt.id;
                return (
                  <button
                    key={opt.id}
                    className="pill-btn"
                    onClick={() => updateRate(r.id, { type: opt.id })}
                    style={{
                      border: 'none', flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: 500,
                      background: active ? '#F1F6EC' : '#FFFFFF', color: active ? '#5C8A3C' : '#5A5D55',
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
        onClick={() => createRate({ id: `rate_${Date.now()}`, role: selectedRole })}
        style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '14px', color: '#5B8DBF', fontSize: '13.5px', fontWeight: 500 }}
      >
        <PlusCircle size={17} /> Nueva tarifa de facturación
      </div>
    </>
  );
}
