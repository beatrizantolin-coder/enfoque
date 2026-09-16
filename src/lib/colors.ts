export interface TagColor {
  name: string;
  hex: string;
}

// Paleta compartida con Conta-Nice (que además incluye #A97C50, no usada aquí).
export const TAG_COLORS: TagColor[] = [
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

export function nextPaletteColor(usedCount: number): string {
  return TAG_COLORS[usedCount % TAG_COLORS.length].hex;
}
