import type { AseguradoraId } from './data/aseguradoras';
import type { Periodo, Simulacion } from './calc';
import type { EspecialidadFiltro } from './state';

export interface MetaKPIs {
  totalCasos: number;
  totalMonto: number;
  totalMargen: number;
  montoMedio: number;
  margenPct: number;
}

export interface MetaComercial {
  id: string;
  nombre: string;
  createdAt: number;
  fechaObjetivo?: number;
  aseguradoraId: AseguradoraId;
  especialidad: EspecialidadFiltro;
  periodo: Periodo;
  simulacionSnapshot: Simulacion;
  kpiBaseline: MetaKPIs;
  kpiObjetivo: MetaKPIs;
  notas?: string;
}

export function nuevoMetaId(): string {
  return `meta_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export type EstadoMeta =
  | 'sin_data'
  | 'cumplida'
  | 'cerca_objetivo'
  | 'en_progreso'
  | 'alejandose'
  | 'sin_movimiento';

export interface EvaluacionMeta {
  gapMontoMedioAbs: number;
  gapMontoMedioPct: number;
  gapMargenAbs: number;
  gapMargenPct: number;
  progresoPct: number;
  estado: EstadoMeta;
  diasRestantes?: number;
}

const TOLERANCIA_MM_PCT = 0.02;

export function evaluarMeta(meta: MetaComercial, kpiActual: MetaKPIs, now = Date.now()): EvaluacionMeta {
  const baseline = meta.kpiBaseline.montoMedio;
  const objetivo = meta.kpiObjetivo.montoMedio;
  const actual = kpiActual.montoMedio;

  const gapMontoMedioAbs = actual - objetivo;
  const gapMontoMedioPct = objetivo !== 0 ? gapMontoMedioAbs / objetivo : 0;
  const gapMargenAbs = kpiActual.totalMargen - meta.kpiObjetivo.totalMargen;
  const gapMargenPct =
    meta.kpiObjetivo.totalMargen !== 0
      ? gapMargenAbs / meta.kpiObjetivo.totalMargen
      : 0;

  const totalMovimiento = objetivo - baseline;
  const movimientoActual = actual - baseline;
  const progresoPct =
    Math.abs(totalMovimiento) < 1
      ? 0
      : Math.max(-1, Math.min(2, movimientoActual / totalMovimiento));

  let estado: EstadoMeta;
  if (Math.abs(gapMontoMedioPct) <= TOLERANCIA_MM_PCT) estado = 'cumplida';
  else if (Math.abs(totalMovimiento) < 1) estado = 'sin_data';
  else if (progresoPct >= 0.85) estado = 'cerca_objetivo';
  else if (progresoPct >= 0.1) estado = 'en_progreso';
  else if (progresoPct < 0) estado = 'alejandose';
  else estado = 'sin_movimiento';

  const diasRestantes = meta.fechaObjetivo
    ? Math.ceil((meta.fechaObjetivo - now) / (1000 * 60 * 60 * 24))
    : undefined;

  return {
    gapMontoMedioAbs,
    gapMontoMedioPct,
    gapMargenAbs,
    gapMargenPct,
    progresoPct,
    estado,
    diasRestantes,
  };
}

export const ESTADO_LABEL: Record<EstadoMeta, string> = {
  cumplida: 'Meta cumplida',
  cerca_objetivo: 'Cerca del objetivo',
  en_progreso: 'En progreso',
  sin_movimiento: 'Sin movimiento',
  alejandose: 'Alejándose',
  sin_data: 'Sin movimiento esperado',
};
