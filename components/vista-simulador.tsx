'use client';

import { useMemo, useState } from 'react';
import { ESPECIALIDADES } from '@/lib/data/especialidades';
import {
  aplicarSimulacion,
  calcImpactoVsGUA,
  calcKPIs,
  generarDatosFiltro,
  identificarCandidatos,
  type ProcEnriquecido,
} from '@/lib/calc';
import {
  DEFAULT_CONFIG,
  optimizar,
  type ConfigOptimizador,
  type ObjetivoOptimizacion,
} from '@/lib/optimizer';
import { evaluarPaquetes, type IntencionPaquete } from '@/lib/paquetes';
import { nuevoMetaId, type MetaKPIs } from '@/lib/metas';
import { fmtMXN, fmtMXNCompact, fmtPct } from '@/lib/format';
import { useAppState, useAseguradoras } from '@/lib/state';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const borderByComplejidad = {
  alta: 'border-l-red-400',
  media: 'border-l-amber-400',
  baja: 'border-l-emerald-400',
} as const;

const OBJETIVO_LABELS: Record<ObjetivoOptimizacion, string> = {
  reducir_monto_medio: 'Bajar monto medio',
  maximizar_margen: 'Maximizar margen',
  balanceado: 'Balanceado',
};

const INTENCION_LABELS: Record<IntencionPaquete, string> = {
  bajar: 'Bajar monto medio',
  subir: 'Subir monto medio',
  margen: 'Maximizar margen',
};

const INTENCION_TONE: Record<IntencionPaquete, 'emerald' | 'indigo' | 'amber'> = {
  bajar: 'emerald',
  subir: 'indigo',
  margen: 'amber',
};

export function VistaSimulador() {
  const { state, dispatch } = useAppState();
  const aseguradoras = useAseguradoras();
  const nombreAseguradora = aseguradoras[state.aseguradora]?.nombre ?? state.aseguradora;
  const [config, setConfig] = useState<ConfigOptimizador>(DEFAULT_CONFIG);
  const [ultimoResultado, setUltimoResultado] = useState<{
    iteraciones: number;
    cambios: number;
  } | null>(null);
  const [intencionFiltro, setIntencionFiltro] = useState<IntencionPaquete | 'todas'>('todas');
  const [paquetesAbierto, setPaquetesAbierto] = useState(false);
  const [candidatosAbierto, setCandidatosAbierto] = useState(false);
  const [metaFormAbierto, setMetaFormAbierto] = useState(false);
  const [metaNombre, setMetaNombre] = useState('');
  const [metaFechaObjetivo, setMetaFechaObjetivo] = useState('');
  const [metaNotas, setMetaNotas] = useState('');
  const [metaFeedback, setMetaFeedback] = useState('');

  const esTodas = state.especialidad === 'todas';
  const datos = generarDatosFiltro(
    state.aseguradora,
    state.especialidad,
    state.periodo,
    state.overrides,
  );
  const datosSim = aplicarSimulacion(datos, state.simulacion);
  const kActual = calcKPIs(datos);
  const kSim = calcKPIs(datosSim, true);
  const impactoActual = state.especialidad === 'todas'
    ? { gua: 0, gap_abs: 0, gap_pct: 0, severidad: 'sin_gua' as const }
    : calcImpactoVsGUA(kActual, state.aseguradora, state.especialidad, state.overrides);
  const impactoSim = state.especialidad === 'todas'
    ? { gua: 0, gap_abs: 0, gap_pct: 0, severidad: 'sin_gua' as const }
    : calcImpactoVsGUA(kSim, state.aseguradora, state.especialidad, state.overrides);
  const ordenado = [...datos].sort((a, b) => b.monto_total - a.monto_total);
  const tieneSim = Object.values(state.simulacion).some((v) => v !== 0);

  const paquetesResultados = useMemo(() => evaluarPaquetes(datos), [datos]);
  const paquetesFiltrados = paquetesResultados.filter((r) =>
    intencionFiltro === 'todas' ? true : r.paquete.intencion === intencionFiltro,
  );
  const candidatos = useMemo(() => identificarCandidatos(datos), [datos]);

  const procsConCambios: ProcEnriquecido[] = ordenado.filter(
    (p) => (state.simulacion[p.id] ?? 0) !== 0,
  );

  const handleOptimizar = () => {
    const r = optimizar(datos, config);
    dispatch({ type: 'SET_SIM', sim: r.simulacion });
    setUltimoResultado({ iteraciones: r.iteraciones, cambios: r.cambiosAplicados });
  };

  const toMetaKPIs = (k: typeof kActual): MetaKPIs => ({
    totalCasos: k.totalCasos,
    totalMonto: k.totalMonto,
    totalMargen: k.totalMargen,
    montoMedio: k.montoMedio,
    margenPct: k.margenPct,
  });

  const handleGuardarMeta = () => {
    const nombre = metaNombre.trim();
    if (!nombre) {
      setMetaFeedback('Falta el nombre de la meta');
      return;
    }
    const fechaObjetivo = metaFechaObjetivo
      ? new Date(metaFechaObjetivo).getTime()
      : undefined;
    dispatch({
      type: 'ADD_META',
      meta: {
        id: nuevoMetaId(),
        nombre,
        createdAt: Date.now(),
        fechaObjetivo: Number.isFinite(fechaObjetivo) ? fechaObjetivo : undefined,
        aseguradoraId: state.aseguradora,
        especialidad: state.especialidad,
        periodo: state.periodo,
        simulacionSnapshot: { ...state.simulacion },
        kpiBaseline: toMetaKPIs(kActual),
        kpiObjetivo: toMetaKPIs(kSim),
        notas: metaNotas.trim() || undefined,
      },
    });
    setMetaFeedback(`✓ Meta "${nombre}" guardada`);
    setMetaNombre('');
    setMetaFechaObjetivo('');
    setMetaNotas('');
    setTimeout(() => {
      setMetaFeedback('');
      setMetaFormAbierto(false);
    }, 2000);
  };

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-900">Simulador de mezcla</h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Compara qué llevas hoy contra escenarios alternativos. Aplica un paquete pre-armado, deja
            que el optimizador sugiera, o ajusta procedimiento por procedimiento.
          </p>
        </div>
      </div>

      {/* Comparación de impacto */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 border border-indigo-100 rounded-lg p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Situación actual
            </div>
            <div className="space-y-2">
              <Row label="Casos totales" value={String(kActual.totalCasos)} />
              <Row label="Monto medio" value={fmtMXN(kActual.montoMedio)} />
              <Row
                label="vs GUA aseguradora"
                value={`${impactoActual.gap_pct >= 0 ? '+' : ''}${(impactoActual.gap_pct * 100).toFixed(1)}%`}
                valueClass={
                  impactoActual.severidad === 'critica' || impactoActual.severidad === 'alta'
                    ? 'text-red-700'
                    : impactoActual.severidad === 'media'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                }
              />
              <Row
                label="Margen contributivo"
                value={`${fmtMXNCompact(kActual.totalMargen)} (${fmtPct(kActual.margenPct)})`}
              />
            </div>
          </div>
          <div className="border-l border-indigo-200 pl-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-3">
              Con la mezcla simulada
            </div>
            <div className="space-y-2">
              <Row
                label="Casos totales"
                value={
                  <span className="text-indigo-900">
                    {kSim.totalCasos}{' '}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        kSim.totalCasos >= kActual.totalCasos ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      ({kSim.totalCasos >= kActual.totalCasos ? '+' : ''}
                      {kSim.totalCasos - kActual.totalCasos})
                    </span>
                  </span>
                }
              />
              <Row
                label="Monto medio"
                value={
                  <span className="text-indigo-900">
                    {fmtMXN(kSim.montoMedio)}{' '}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        kSim.montoMedio <= kActual.montoMedio ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      ({kSim.montoMedio >= kActual.montoMedio ? '+' : ''}
                      {(((kSim.montoMedio - kActual.montoMedio) / kActual.montoMedio) * 100).toFixed(1)}
                      %)
                    </span>
                  </span>
                }
              />
              <Row
                label="vs GUA aseguradora"
                value={`${impactoSim.gap_pct >= 0 ? '+' : ''}${(impactoSim.gap_pct * 100).toFixed(1)}%`}
                valueClass={
                  impactoSim.severidad === 'critica' || impactoSim.severidad === 'alta'
                    ? 'text-red-700'
                    : impactoSim.severidad === 'media'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                }
              />
              <Row
                label="Margen contributivo"
                value={
                  <span className="text-indigo-900">
                    {fmtMXNCompact(kSim.totalMargen)}{' '}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        kSim.totalMargen >= kActual.totalMargen
                          ? 'text-emerald-700'
                          : 'text-red-700',
                      )}
                    >
                      ({kSim.totalMargen >= kActual.totalMargen ? '+' : ''}
                      {(((kSim.totalMargen - kActual.totalMargen) / kActual.totalMargen) * 100).toFixed(1)}
                      %)
                    </span>
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cambios activos */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Cambios activos en simulación</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {tieneSim
                ? `${procsConCambios.length} procedimiento${procsConCambios.length === 1 ? '' : 's'} con ajuste de volumen.`
                : 'Aún no hay cambios. Aplica un paquete, usa el optimizador, o mueve los sliders.'}
            </p>
          </div>
          {tieneSim && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMetaFormAbierto((v) => !v)}
              >
                {metaFormAbierto ? 'Cancelar' : 'Guardar como meta'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => dispatch({ type: 'RESET_SIM' })}>
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
        {tieneSim && metaFormAbierto && (
          <div className="mb-3 p-3 border border-indigo-200 bg-indigo-50/40 rounded-md">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Guardar esta simulación como meta comercial
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Nombre de la meta
                </label>
                <input
                  type="text"
                  placeholder="Ej. Meta Q3 GNP Ortopedia"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                  value={metaNombre}
                  onChange={(e) => setMetaNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Fecha objetivo (opcional)
                </label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                  value={metaFechaObjetivo}
                  onChange={(e) => setMetaFechaObjetivo(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Notas (opcional)
              </label>
              <input
                type="text"
                placeholder="Notas para reunión, justificación, etc."
                className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm"
                value={metaNotas}
                onChange={(e) => setMetaNotas(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={handleGuardarMeta}>
                Guardar meta
              </Button>
              {metaFeedback && (
                <span
                  className={cn(
                    'text-xs font-semibold',
                    metaFeedback.startsWith('✓') ? 'text-emerald-700' : 'text-red-600',
                  )}
                >
                  {metaFeedback}
                </span>
              )}
              <span className="text-[10px] text-slate-500">
                Después la revisas en la pestaña <strong>Metas</strong>.
              </span>
            </div>
          </div>
        )}
        {tieneSim && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {procsConCambios.map((p) => {
              const delta = state.simulacion[p.id] ?? 0;
              const subir = delta > 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-50 rounded px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">{p.nombre}</div>
                    <div className="text-xs text-slate-500">
                      Ticket {fmtMXN(p.ticket)} · Margen {fmtPct(p.margen)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'font-semibold tabular-nums whitespace-nowrap ml-2',
                      subir ? 'text-emerald-700' : 'text-red-700',
                    )}
                  >
                    {subir ? '▲' : '▼'} {subir ? '+' : ''}
                    {delta} → {p.casos + delta}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Paquetes pre-armados (colapsable) */}
      <div className="bg-white border border-slate-200 rounded-lg mb-5">
        <button
          type="button"
          onClick={() => setPaquetesAbierto((v) => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition rounded-lg"
          aria-expanded={paquetesAbierto}
        >
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-400 text-xs">{paquetesAbierto ? '▼' : '▶'}</span>
              Paquetes pre-armados
              <span className="text-xs font-normal text-slate-500">
                ({paquetesResultados.length} disponibles)
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Plays comerciales con nombre. Aplica una estrategia completa en un click.
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold whitespace-nowrap">
            {paquetesAbierto ? 'Ocultar' : 'Ver paquetes'}
          </span>
        </button>
        {paquetesAbierto && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-1 flex-wrap mb-3">
              <span className="text-xs text-slate-500 mr-1">Filtrar por intención:</span>
              {(['todas', 'bajar', 'subir', 'margen'] as const).map((id) => (
                <button
                  key={id}
                  onClick={() => setIntencionFiltro(id)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded border',
                    intencionFiltro === id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50',
                  )}
                >
                  {id === 'todas' ? 'Todos' : INTENCION_LABELS[id]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {paquetesFiltrados.map((r) => {
            const bajaMonto = r.deltaMontoMedio < 0;
            const subeMargen = r.deltaMargen > 0;
            return (
              <div
                key={r.paquete.id}
                className="border border-slate-200 rounded-lg p-3 bg-white hover:border-indigo-300 hover:shadow-sm transition flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm text-slate-900">{r.paquete.nombre}</div>
                  <Badge tone={INTENCION_TONE[r.paquete.intencion]}>
                    {INTENCION_LABELS[r.paquete.intencion]}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-snug mb-3">{r.paquete.descripcion}</p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Δ Monto medio</div>
                    <div
                      className={cn(
                        'font-semibold tabular-nums',
                        bajaMonto ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {bajaMonto ? '▼' : '▲'} {Math.abs(r.deltaMontoMedioPct * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums">
                      → {fmtMXN(r.kpiResultado.montoMedio)}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <div className="text-slate-500 mb-0.5">Δ Margen</div>
                    <div
                      className={cn(
                        'font-semibold tabular-nums',
                        subeMargen ? 'text-emerald-700' : 'text-red-700',
                      )}
                    >
                      {subeMargen ? '▲' : '▼'} {Math.abs(r.deltaMargenPct * 100).toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-slate-500 tabular-nums">
                      → {fmtMXNCompact(r.kpiResultado.totalMargen)}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 mb-2">
                  Afecta {r.procsAfectados} procedimiento{r.procsAfectados === 1 ? '' : 's'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto w-full"
                  onClick={() => dispatch({ type: 'SET_SIM', sim: r.sim })}
                >
                  Aplicar este paquete
                </Button>
              </div>
            );
          })}
            </div>
          </div>
        )}
      </div>

      {/* Candidatos a push (colapsable) */}
      <div className="bg-white border border-slate-200 rounded-lg mb-5">
        <button
          type="button"
          onClick={() => setCandidatosAbierto((v) => !v)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition rounded-lg"
          aria-expanded={candidatosAbierto}
        >
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="text-slate-400 text-xs">{candidatosAbierto ? '▼' : '▶'}</span>
              Candidatos a push
              <span className="text-xs font-normal text-slate-500">
                ({candidatos.length} identificados)
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Procedimientos individuales con alto margen y bajo ticket. Agrégalos uno por uno a la
              simulación.
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold whitespace-nowrap">
            {candidatosAbierto ? 'Ocultar' : 'Ver candidatos'}
          </span>
        </button>
        {candidatosAbierto && (
          <div className="border-t border-slate-200 p-4">
            {candidatos.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">
                No se identificaron candidatos con los filtros actuales. Prueba con otra combinación.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidatos.map((p, i) => {
                  const proyMontoMedioSiDoble =
                    (kActual.totalMonto + p.casos * p.ticket) / (kActual.totalCasos + p.casos);
                  const deltaMontoMedio = proyMontoMedioSiDoble - kActual.montoMedio;
                  const pctDelta = (deltaMontoMedio / kActual.montoMedio) * 100;
                  return (
                    <div
                      key={`${p.especialidadId}:${p.id}`}
                      className="border border-slate-200 rounded-lg p-3 bg-white hover:border-indigo-300 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wide">
                            #{i + 1} candidato
                          </div>
                          <div className="font-semibold text-sm text-slate-900 mt-0.5">
                            {p.nombre}
                          </div>
                          {esTodas && (
                            <div className="text-[10px] text-slate-600 mt-0.5">
                              {ESPECIALIDADES[p.especialidadId]}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                            CIE-9 <span className="font-semibold text-slate-700">{p.cie9}</span>
                            <span className="text-slate-300 mx-1">·</span>
                            CIE-10 <span className="font-semibold text-slate-700">{p.cie10}</span>
                          </div>
                        </div>
                        <Badge tone="emerald">{fmtPct(p.margen)} margen</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div className="bg-slate-50 rounded p-2">
                          <div className="text-slate-500 mb-0.5">Casos actuales</div>
                          <div className="font-semibold tabular-nums text-slate-900">
                            {p.casos}
                          </div>
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
                      <div className="pt-2 border-t border-slate-100 text-xs leading-relaxed mb-2">
                        <div className="text-slate-600">
                          Si <strong>duplicas el volumen</strong> a {p.casos * 2} casos:
                        </div>
                        <div className="flex items-center gap-3 mt-1">
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
                        className="w-full"
                        onClick={() =>
                          dispatch({ type: 'ADD_TO_SIM', procId: p.id, delta: p.casos })
                        }
                      >
                        Agregar a la simulación (+{p.casos} casos)
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optimizador */}
      <div className="bg-white border border-indigo-200 rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Optimizador automático</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Sugiere los ajustes que mejor cumplen el objetivo dentro de los límites configurados.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Objetivo
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium"
              value={config.objetivo}
              onChange={(e) =>
                setConfig({ ...config, objetivo: e.target.value as ObjetivoOptimizacion })
              }
            >
              {Object.entries(OBJETIVO_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Máx. incremento
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium"
              value={config.maxIncrementoPct}
              onChange={(e) =>
                setConfig({ ...config, maxIncrementoPct: parseFloat(e.target.value) })
              }
            >
              <option value="0.5">+50%</option>
              <option value="1.0">+100% (doble)</option>
              <option value="1.5">+150%</option>
              <option value="2.0">+200% (triple)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Máx. reducción
            </label>
            <select
              className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium"
              value={config.maxReduccionPct}
              onChange={(e) =>
                setConfig({ ...config, maxReduccionPct: parseFloat(e.target.value) })
              }
            >
              <option value="0">Sin reducir</option>
              <option value="0.2">−20%</option>
              <option value="0.3">−30%</option>
              <option value="0.5">−50%</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.preservarComplejidadAlta}
                onChange={(e) =>
                  setConfig({ ...config, preservarComplejidadAlta: e.target.checked })
                }
                className="accent-indigo-600"
              />
              Preservar complejidad alta
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={handleOptimizar}>Optimizar</Button>
          {ultimoResultado && (
            <span className="text-xs text-slate-500">
              {ultimoResultado.cambios} ajustes aplicados en {ultimoResultado.iteraciones}{' '}
              iteraciones
            </span>
          )}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Ajustar volumen por sub-procedimiento
        </div>
        {ordenado.map((p) => {
          const delta = state.simulacion[p.id] ?? 0;
          const casosSim = Math.max(0, p.casos + delta);
          const maxDelta = Math.max(20, p.casos);
          return (
            <div
              key={p.id}
              className={cn(
                'border border-slate-200 border-l-4 rounded-md p-3 bg-white',
                borderByComplejidad[p.complejidad],
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <div className="min-w-0 sm:flex-1">
                  <div className="font-medium text-sm text-slate-900">{p.nombre}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ticket {fmtMXN(p.ticket)} · Margen {fmtPct(p.margen)} · Actual {p.casos}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                  <input
                    type="range"
                    min={-p.casos}
                    max={maxDelta}
                    value={delta}
                    onChange={(e) =>
                      dispatch({ type: 'UPDATE_SIM', procId: p.id, delta: parseInt(e.target.value) })
                    }
                    className="flex-1 sm:w-32 sm:flex-none accent-indigo-600"
                  />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Disminuir volumen"
                      onClick={() =>
                        dispatch({ type: 'UPDATE_SIM', procId: p.id, delta: delta - 1 })
                      }
                    >
                      −
                    </Button>
                    <span
                      className={cn(
                        'font-semibold tabular-nums w-10 sm:w-12 text-center text-sm',
                        delta > 0
                          ? 'text-emerald-700'
                          : delta < 0
                            ? 'text-red-700'
                            : 'text-slate-900',
                      )}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta}
                    </span>
                    <Button
                      variant="secondary"
                      size="icon"
                      aria-label="Aumentar volumen"
                      onClick={() =>
                        dispatch({ type: 'UPDATE_SIM', procId: p.id, delta: delta + 1 })
                      }
                    >
                      +
                    </Button>
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-14 sm:w-16 text-right text-indigo-700 flex-shrink-0">
                    → {casosSim}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interpretación */}
      {tieneSim && (
        <div className="mt-5 p-4 bg-indigo-600 text-white rounded-lg">
          <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-2">
            Interpretación de la simulación
          </div>
          <p className="text-sm leading-relaxed">
            Con la mezcla propuesta, el monto medio de{' '}
            {state.especialidad === 'todas'
              ? 'todas las especialidades'
              : ESPECIALIDADES[state.especialidad].toLowerCase()}{' '}
            con {nombreAseguradora}{' '}
            {kSim.montoMedio < kActual.montoMedio ? 'baja' : 'sube'} de{' '}
            {fmtMXN(kActual.montoMedio)} a {fmtMXN(kSim.montoMedio)} (
            {(((kSim.montoMedio - kActual.montoMedio) / kActual.montoMedio) * 100).toFixed(1)}%),
            mientras el margen contributivo total{' '}
            {kSim.totalMargen > kActual.totalMargen ? 'crece' : 'cae'} de{' '}
            {fmtMXNCompact(kActual.totalMargen)} a {fmtMXNCompact(kSim.totalMargen)} (
            {kSim.totalMargen > kActual.totalMargen ? '+' : ''}
            {(((kSim.totalMargen - kActual.totalMargen) / kActual.totalMargen) * 100).toFixed(1)}%).
            {kSim.montoMedio < kActual.montoMedio && kSim.totalMargen > kActual.totalMargen
              ? ' Esta es la jugada ideal: reduce tensión con la aseguradora y mejora rentabilidad simultáneamente.'
              : kSim.montoMedio < kActual.montoMedio
                ? ' Reduce tensión con la aseguradora pero a costa de margen. Validar si vale la pena.'
                : ' Sube el monto medio. Aumenta tensión con la aseguradora — replantear la mezcla.'}
          </p>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}:</span>
      <span className={cn('font-semibold tabular-nums', valueClass)}>{value}</span>
    </div>
  );
}
