'use client';

import { useState } from 'react';
import { ASEGURADORAS, ASEGURADORA_IDS, type AseguradoraId } from '@/lib/data/aseguradoras';
import { ESPECIALIDADES, ESPECIALIDAD_IDS, type EspecialidadId } from '@/lib/data/especialidades';
import { GUA_REFERENCIA } from '@/lib/data/gua';
import { SUBPROCEDIMIENTOS } from '@/lib/data/procedimientos';
import { fmtMXN, fmtPct } from '@/lib/format';
import { guaKey, useAppState } from '@/lib/state';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const INPUT_CLASS =
  'w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

export function VistaConfig() {
  const { state, dispatch } = useAppState();
  const [especialidadEditando, setEspecialidadEditando] = useState<EspecialidadId>(
    state.especialidad,
  );
  const [aseguradoraEditando, setAseguradoraEditando] = useState<AseguradoraId>(state.aseguradora);
  const [jsonExport, setJsonExport] = useState('');
  const [importError, setImportError] = useState('');

  const procs = SUBPROCEDIMIENTOS[especialidadEditando];
  const numOverridesProc = Object.keys(state.overrides.procedimientos).length;
  const numOverridesGua = Object.keys(state.overrides.gua).length;
  const hayOverrides = numOverridesProc + numOverridesGua > 0;

  const exportJSON = () => {
    setJsonExport(JSON.stringify(state.overrides, null, 2));
    setImportError('');
  };

  const importJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') throw new Error('JSON inválido');
      const overrides = {
        procedimientos: parsed.procedimientos ?? {},
        gua: parsed.gua ?? {},
      };
      dispatch({ type: 'IMPORT_OVERRIDES', overrides });
      setImportError('');
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
            Ajusta tickets, márgenes y GUA durante una sesión. Los cambios se guardan en este
            navegador (localStorage) — no se comparten ni se persisten en backend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hayOverrides && (
            <Badge tone="indigo">
              {numOverridesProc} proc · {numOverridesGua} GUA
            </Badge>
          )}
          <Button variant="secondary" size="sm" onClick={exportJSON}>
            Exportar JSON
          </Button>
          {hayOverrides && (
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
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Tickets y márgenes por procedimiento</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Editar el valor base que aplica para todas las aseguradoras. La variación por
              aseguradora (hash determinístico) se mantiene.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Especialidad
            </label>
            <select
              className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium"
              value={especialidadEditando}
              onChange={(e) => setEspecialidadEditando(e.target.value as EspecialidadId)}
            >
              {ESPECIALIDAD_IDS.map((id) => (
                <option key={id} value={id}>
                  {ESPECIALIDADES[id]}
                </option>
              ))}
            </select>
          </div>
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
                <th className="text-right px-4 py-2 font-semibold">Margen override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {procs.map((p) => {
                const ov = state.overrides.procedimientos[p.id] ?? {};
                return (
                  <tr key={p.id} className={cn(ov.ticket !== undefined || ov.margen !== undefined ? 'bg-indigo-50/40' : '')}>
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
                          dispatch({
                            type: 'SET_PROC_OVERRIDE',
                            procId: p.id,
                            field: 'ticket',
                            value: Number.isFinite(v) ? v : undefined,
                          });
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
                          step={0.01}
                          min={0}
                          max={1}
                          placeholder="—"
                          className={cn(INPUT_CLASS, 'text-right w-20')}
                          value={ov.margen ?? ''}
                          onChange={(e) => {
                            const v = e.target.value === '' ? undefined : Number(e.target.value);
                            dispatch({
                              type: 'SET_PROC_OVERRIDE',
                              procId: p.id,
                              field: 'margen',
                              value: Number.isFinite(v) ? v : undefined,
                            });
                          }}
                        />
                        <span className="text-xs text-slate-400">0–1</span>
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
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              GUA por aseguradora × especialidad
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Edita el monto medio que reconoce la aseguradora. Afecta la comparación &quot;vs GUA&quot;
              en KPIs y simulador.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              Aseguradora
            </label>
            <select
              className="bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-sm font-medium"
              value={aseguradoraEditando}
              onChange={(e) => setAseguradoraEditando(e.target.value as AseguradoraId)}
            >
              {ASEGURADORA_IDS.map((id) => (
                <option key={id} value={id}>
                  {ASEGURADORAS[id].nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ESPECIALIDAD_IDS.map((espId) => {
            const baseGua = GUA_REFERENCIA[espId][aseguradoraEditando];
            const ov = state.overrides.gua[guaKey(aseguradoraEditando, espId)];
            return (
              <div
                key={espId}
                className={cn(
                  'border border-slate-200 rounded-md p-3 flex items-center justify-between gap-3',
                  ov !== undefined ? 'bg-indigo-50/40' : 'bg-white',
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
                    dispatch({
                      type: 'SET_GUA_OVERRIDE',
                      aseguradora: aseguradoraEditando,
                      especialidad: espId,
                      value: Number.isFinite(v) ? v : undefined,
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-bold text-slate-900 mb-1">Exportar / importar overrides</h4>
        <p className="text-xs text-slate-500 mb-3">
          Para compartir el escenario con otra persona o respaldarlo. Pega un JSON para cargarlo.
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
        <strong>Persistencia:</strong> los overrides viven en localStorage del navegador. Refrescar
        la pestaña los conserva. Limpiar caché del navegador los borra. Para llevar la
        configuración a otra computadora, exporta el JSON y pégalo allá.
      </div>
    </>
  );
}
