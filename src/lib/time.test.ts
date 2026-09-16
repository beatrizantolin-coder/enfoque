import { describe, expect, it } from 'vitest';
import { entrySeconds, formatHM, lastNDates, timeToMinutes } from './time';

describe('formatHM', () => {
  it('muestra horas y minutos cuando hay al menos una hora', () => {
    expect(formatHM(2 * 3600 + 50 * 60)).toBe('2h 50m');
  });

  it('muestra solo minutos por debajo de una hora', () => {
    expect(formatHM(35 * 60)).toBe('35m');
  });

  it('nunca baja de 0', () => {
    expect(formatHM(-100)).toBe('0m');
  });
});

describe('timeToMinutes', () => {
  it('parsea HH:MM', () => {
    expect(timeToMinutes('09:15')).toBe(9 * 60 + 15);
  });

  it('rechaza formatos inválidos', () => {
    expect(timeToMinutes('9-15')).toBeNull();
    expect(timeToMinutes('')).toBeNull();
    expect(timeToMinutes(undefined)).toBeNull();
  });
});

describe('entrySeconds', () => {
  it('calcula la duración cuando fin > inicio', () => {
    expect(entrySeconds({ start: '09:15', end: '12:05' })).toBe((12 * 60 + 5 - (9 * 60 + 15)) * 60);
  });

  it('devuelve 0 si fin <= inicio', () => {
    expect(entrySeconds({ start: '12:00', end: '12:00' })).toBe(0);
    expect(entrySeconds({ start: '12:00', end: '11:00' })).toBe(0);
  });

  it('devuelve 0 con horas inválidas', () => {
    expect(entrySeconds({ start: '', end: '10:00' })).toBe(0);
  });
});

describe('lastNDates', () => {
  it('devuelve n fechas ascendentes terminando en endISO', () => {
    expect(lastNDates(3, '2026-08-13')).toEqual(['2026-08-11', '2026-08-12', '2026-08-13']);
  });

  it('cruza correctamente el límite de mes', () => {
    expect(lastNDates(3, '2026-03-01')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });
});
