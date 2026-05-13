'use client';

import {
  aplicarSimulacion,
  calcImpactoVsGUA,
  calcKPIs,
  generarDatos,
} from '@/lib/calc';
import { useAppState } from '@/lib/state';
import { fmtMXN, fmtMXNCompact, fmtPct } from '@/lib/format';
import { Card, CardBody } from './ui/card';
import { cn } from '@/lib/utils';

export function KPICards() {
  const { state } = useAppState();
  const datos = generarDatos(state.aseguradora, state.especialidad, state.periodo, state.overrides);
  const datosSim = aplicarSimulacion(datos, state.simulacion);
  const kActual = calcKPIs(datos);
  const kSim = calcKPIs(datosSim, true);
  const impacto = calcImpactoVsGUA(kActual, state.aseguradora, state.especialidad, state.overrides);
  const hasSim = Object.values(state.simulacion).some((v) => v !== 0);

  const gapToneClass =
    impacto.severidad === 'critica' || impacto.severidad === 'alta'
      ? 'text-red-600'
      : impacto.severidad === 'media'
        ? 'text-amber-600'
        : 'text-emerald-600';

  const tagSeveridad = {
    critica: '· tensión crítica',
    alta: '· tensión alta',
    media: '· sobre referencia',
    baja: '· cerca de referencia',
    oportunidad: '· bajo referencia',
  }[impacto.severidad];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
      <Card>
        <CardBody>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Monto medio actual
          </div>
          <div className="text-2xl font-bold tabular-nums text-slate-900">
            {fmtMXN(kActual.montoMedio)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {kActual.totalCasos} casos · {fmtMXNCompact(kActual.totalMonto)} total
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            GUA aseguradora
          </div>
          <div className="text-2xl font-bold tabular-nums text-slate-900">
            {fmtMXN(impacto.gua)}
          </div>
          <div className={cn('text-xs mt-1', gapToneClass)}>
            {impacto.gap_pct >= 0 ? '+' : ''}
            {(impacto.gap_pct * 100).toFixed(1)}% vs GUA {tagSeveridad}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Margen contributivo
          </div>
          <div className="text-2xl font-bold tabular-nums text-slate-900">
            {fmtMXNCompact(kActual.totalMargen)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fmtPct(kActual.margenPct)} margen sobre venta
          </div>
        </CardBody>
      </Card>

      <Card className={hasSim ? 'border-indigo-300 bg-indigo-50' : ''}>
        <CardBody>
          <div
            className={cn(
              'text-xs font-semibold uppercase tracking-wide mb-2',
              hasSim ? 'text-indigo-700' : 'text-slate-500',
            )}
          >
            {hasSim ? 'Simulación activa' : 'Sin simulación'}
          </div>
          {hasSim ? (
            <>
              <div className="text-2xl font-bold tabular-nums text-indigo-900">
                {fmtMXN(kSim.montoMedio)}
              </div>
              <div
                className={cn(
                  'text-xs mt-1 font-medium',
                  kSim.montoMedio < kActual.montoMedio ? 'text-emerald-700' : 'text-red-700',
                )}
              >
                {kSim.montoMedio < kActual.montoMedio ? '▼' : '▲'}{' '}
                {Math.abs(((kSim.montoMedio - kActual.montoMedio) / kActual.montoMedio) * 100).toFixed(1)}
                % vs actual · margen {fmtPct(kSim.margenPct)}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold tabular-nums text-slate-400">—</div>
              <div className="text-xs text-slate-500 mt-1">
                Ajustar volúmenes en la pestaña Simulador
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
