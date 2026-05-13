import type { AseguradoraId } from './data/aseguradoras';
import type { EspecialidadId } from './data/especialidades';
import { GUA_REFERENCIA } from './data/gua';
import { PERFIL_ASEGURADORA } from './data/perfiles';
import { SUBPROCEDIMIENTOS, type SubProcedimiento } from './data/procedimientos';

export type Periodo = '12m' | '6m' | 'ytd';
export type Simulacion = Record<string, number>;

export interface ProcOverrideInput {
  ticket?: number;
  margen?: number;
}

export interface OverridesInput {
  procedimientos?: Record<string, ProcOverrideInput>;
  gua?: Record<string, number>;
}

export interface ProcEnriquecido extends SubProcedimiento {
  casos: number;
  ticket: number;
  margen: number;
  monto_total: number;
  margen_total: number;
}

export interface ProcSimulado extends ProcEnriquecido {
  casos_sim: number;
  monto_sim: number;
  margen_sim: number;
  delta: number;
}

export interface KPIs {
  totalCasos: number;
  totalMonto: number;
  totalMargen: number;
  montoMedio: number;
  margenPct: number;
}

export interface Candidato extends ProcEnriquecido {
  score: number;
  potencial_doble: number;
}

const BASE_VOLUMEN: Record<'alta' | 'media' | 'baja', number> = {
  alta: 12,
  media: 18,
  baja: 22,
};

function hash(...args: (string | number)[]): number {
  const s = args.join('-');
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

export function generarDatos(
  aseguradoraId: AseguradoraId,
  especialidadId: EspecialidadId,
  periodo: Periodo = '12m',
  overrides?: OverridesInput,
): ProcEnriquecido[] {
  const perfil = PERFIL_ASEGURADORA[aseguradoraId] ?? PERFIL_ASEGURADORA.gnp;
  const procs = SUBPROCEDIMIENTOS[especialidadId] ?? [];
  const periodoMult = periodo === '12m' ? 1 : periodo === '6m' ? 0.5 : 0.4;
  const procOverrides = overrides?.procedimientos ?? {};

  return procs.map((p) => {
    const ov = procOverrides[p.id] ?? {};
    const baseTicket = ov.ticket ?? p.baseTicket;
    const baseMargen = ov.margen ?? p.baseMargen;
    const seed = hash(aseguradoraId, especialidadId, p.id);
    const varVol = 0.7 + (seed % 60) / 100;
    const varTicket = 0.95 + (seed % 10) / 100;
    const casos = Math.max(
      1,
      Math.round(BASE_VOLUMEN[p.complejidad] * perfil[p.complejidad] * varVol * periodoMult),
    );
    const ticket = Math.round((baseTicket * varTicket) / 1000) * 1000;
    const margen = Math.max(0.08, baseMargen + ((seed % 4) - 2) / 100);
    return {
      ...p,
      casos,
      ticket,
      margen,
      monto_total: casos * ticket,
      margen_total: casos * ticket * margen,
    };
  });
}

export function aplicarSimulacion(datos: ProcEnriquecido[], sim: Simulacion): ProcSimulado[] {
  return datos.map((p) => {
    const delta = sim[p.id] ?? 0;
    const casos_sim = Math.max(0, p.casos + delta);
    return {
      ...p,
      casos_sim,
      monto_sim: casos_sim * p.ticket,
      margen_sim: casos_sim * p.ticket * p.margen,
      delta,
    };
  });
}

export function calcKPIs(datos: ProcEnriquecido[] | ProcSimulado[], useSim = false): KPIs {
  let totalCasos = 0;
  let totalMonto = 0;
  let totalMargen = 0;
  for (const p of datos) {
    if (useSim && 'casos_sim' in p) {
      totalCasos += p.casos_sim;
      totalMonto += p.monto_sim;
      totalMargen += p.margen_sim;
    } else {
      totalCasos += p.casos;
      totalMonto += p.monto_total;
      totalMargen += p.margen_total;
    }
  }
  const montoMedio = totalCasos > 0 ? totalMonto / totalCasos : 0;
  const margenPct = totalMonto > 0 ? totalMargen / totalMonto : 0;
  return { totalCasos, totalMonto, totalMargen, montoMedio, margenPct };
}

export function identificarCandidatos(datos: ProcEnriquecido[]): Candidato[] {
  if (datos.length === 0) return [];
  const tickets = datos.map((p) => p.ticket).sort((a, b) => a - b);
  const margenes = datos.map((p) => p.margen).sort((a, b) => a - b);
  const casos = datos.map((p) => p.casos).sort((a, b) => a - b);
  const p40Ticket = tickets[Math.floor(tickets.length * 0.4)];
  const p60Margen = margenes[Math.floor(margenes.length * 0.6)];
  const p50Casos = casos[Math.floor(casos.length * 0.5)];

  return datos
    .filter((p) => p.ticket <= p40Ticket && p.margen >= p60Margen)
    .map((p) => ({
      ...p,
      score:
        (p.margen / 0.42) * 0.5 +
        ((p40Ticket - p.ticket) / Math.max(p40Ticket, 1)) * 0.3 +
        Math.max(0, (p50Casos - p.casos) / Math.max(p50Casos, 1)) * 0.2,
      potencial_doble: p.casos * p.ticket * p.margen,
    }))
    .sort((a, b) => b.score - a.score);
}

export type SeveridadGUA = 'critica' | 'alta' | 'media' | 'baja' | 'oportunidad';

export interface ImpactoVsGUA {
  gua: number;
  gap_abs: number;
  gap_pct: number;
  severidad: SeveridadGUA;
}

export function resolveGUA(
  aseguradoraId: AseguradoraId,
  especialidadId: EspecialidadId,
  overrides?: OverridesInput,
): number {
  const key = `${aseguradoraId}:${especialidadId}`;
  const ov = overrides?.gua?.[key];
  if (typeof ov === 'number' && Number.isFinite(ov)) return ov;
  return GUA_REFERENCIA[especialidadId]?.[aseguradoraId] ?? 0;
}

export function calcImpactoVsGUA(
  kpis: KPIs,
  aseguradoraId: AseguradoraId,
  especialidadId: EspecialidadId,
  overrides?: OverridesInput,
): ImpactoVsGUA {
  const gua = resolveGUA(aseguradoraId, especialidadId, overrides);
  const gap_abs = kpis.montoMedio - gua;
  const gap_pct = gua > 0 ? gap_abs / gua : 0;
  let severidad: SeveridadGUA;
  if (gap_pct > 0.25) severidad = 'critica';
  else if (gap_pct > 0.15) severidad = 'alta';
  else if (gap_pct > 0.05) severidad = 'media';
  else if (gap_pct >= 0) severidad = 'baja';
  else severidad = 'oportunidad';
  return { gua, gap_abs, gap_pct, severidad };
}
