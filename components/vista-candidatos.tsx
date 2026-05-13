'use client';

import { calcKPIs, generarDatos, identificarCandidatos } from '@/lib/calc';
import { fmtMXNCompact, fmtPct } from '@/lib/format';
import { useAppState } from '@/lib/state';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

export function VistaCandidatos() {
  const { state, dispatch } = useAppState();
  const datos = generarDatos(state.aseguradora, state.especialidad, state.periodo, state.overrides);
  const candidatos = identificarCandidatos(datos);
  const kpis = calcKPIs(datos);

  return (
    <>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Candidatos a push</h3>
        <p className="text-sm text-slate-600 mt-0.5">
          Sub-procedimientos con alto margen, bajo ticket y volumen subutilizado. Aumentar su
          volumen reduce el monto medio agregado y mejora la rentabilidad simultáneamente.
        </p>
      </div>
      {candidatos.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No se identificaron candidatos claros con los filtros actuales. Prueba con otra
          combinación aseguradora × especialidad.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {candidatos.map((p, i) => {
            const proyMontoMedioSiDoble =
              (kpis.totalMonto + p.casos * p.ticket) / (kpis.totalCasos + p.casos);
            const deltaMontoMedio = proyMontoMedioSiDoble - kpis.montoMedio;
            const pctDelta = (deltaMontoMedio / kpis.montoMedio) * 100;
            return (
              <div
                key={p.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      #{i + 1} candidato
                    </div>
                    <div className="font-semibold text-slate-900 mt-1">{p.nombre}</div>
                    <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                      CIE-9 <span className="font-semibold text-slate-700">{p.cie9}</span>
                      <span className="text-slate-300 mx-1">·</span>
                      CIE-10 <span className="font-semibold text-slate-700">{p.cie10}</span>
                    </div>
                  </div>
                  <Badge tone="emerald">{fmtPct(p.margen)} margen</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Casos actuales</div>
                    <div className="font-semibold tabular-nums text-slate-900">{p.casos}</div>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Ticket</div>
                    <div className="font-semibold tabular-nums text-slate-900">
                      {fmtMXNCompact(p.ticket)}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Margen total</div>
                    <div className="font-semibold tabular-nums text-slate-900">
                      {fmtMXNCompact(p.margen_total)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs leading-relaxed">
                  <div className="text-slate-600">
                    Si <strong>duplicas el volumen</strong> a {p.casos * 2} casos:
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span
                      className={cn(
                        'font-medium tabular-nums',
                        pctDelta < 0 ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {pctDelta < 0 ? '▼' : '▲'} {Math.abs(pctDelta).toFixed(1)}% monto medio
                    </span>
                    <span className="text-emerald-700 font-medium tabular-nums">
                      ▲ {fmtMXNCompact(p.potencial_doble)} margen adicional
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => dispatch({ type: 'ADD_TO_SIM', procId: p.id, delta: p.casos })}
                >
                  Agregar al simulador (+{p.casos} casos)
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
