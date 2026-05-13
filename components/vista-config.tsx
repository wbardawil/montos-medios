'use client';

import { useEffect, useMemo, useState } from 'react';
import { ASEGURADORAS, type AseguradoraId } from '@/lib/data/aseguradoras';
import { ESPECIALIDADES, ESPECIALIDAD_IDS, type EspecialidadId } from '@/lib/data/especialidades';
import { GUA_REFERENCIA } from '@/lib/data/gua';
import { SUBPROCEDIMIENTOS } from '@/lib/data/procedimientos';
import { fmtMXN, fmtPct } from '@/lib/format';
import { guaKey, useAppState, type Overrides, type ProcOverride } from '@/lib/state';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const INPUT_CLASS =
  'w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

function cleanProc(o: ProcOverride): ProcOverride | null {
  const r: ProcOverride = {};
  if (typeof o.ticket === 'number' && Number.isFinite(o.ticket)) r.ticket = o.ticket;
  if (typeof o.margen === 'number' && Number.isFinite(o.margen)) r.margen = o.margen;
  return r.ticket === undefined && r.margen === undefined ? null : r;
}

function normalizar(o: Overrides): Overrides {
  const procs: Record<string, ProcOverride> = {};
  for (const [id, ov] of Object.entries(o.procedimientos)) {
    const c = cleanProc(ov);
    if (c) procs[id] = c;
  }
  const gua: Record<string, number> = {};
  for (const [k, v] of Object.entries(o.gua)) {
    if (typeof v === 'number' && Number.isFinite(v)) gua[k] = v;
  }
  return { procedimientos: procs, gua };
}

function contarCambios(draft: Overrides, base: Overrides): number {
  let n = 0;
  const allProcIds = new Set([
    ...Object.keys(draft.procedimientos),
    ...Object.keys(base.procedimientos),
  ]);
  for (const id of allProcIds) {
    const a = draft.procedimientos[id] ?? {};
    const b = base.procedimientos[id] ?? {};
    if (a.ticket !== b.ticket) n++;
    if (a.margen !== b.margen) n++;
  }
  const allGuaKeys = new Set([...Object.keys(draft.gua), ...Object.keys(base.gua)]);
  for (const k of allGuaKeys) {
    if (draft.gua[k] !== base.gua[k]) n++;
  }
  return n;
}

export function VistaConfig() {
  const { state, dispatch } = useAppState();
  const especialidadEditando: EspecialidadId = state.especialidad;
  const aseguradoraEditando: AseguradoraId = state.aseguradora;
  const [draft, setDraft] = useState<Overrides>(state.overrides);
  const [jsonExport, setJsonExport] = useState('');
  const [importError, setImportError] = useState('');
  const [feedbackGuardar, setFeedbackGuardar] = useState('');

  useEffect(() => {
    setDraft(state.overrides);
  }, [state.overrides]);

  const cambiosPendientes = useMemo(() => contarCambios(draft, state.overrides), [
    draft,
    state.overrides,
  ]);

  const procs = SUBPROCEDIMIENTOS[especialidadEditando];
  const numOverridesProc = Object.keys(state.overrides.procedimientos).length;
  const numOverridesGua = Object.keys(state.overrides.gua).length;
  const hayOverridesAplicados = numOverridesProc + numOverridesGua > 0;

  const setProcDraft = (procId: string, field: 'ticket' | 'margen', value: number | undefined) => {
    setDraft((d) => {
      const next: Overrides = {
        procedimientos: { ...d.procedimientos },
        gua: { ...d.gua },
      };
      const current = { ...(next.procedimientos[procId] ?? {}) };
      if (value === undefined) delete current[field];
      else current[field] = value;
      if (current.ticket === undefined && current.margen === undefined) {
        delete next.procedimientos[procId];
      } else {
        next.procedimientos[procId] = current;
      }
      return next;
    });
  };

  const setGuaDraft = (a: AseguradoraId, e: EspecialidadId, value: number | undefined) => {
    setDraft((d) => {
      const next: Overrides = {
        procedimientos: { ...d.procedimientos },
        gua: { ...d.gua },
      };
      const k = guaKey(a, e);
      if (value === undefined) delete next.gua[k];
      else next.gua[k] = value;
      return next;
    });
  };

  const handleGuardar = () => {
    const limpio = normalizar(draft);
    dispatch({ type: 'IMPORT_OVERRIDES', overrides: limpio });
    setFeedbackGuardar('Configuración guardada en este navegador');
    setTimeout(() => setFeedbackGuardar(''), 3000);
  };

  const handleDescartar = () => {
    setDraft(state.overrides);
    setFeedbackGuardar('Cambios descartados');
    setTimeout(() => setFeedbackGuardar(''), 2000);
  };

  const exportJSON = () => {
    setJsonExport(JSON.stringify(state.overrides, null, 2));
    setImportError('');
  };

  const importJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('JSON inválido');
      const overrides: Overrides = {
        procedimientos: parsed.procedimientos ?? {},
        gua: parsed.gua ?? {},
      };
      dispatch({ type: 'IMPORT_OVERRIDES', overrides });
      setImportError('');
      setFeedbackGuardar('Overrides importados');
      setTimeout(() => setFeedbackGuardar(''), 3000);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'JSON inválido');
    }
  };

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-bold text-slate-900">Configuración on-the-fly</h3>
          <p className="text-sm text-slate-600 mt-0.5">
            Edita tickets, márgenes y GUA. Tus cambios viven en un &quot;borrador&quot; hasta que
            das <strong>Guardar</strong>. Solo entonces se aplican al resto de las pestañas y
            quedan persistidos en este navegador.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hayOverridesAplicados && (
            <Badge tone="indigo">
              {numOverridesProc} proc · {numOverridesGua} GUA aplicados
            </Badge>
          )}
        </div>
      </div>

      {/* Barra de Guardar */}
      <div
        className={cn(
          'sticky top-[64px] z-10 mb-5 rounded-lg border p-3 flex items-center justify-between gap-3 flex-wrap',
          cambiosPendientes > 0
            ? 'bg-amber-50 border-amber-300'
            : 'bg-slate-50 border-slate-200',
        )}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {cambiosPendientes > 0 ? (
            <span className="text-sm font-semibold text-amber-900">
              ⚠ {cambiosPendientes} cambio{cambiosPendientes === 1 ? '' : 's'} sin guardar
            </span>
          ) : (
            <span className="text-sm text-slate-600">Sin cambios pendientes</span>
          )}
          {feedbackGuardar && (
            <span className="text-xs font-semibold text-emerald-700">✓ {feedbackGuardar}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDescartar}
            disabled={cambiosPendientes === 0}
          >
            Descartar
          </Button>
          <Button onClick={handleGuardar} disabled={cambiosPendientes === 0}>
            Guardar cambios
          </Button>
          {hayOverridesAplicados && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                dispatch({ type: 'RESET_OVERRIDES' });
                setJsonExport('');
              }}
            >
              Resetear todo
            </Button>
          )}
        </div>
      </div>

      {/* Tickets y márgenes por procedimiento */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            Tickets y márgenes · {ESPECIALIDADES[especialidadEditando]}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Edita el valor base que aplica para todas las aseguradoras. La variación por aseguradora
            (hash determinístico) se mantiene. Para editar otra especialidad, cámbiala en el filtro de
            arriba.
          </p>
        </div>

        <div className="overflow-x-auto -mx-4">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 border-y border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Sub-procedimiento</th>
                <th className="text-left px-2 py-2 font-semibold">CIE-9</th>
                <th className="text-right px-2 py-2 font-semibold">Ticket base</th>
                <th className="text-right px-2 py-2 font-semibold">Ticket override</th>
                <th className="text-right px-2 py-2 font-semibold">Margen base</th>
                <th className="text-right px-4 py-2 font-semibold">Margen override (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procs.map((p) => {
                const ov = draft.procedimientos[p.id] ?? {};
                const aplicado = state.overrides.procedimientos[p.id] ?? {};
                const isDirty =
                  ov.ticket !== aplicado.ticket || ov.margen !== aplicado.margen;
                return (
                  <tr key={p.id} className={cn(isDirty ? 'bg-amber-50/40' : '')}>
                    <td className="px-4 py-2 font-medium text-slate-900">{p.nombre}</td>
                    <td className="px-2 py-2 text-xs text-slate-500 tabular-nums">{p.cie9}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-500">
                      {fmtMXN(p.baseTicket)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <input
                        type="number"
                        step={1000}
                        min={0}
                        placeholder="—"
                        className={cn(INPUT_CLASS, 'text-right w-28')}
                        value={ov.ticket ?? ''}
                        onChange={(e) => {
                          const v = e.target.value === '' ? undefined : Number(e.target.value);
                          setProcDraft(p.id, 'ticket', Number.isFinite(v) ? v : undefined);
                        }}
                      />
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-slate-500">
                      {fmtPct(p.baseMargen)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          step={1}
                          min={0}
                          max={100}
                          placeholder="—"
                          className={cn(INPUT_CLASS, 'text-right w-20')}
                          value={
                            ov.margen !== undefined
                              ? Math.round(ov.margen * 1000) / 10
                              : ''
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                              setProcDraft(p.id, 'margen', undefined);
                              return;
                            }
                            const v = Number(raw);
                            if (!Number.isFinite(v)) return;
                            const clamped = Math.max(0, Math.min(100, v));
                            setProcDraft(p.id, 'margen', clamped / 100);
                          }}
                        />
                        <span className="text-xs text-slate-400">%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* GUA por aseguradora x especialidad */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5">
        <div className="mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            GUA · {ASEGURADORAS[aseguradoraEditando].nombre}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Monto medio que reconoce la aseguradora por especialidad. Afecta la comparación &quot;vs
            GUA&quot;. Para editar otra aseguradora, cámbiala en el filtro de arriba.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ESPECIALIDAD_IDS.map((espId) => {
            const baseGua = GUA_REFERENCIA[espId][aseguradoraEditando];
            const k = guaKey(aseguradoraEditando, espId);
            const ov = draft.gua[k];
            const aplicado = state.overrides.gua[k];
            const isDirty = ov !== aplicado;
            return (
              <div
                key={espId}
                className={cn(
                  'border rounded-md p-3 flex items-center justify-between gap-3',
                  isDirty ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200',
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {ESPECIALIDADES[espId]}
                  </div>
                  <div className="text-xs text-slate-500">Base: {fmtMXN(baseGua)}</div>
                </div>
                <input
                  type="number"
                  step={1000}
                  min={0}
                  placeholder={String(baseGua)}
                  className={cn(INPUT_CLASS, 'text-right w-32 flex-shrink-0')}
                  value={ov ?? ''}
                  onChange={(e) => {
                    const v = e.target.value === '' ? undefined : Number(e.target.value);
                    setGuaDraft(aseguradoraEditando, espId, Number.isFinite(v) ? v : undefined);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <h4 className="text-sm font-bold text-slate-900">Exportar / importar overrides</h4>
          <Button variant="secondary" size="sm" onClick={exportJSON}>
            Exportar JSON
          </Button>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Para compartir el escenario o respaldarlo. Pega un JSON para cargarlo (aplica
          inmediatamente, sin pasar por el botón Guardar).
        </p>
        <textarea
          className="w-full h-32 font-mono text-xs bg-slate-50 border border-slate-300 rounded p-2"
          value={jsonExport}
          onChange={(e) => setJsonExport(e.target.value)}
          placeholder='{"procedimientos": {}, "gua": {}}'
        />
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => importJSON(jsonExport)}>
            Importar desde JSON
          </Button>
          {importError && <span className="text-xs text-red-600">⚠ {importError}</span>}
        </div>
      </div>

      <div className="mt-5 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 leading-relaxed">
        <strong>Persistencia:</strong> los overrides aplicados (no los borradores) viven en
        localStorage del navegador. Refrescar la pestaña los conserva. Limpiar caché los borra. Para
        llevar la configuración a otra computadora, exporta el JSON y pégalo allá.
      </div>
    </>
  );
}
