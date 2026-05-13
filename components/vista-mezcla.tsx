'use client';

import { ESPECIALIDADES } from '@/lib/data/especialidades';
import { calcKPIs, generarDatosFiltro } from '@/lib/calc';
import { fmtMXN, fmtMXNCompact, fmtPct } from '@/lib/format';
import { useAppState, useAseguradoras } from '@/lib/state';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const toneByComplejidad = { alta: 'red', media: 'amber', baja: 'emerald' } as const;

export function VistaMezcla() {
  const { state } = useAppState();
  const aseguradoras = useAseguradoras();
  const nombreAseguradora = aseguradoras[state.aseguradora]?.nombre ?? state.aseguradora;
  const esTodas = state.especialidad === 'todas';
  const especialidadLabel =
    state.especialidad === 'todas'
      ? 'Todas las especialidades'
      : ESPECIALIDADES[state.especialidad];
  const datos = generarDatosFiltro(
    state.aseguradora,
    state.especialidad,
    state.periodo,
    state.overrides,
  );
  const kpis = calcKPIs(datos);
  const ordenado = [...datos].sort((a, b) => b.monto_total - a.monto_total);

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-900">Mezcla de portafolio</h3>
          <p className="text-sm text-slate-600">
            {nombreAseguradora} · {especialidadLabel} · {state.periodo}
          </p>
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Ordenado por contribución al monto total
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden space-y-2">
        {ordenado.map((p) => {
          const pctVol = (p.casos / kpis.totalCasos) * 100;
          const pctMonto = (p.monto_total / kpis.totalMonto) * 100;
          return (
            <div
              key={`${p.especialidadId}:${p.id}`}
              className="border border-slate-200 rounded-md p-3 bg-white"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-medium text-sm text-slate-900 min-w-0">{p.nombre}</div>
                <Badge tone={toneByComplejidad[p.complejidad]}>{p.complejidad}</Badge>
              </div>
              {esTodas && (
                <div className="text-[10px] text-slate-600 mb-1">
                  {ESPECIALIDADES[p.especialidadId]}
                </div>
              )}
              <div className="text-[10px] text-slate-500 tabular-nums mb-2">
                CIE-9 <span className="font-semibold text-slate-700">{p.cie9}</span> · CIE-10{' '}
                <span className="font-semibold text-slate-700">{p.cie10}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 mb-0.5">Casos</div>
                  <div className="font-semibold tabular-nums">
                    {p.casos}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({pctVol.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 mb-0.5">Ticket prom.</div>
                  <div className="font-semibold tabular-nums">{fmtMXN(p.ticket)}</div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 mb-0.5">% monto</div>
                  <div
                    className={cn(
                      'font-semibold tabular-nums',
                      pctMonto > 15 ? 'text-red-700' : 'text-slate-900',
                    )}
                  >
                    {pctMonto.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  <div className="text-slate-500 mb-0.5">Margen</div>
                  <div className="font-semibold tabular-nums">
                    {fmtPct(p.margen)}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({fmtMXNCompact(p.margen_total)})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="bg-slate-100 border border-slate-200 rounded-md p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="tabular-nums font-semibold">{kpis.totalCasos} casos</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
            <div>
              Monto medio:{' '}
              <strong className="text-slate-900">{fmtMXN(kpis.montoMedio)}</strong>
            </div>
            <div>
              Margen:{' '}
              <strong className="text-slate-900">{fmtPct(kpis.margenPct)}</strong>
            </div>
            <div>
              Monto total:{' '}
              <strong className="text-slate-900">{fmtMXNCompact(kpis.totalMonto)}</strong>
            </div>
            <div>
              Margen contrib:{' '}
              <strong className="text-slate-900">{fmtMXNCompact(kpis.totalMargen)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: tabla */}
      <div className="hidden sm:block overflow-x-auto -mx-5">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-y border-slate-200 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Sub-procedimiento</th>
              {esTodas && <th className="text-left px-3 py-3 font-semibold">Especialidad</th>}
              <th className="text-left px-3 py-3 font-semibold">CIE-9 / CIE-10</th>
              <th className="text-center px-3 py-3 font-semibold">Complejidad</th>
              <th className="text-right px-3 py-3 font-semibold">Casos</th>
              <th className="text-right px-3 py-3 font-semibold">Ticket prom.</th>
              <th className="text-right px-3 py-3 font-semibold">% volumen</th>
              <th className="text-right px-3 py-3 font-semibold">% monto</th>
              <th className="text-right px-3 py-3 font-semibold">Margen</th>
              <th className="text-right px-5 py-3 font-semibold">Margen contrib.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ordenado.map((p) => {
              const pctVol = (p.casos / kpis.totalCasos) * 100;
              const pctMonto = (p.monto_total / kpis.totalMonto) * 100;
              return (
                <tr key={`${p.especialidadId}:${p.id}`} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.nombre}</td>
                  {esTodas && (
                    <td className="px-3 py-3 text-xs text-slate-600 whitespace-nowrap">
                      {ESPECIALIDADES[p.especialidadId]}
                    </td>
                  )}
                  <td className="px-3 py-3 text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    <span className="font-semibold text-slate-700">{p.cie9}</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span>{p.cie10}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <Badge tone={toneByComplejidad[p.complejidad]}>{p.complejidad}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{p.casos}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmtMXN(p.ticket)}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                    {pctVol.toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      'px-3 py-3 text-right tabular-nums font-semibold',
                      pctMonto > 15 ? 'text-red-700' : 'text-slate-700',
                    )}
                  >
                    {pctMonto.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{fmtPct(p.margen)}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">
                    {fmtMXNCompact(p.margen_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold">
            <tr>
              <td className="px-5 py-3 text-slate-700">
                Total {especialidadLabel.toLowerCase()}
              </td>
              {esTodas && <td />}
              <td />
              <td />
              <td className="px-3 py-3 text-right tabular-nums">{kpis.totalCasos}</td>
              <td className="px-3 py-3 text-right tabular-nums text-slate-600">
                {fmtMXN(kpis.montoMedio)}{' '}
                <span className="text-xs font-normal text-slate-500">prom.</span>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">100%</td>
              <td className="px-3 py-3 text-right tabular-nums">100%</td>
              <td className="px-3 py-3 text-right tabular-nums">{fmtPct(kpis.margenPct)}</td>
              <td className="px-5 py-3 text-right tabular-nums">
                {fmtMXNCompact(kpis.totalMargen)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
        <strong>Lectura:</strong> Los sub-procedimientos resaltados en rojo (% monto &gt; 15%) son
        los que más empujan el monto medio hacia arriba. Si la aseguradora presiona por el promedio
        alto, la jugada está en reducir su peso relativo aumentando volumen de los de menor ticket y
        mayor margen — ve a la pestaña <strong>Simulador</strong> y abre la sección
        &quot;Candidatos a push&quot;.
      </div>
      <div className="mt-2 text-[10px] text-slate-400 leading-relaxed">
        Códigos CIE-9-MC (procedimiento) y CIE-10 (diagnóstico típico asociado) son ilustrativos.
        Validar contra el catálogo del HIS antes de uso operativo.
      </div>
    </>
  );
}
