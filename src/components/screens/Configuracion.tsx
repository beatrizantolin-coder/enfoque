import { invoke } from '@tauri-apps/api/core';
import { Check, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AppData } from '../../hooks/useAppData';

type AccessibilityStatus = 'concedido' | 'denegado' | 'desconocido';

export function Configuracion({ data }: { data: AppData }) {
  const { mode, setMode, launchAtLogin, setLaunchAtLogin } = data;
  const [accessibility, setAccessibility] = useState<AccessibilityStatus>('desconocido');

  useEffect(() => {
    let cancelled = false;
    // Comando de Rust `accessibility_status`, expuesto como "accessibility-status"
    // (ver src-tauri/src/commands.rs). Solo existe de verdad en macOS; en
    // cualquier otro entorno (incluida esta comprobación en un navegador de
    // desarrollo) se queda en "desconocido".
    invoke<boolean>('accessibility-status')
      .then((granted) => {
        if (!cancelled) setAccessibility(granted ? 'concedido' : 'denegado');
      })
      .catch(() => {
        if (!cancelled) setAccessibility('desconocido');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const accessibilityCopy: Record<AccessibilityStatus, string> = {
    concedido: 'Concedido — necesario para leer la ventana activa.',
    denegado: 'No concedido — ábrelo en Ajustes del Sistema › Privacidad y seguridad › Accesibilidad.',
    desconocido: 'No se ha podido comprobar el estado (solo disponible en la app nativa de macOS).',
  };

  return (
    <>
      <h1 className="qs" style={{ fontSize: '22px', fontWeight: 600, margin: '0 0 20px' }}>Configuración</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Modo de registro</div>
          <div style={{ fontSize: '12px', color: '#9A9D93', marginBottom: '12px' }}>
            En automático, el tiempo se asigna solo según tus reglas. En manual, tú decides cuándo empieza y termina cada sesión.
          </div>
          <div style={{ display: 'inline-flex', border: '1px solid #E5E5E0', borderRadius: '8px', overflow: 'hidden' }}>
            {([{ id: 'automatico', label: 'Automático' }, { id: 'manual', label: 'Manual' }] as const).map((opt, i) => {
              const active = mode === opt.id;
              return (
                <button
                  key={opt.id}
                  className="pill-btn"
                  onClick={() => setMode(opt.id)}
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
        </div>

        <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>Abrir al iniciar sesión</div>
            <div style={{ fontSize: '12px', color: '#9A9D93' }}>La app arrancará sola con el ordenador.</div>
          </div>
          <div
            className="switch"
            onClick={() => setLaunchAtLogin(!launchAtLogin)}
            style={{ width: '38px', height: '22px', borderRadius: '11px', flexShrink: 0, background: launchAtLogin ? '#7FB35C' : '#DADCD5', position: 'relative' }}
          >
            <span
              style={{
                position: 'absolute', top: '2px', left: launchAtLogin ? '18px' : '2px',
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.15s ease',
              }}
            />
          </div>
        </div>

        <div style={{ background: '#FAFAF8', border: '1px solid #EBEBE6', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color={accessibility === 'concedido' ? '#7FB35C' : '#9A9D93'} strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 500 }}>Permiso de accesibilidad</div>
            <div style={{ fontSize: '12px', color: '#9A9D93' }}>{accessibilityCopy[accessibility]}</div>
          </div>
        </div>
      </div>
    </>
  );
}
