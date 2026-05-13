import {
  aplicarSimulacion,
  calcKPIs,
  type KPIs,
  type ProcEnriquecido,
  type Simulacion,
} from './calc';
import { DEFAULT_CONFIG, optimizar } from './optimizer';

export type IntencionPaquete = 'bajar' | 'subir' | 'margen';

export interface PaqueteDef {
  id: string;
  nombre: string;
  descripcion: string;
  intencion: IntencionPaquete;
  generarSim: (datos: ProcEnriquecido[]) => Simulacion;
}

export interface PaqueteResultado {
  paquete: PaqueteDef;
  sim: Simulacion;
  kpiActual: KPIs;
  kpiResultado: KPIs;
  deltaMontoMedio: number;
  deltaMontoMedioPct: number;
  deltaMargen: number;
  deltaMargenPct: number;
  procsAfectados: number;
}

function pctComplejidad(
  datos: ProcEnriquecido[],
  complejidad: 'alta' | 'media' | 'baja',
  pct: number,
  filtroMargen = 0,
): Simulacion {
  const sim: Simulacion = {};
  for (const p of datos) {
    if (p.complejidad === complejidad && p.margen >= filtroMargen) {
      const delta = Math.round(p.casos * pct);
      if (delta !== 0) sim[p.id] = delta;
    }
  }
  return sim;
}

function pctPorDebajoMontoMedio(datos: ProcEnriquecido[], pct: number): Simulacion {
  const kpis = calcKPIs(datos);
  const sim: Simulacion = {};
  for (const p of datos) {
    if (p.ticket < kpis.montoMedio) {
      const delta = Math.round(p.casos * pct);
      if (delta !== 0) sim[p.id] = delta;
    }
  }
  return sim;
}

function premiumPuro(datos: ProcEnriquecido[]): Simulacion {
  const sim: Simulacion = {};
  for (const p of datos) {
    if (p.complejidad === 'alta') {
      const delta = Math.max(1, Math.round(p.casos * 0.3));
      sim[p.id] = delta;
    } else if (p.complejidad === 'baja') {
      const delta = -Math.max(1, Math.round(p.casos * 0.2));
      sim[p.id] = delta;
    }
  }
  return sim;
}

export const PAQUETES: PaqueteDef[] = [
  {
    id: 'push_ambulatorio_agresivo',
    nombre: 'Push ambulatorio agresivo',
    descripcion:
      'Duplica el volumen de todos los procedimientos de baja complejidad con margen ≥ 30%.',
    intencion: 'bajar',
    generarSim: (d) => {
      const sim: Simulacion = {};
      for (const p of d) {
        if (p.complejidad === 'baja' && p.margen >= 0.3) sim[p.id] = p.casos;
      }
      return sim;
    },
  },
  {
    id: 'push_ambulatorio_moderado',
    nombre: 'Push ambulatorio moderado',
    descripcion: 'Crece 50% el volumen de procedimientos de baja complejidad con margen ≥ 30%.',
    intencion: 'bajar',
    generarSim: (d) => pctComplejidad(d, 'baja', 0.5, 0.3),
  },
  {
    id: 'diversificar_mezcla',
    nombre: 'Diversificar mezcla',
    descripcion: 'Sube 30% el volumen de todo procedimiento cuyo ticket está por debajo del promedio actual.',
    intencion: 'bajar',
    generarSim: (d) => pctPorDebajoMontoMedio(d, 0.3),
  },
  {
    id: 'push_complejidad_alta',
    nombre: 'Push complejidad alta',
    descripcion: 'Crece 50% el volumen de cirugía mayor (alta complejidad).',
    intencion: 'subir',
    generarSim: (d) => pctComplejidad(d, 'alta', 0.5),
  },
  {
    id: 'premium_puro',
    nombre: 'Premium puro',
    descripcion: 'Sube 30% en complejidad alta y baja 20% en complejidad baja. Mezcla más premium.',
    intencion: 'subir',
    generarSim: premiumPuro,
  },
  {
    id: 'maximizar_margen',
    nombre: 'Maximizar margen',
    descripcion: 'Optimizador greedy con objetivo margen, cap +100% por procedimiento.',
    intencion: 'margen',
    generarSim: (d) =>
      optimizar(d, { ...DEFAULT_CONFIG, objetivo: 'maximizar_margen' }).simulacion,
  },
];

export function evaluarPaquetes(datos: ProcEnriquecido[]): PaqueteResultado[] {
  const kpiActual = calcKPIs(datos);
  return PAQUETES.map((paq) => {
    const sim = paq.generarSim(datos);
    const datosSim = aplicarSimulacion(datos, sim);
    const kpiResultado = calcKPIs(datosSim, true);
    const deltaMontoMedio = kpiResultado.montoMedio - kpiActual.montoMedio;
    const deltaMontoMedioPct =
      kpiActual.montoMedio > 0 ? deltaMontoMedio / kpiActual.montoMedio : 0;
    const deltaMargen = kpiResultado.totalMargen - kpiActual.totalMargen;
    const deltaMargenPct =
      kpiActual.totalMargen > 0 ? deltaMargen / kpiActual.totalMargen : 0;
    const procsAfectados = Object.values(sim).filter((v) => v !== 0).length;
    return {
      paquete: paq,
      sim,
      kpiActual,
      kpiResultado,
      deltaMontoMedio,
      deltaMontoMedioPct,
      deltaMargen,
      deltaMargenPct,
      procsAfectados,
    };
  });
}
