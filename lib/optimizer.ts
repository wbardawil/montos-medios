import { aplicarSimulacion, calcKPIs, type ProcEnriquecido, type Simulacion } from './calc';

export type ObjetivoOptimizacion = 'reducir_monto_medio' | 'maximizar_margen' | 'balanceado';

export interface ConfigOptimizador {
  objetivo: ObjetivoOptimizacion;
  maxIncrementoPct: number;
  maxReduccionPct: number;
  preservarComplejidadAlta: boolean;
}

export interface ResultadoOptimizacion {
  simulacion: Simulacion;
  montoMedioInicial: number;
  montoMedioFinal: number;
  margenInicial: number;
  margenFinal: number;
  iteraciones: number;
  cambiosAplicados: number;
}

export const DEFAULT_CONFIG: ConfigOptimizador = {
  objetivo: 'balanceado',
  maxIncrementoPct: 1.0,
  maxReduccionPct: 0.3,
  preservarComplejidadAlta: true,
};

function puntajeMovimiento(
  proc: ProcEnriquecido,
  direccion: 'subir' | 'bajar',
  objetivo: ObjetivoOptimizacion,
  montoMedioActual: number,
): number {
  const empujaMontoMedioAbajo = proc.ticket < montoMedioActual;
  const margenUnit = proc.ticket * proc.margen;

  if (direccion === 'subir') {
    if (objetivo === 'reducir_monto_medio') {
      return empujaMontoMedioAbajo ? (montoMedioActual - proc.ticket) * proc.margen : -Infinity;
    }
    if (objetivo === 'maximizar_margen') return margenUnit;
    return empujaMontoMedioAbajo
      ? (montoMedioActual - proc.ticket) * 0.5 + margenUnit * 0.5
      : margenUnit * 0.3;
  }

  if (objetivo === 'reducir_monto_medio') {
    return !empujaMontoMedioAbajo ? (proc.ticket - montoMedioActual) * (1 - proc.margen) : -Infinity;
  }
  if (objetivo === 'maximizar_margen') return -margenUnit;
  return !empujaMontoMedioAbajo
    ? (proc.ticket - montoMedioActual) * (1 - proc.margen) * 0.5
    : -margenUnit * 0.5;
}

export function optimizar(
  datos: ProcEnriquecido[],
  cfg: ConfigOptimizador = DEFAULT_CONFIG,
): ResultadoOptimizacion {
  const kpiInicial = calcKPIs(datos);
  const sim: Simulacion = {};

  const limites = new Map<string, { maxUp: number; maxDown: number }>();
  for (const p of datos) {
    const bloqueado = cfg.preservarComplejidadAlta && p.complejidad === 'alta';
    limites.set(p.id, {
      maxUp: bloqueado ? 0 : Math.max(0, Math.floor(p.casos * cfg.maxIncrementoPct)),
      maxDown: bloqueado ? 0 : Math.max(0, Math.floor(p.casos * cfg.maxReduccionPct)),
    });
  }

  const maxIter = 200;
  let iter = 0;
  let cambios = 0;

  for (; iter < maxIter; iter++) {
    const kpiActual = calcKPIs(aplicarSimulacion(datos, sim), true);
    let mejorMov: { id: string; delta: number; puntaje: number } | null = null;

    for (const p of datos) {
      const lim = limites.get(p.id)!;
      const deltaActual = sim[p.id] ?? 0;

      if (deltaActual < lim.maxUp) {
        const score = puntajeMovimiento(p, 'subir', cfg.objetivo, kpiActual.montoMedio);
        if (score > 0 && (!mejorMov || score > mejorMov.puntaje)) {
          mejorMov = { id: p.id, delta: 1, puntaje: score };
        }
      }
      if (-deltaActual < lim.maxDown) {
        const score = puntajeMovimiento(p, 'bajar', cfg.objetivo, kpiActual.montoMedio);
        if (score > 0 && (!mejorMov || score > mejorMov.puntaje)) {
          mejorMov = { id: p.id, delta: -1, puntaje: score };
        }
      }
    }

    if (!mejorMov) break;
    sim[mejorMov.id] = (sim[mejorMov.id] ?? 0) + mejorMov.delta;
    if (sim[mejorMov.id] === 0) delete sim[mejorMov.id];
    cambios++;
  }

  const kpiFinal = calcKPIs(aplicarSimulacion(datos, sim), true);

  return {
    simulacion: sim,
    montoMedioInicial: kpiInicial.montoMedio,
    montoMedioFinal: kpiFinal.montoMedio,
    margenInicial: kpiInicial.totalMargen,
    margenFinal: kpiFinal.totalMargen,
    iteraciones: iter,
    cambiosAplicados: cambios,
  };
}
