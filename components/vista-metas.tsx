'use client';

import { useMemo, useState } from 'react';
import { ESPECIALIDADES } from '@/lib/data/especialidades';
import { aplicarSimulacion, calcKPIs, generarDatosFiltro } from '@/lib/calc';
import { ESTADO_LABEL, evaluarMeta, type MetaComercial } from '@/lib/metas';
import { fmtMXN, fmtMXNCompact, fmtPct } from '@/lib/format';
import { useAppState, useAseguradoras } from '@/lib/state';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const ESTADO_TONE: Record<string, 'emerald' | 'amber' | 'red' | 'indigo' | 'slate'> = {
  cumplida: 'emerald',
  cerca_objetivo: 'emerald',
  en_progreso: 'indigo',
  sin_movimiento: 'slate',
  sin_data: 'slate',
  alejandose: 'red',
};

function fmtFecha(ts: number | undefined): string {
  if (!ts || !Number.isFinite(ts)) return '—';
  return new Date(ts).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function VistaMetas() {
  const { state, dispatch } = useAppState();
  const aseguradoras = useAseguradoras();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [draftNombre, setDraftNombre] = useState('');
  const [draftNotas, setDraftNotas] = useState('');
  const [draftFecha, setDraftFecha] = useState('');

  const metasOrdenadas = useMemo(() => {
    return Object.values(state.metas).sort((a, b) => {
      const aFecha = a.fechaObjetivo ?? Number.POSITIVE_INFINITY;
      const bFecha = b.fechaObjetivo ?? Number.POSITIVE_INFINITY;
      if (aFecha !== bFecha) return aFecha - bFecha;
      return b.createdAt - a.createdAt;
    });
  }, [state.metas]);

  const startEdit = (m: MetaComercial) => {
    setEditandoId(m.id);
    setDraftNombre(m.nombre);
    setDraftNotas(m.notas ?? '');
    setDraftFecha(m.fechaObjetivo ? new Date(m.fechaObjetivo).toISOString().slice(0, 10) : '');
  };

  const guardarEdit = (id: string) => {
    const fecha = draftFecha ? new Date(draftFecha).getTime() : undefined;
    dispatch({
      type: 'UPDATE_META',
      id,
      updates: {
        nombre: draftNombre.trim() || 'Meta sin nombre',
        notas: draftNotas.trim() || undefined,
        fechaObjetivo: Number.isFinite(fecha) ? fecha : undefined,
      },
    });
    setEditandoId(null);
  };

  const eliminarMeta = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar meta "${nombre}"? Esta acción no se puede deshacer.`)) {
      dispatch({ type: 'REMOVE_META', id });
    }
  };

  return (
    <>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Metas comerciales</h3>
        <p className="text-sm text-slate-600 mt-0.5">
          Snapshots de simulaciones convertidas en objetivo. Cada meta se compara en vivo contra la
          mezcla actual del scope correspondiente (aseguradora × especialidad).
        </p>
      </div>

      {metasOrdenadas.length === 0 ? (
        <div className="border border-slate-200 rounded-lg p-8 text-center bg-slate-50/40">
          <div className="text-sm text-slate-600 mb-3">No hay metas guardadas todavía.</div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => dispatch({ type: 'SET_TAB', value: 'simulador' })}
          >
            Ir al simulador para crear una meta
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {metasOrdenadas.map((meta) => {
            const aseguradoraNombre =
              aseguradoras[meta.aseguradoraId]?.nombre ?? meta.aseguradoraId;
            const datosActuales = generarDatosFiltro(
              meta.aseguradoraId,
              meta.especialidad,
              meta.periodo,
              state.overrides,
            );
            const kpiActual = calcKPIs(datosActuales);
            const datosSimMeta = aplicarSimulacion(datosActuales, meta.simulacionSnapshot);
            const kpiSimRecalc = calcKPIs(datosSimMeta, true);
            const eval_ = evaluarMeta(meta, {
              totalCasos: kpiActual.totalCasos,
              totalMonto: kpiActual.totalMonto,
              totalMargen: kpiActual.totalMargen,
              montoMedio: kpiActual.montoMedio,
              margenPct: kpiActual.margenPct,
            });
            const editando = editandoId === meta.id;

            const fechaTone =
              eval_.diasRestantes === undefined
                ? 'slate'
                : eval_.diasRestantes < 0
                  ? 'red'
                  : eval_.diasRestantes < 14
                    ? 'amber'
                    : 'slate';

            return (
              <div
                key={meta.id}
                className="bg-white border border-slate-200 rounded-lg p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="min-w-0 flex-1">
                    {editando ? (
                      <input
                        type="text"
                        className="w-full font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded px-2 py-1"
                        value={draftNombre}
                        onChange={(e) => setDraftNombre(e.target.value)}
                      />
                    ) : (
                      <div className="font-bold text-slate-900">{meta.nombre}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-0.5">
                      {aseguradoraNombre} ·{' '}
                      {meta.especialidad === 'todas'
                        ? 'Todas las especialidades'
                        : ESPECIALIDADES[meta.especialidad]}{' '}
                      · periodo {meta.periodo}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Creada: {fmtFecha(meta.createdAt)}
                      {meta.fechaObjetivo && (
                        <>
                          {' · Objetivo: '}
                          <span
                            className={cn(
                              'font-semibold',
                              fechaTone === 'red'
                                ? 'text-red-700'
                                : fechaTone === 'amber'
                                  ? 'text-amber-700'
                                  : 'text-slate-700',
                            )}
                          >
                            {fmtFecha(meta.fechaObjetivo)}
                            {eval_.diasRestantes !== undefined && (
                              <>
                                {' '}
                                ({eval_.diasRestantes < 0
                                  ? `vencida hace ${Math.abs(eval_.diasRestantes)}d`
                                  : `en ${eval_.diasRestantes}d`})
                              </>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge tone={ESTADO_TONE[eval_.estado] ?? 'slate'}>
                    {ESTADO_LABEL[eval_.estado]}
                  </Badge>
                </div>

                {/* KPIs comparativos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <KPIRow
                    label="Monto medio"
                    baseline={meta.kpiBaseline.montoMedio}
                    objetivo={meta.kpiObjetivo.montoMedio}
                    actual={kpiActual.montoMedio}
                    fmt={fmtMXN}
                    direccionDeseada="bajar"
                  />
                  <KPIRow
                    label="Casos totales"
                    baseline={meta.kpiBaseline.totalCasos}
                    objetivo={meta.kpiObjetivo.totalCasos}
                    actual={kpiActual.totalCasos}
                    fmt={(v) => v.toLocaleString('es-MX')}
                    direccionDeseada="subir"
                  />
                  <KPIRow
                    label="Margen contributivo"
                    baseline={meta.kpiBaseline.totalMargen}
                    objetivo={meta.kpiObjetivo.totalMargen}
                    actual={kpiActual.totalMargen}
                    fmt={fmtMXNCompact}
                    direccionDeseada="subir"
                  />
                </div>

                {/* Detalle simulación */}
                <div className="text-xs text-slate-600 leading-relaxed mb-3 bg-slate-50 rounded p-2">
                  <strong>{Object.keys(meta.simulacionSnapshot).length}</strong> ajustes guardados
                  en la simulación. Si aplicaras esta meta hoy sobre el contexto actual, el monto
                  medio sería {fmtMXN(kpiSimRecalc.montoMedio)} y el margen{' '}
                  {fmtPct(kpiSimRecalc.margenPct)}.
                </div>

                {/* Edit fields */}
                {editando && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 p-3 bg-amber-50 border border-amber-200 rounded">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Fecha objetivo
                      </label>
                      <input
                        type="date"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                        value={draftFecha}
                        onChange={(e) => setDraftFecha(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Notas
                      </label>
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                        value={draftNotas}
                        onChange={(e) => setDraftNotas(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {!editando && meta.notas && (
                  <div className="text-xs text-slate-600 italic mb-3">
                    &ldquo;{meta.notas}&rdquo;
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-wrap">
                  {editando ? (
                    <>
                      <Button size="sm" onClick={() => guardarEdit(meta.id)}>
                        Guardar cambios
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditandoId(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch({ type: 'LOAD_META_INTO_SIM', id: meta.id })}
                      >
                        Cargar en simulador
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(meta)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => eliminarMeta(meta.id, meta.nombre)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function KPIRow({
  label,
  baseline,
  objetivo,
  actual,
  fmt,
  direccionDeseada,
}: {
  label: string;
  baseline: number;
  objetivo: number;
  actual: number;
  fmt: (n: number) => string;
  direccionDeseada: 'subir' | 'bajar';
}) {
  const gapVsObjetivo = actual - objetivo;
  const buenSigno =
    direccionDeseada === 'bajar' ? gapVsObjetivo <= 0 : gapVsObjetivo >= 0;
  const sinMovimiento = Math.abs(actual - baseline) < Math.abs(objetivo - baseline) * 0.05;

  return (
    <div className="border border-slate-200 rounded p-2 bg-slate-50/40">
      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1 text-xs">
        <div>
          <div className="text-[10px] text-slate-500">Baseline</div>
          <div className="font-semibold tabular-nums text-slate-700">{fmt(baseline)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Objetivo</div>
          <div className="font-semibold tabular-nums text-indigo-700">{fmt(objetivo)}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-500">Actual</div>
          <div
            className={cn(
              'font-semibold tabular-nums',
              sinMovimiento
                ? 'text-slate-700'
                : buenSigno
                  ? 'text-emerald-700'
                  : 'text-red-700',
            )}
          >
            {fmt(actual)}
          </div>
        </div>
      </div>
    </div>
  );
}
