'use client';

import type { AseguradoraId } from '@/lib/data/aseguradoras';
import { ESPECIALIDADES } from '@/lib/data/especialidades';
import { useAppState, useAseguradoras, type EspecialidadFiltro } from '@/lib/state';
import { Button } from './ui/button';
import type { Periodo } from '@/lib/calc';

const PERIODOS: Array<{ id: Periodo; label: string }> = [
  { id: '12m', label: 'Últimos 12 meses' },
  { id: '6m', label: 'Últimos 6 meses' },
  { id: 'ytd', label: 'Año en curso' },
];

const SELECT_CLASS =
  'w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
const LABEL_CLASS =
  'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

export function FilterBar() {
  const { state, dispatch } = useAppState();
  const aseguradoras = useAseguradoras();

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 mb-5">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-end gap-3 sm:gap-4">
        <div className="col-span-2 sm:flex-1 sm:min-w-[200px]">
          <label className={LABEL_CLASS} htmlFor="sel-aseguradora">
            Aseguradora
          </label>
          <select
            id="sel-aseguradora"
            className={SELECT_CLASS}
            value={state.aseguradora}
            onChange={(e) => dispatch({ type: 'SET_ASEGURADORA', value: e.target.value as AseguradoraId })}
          >
            {Object.entries(aseguradoras)
              .sort(([, a], [, b]) => a.nombre.localeCompare(b.nombre, 'es'))
              .map(([id, a]) => (
                <option key={id} value={id}>
                  {a.nombre}
                </option>
              ))}
          </select>
        </div>
        <div className="col-span-2 sm:flex-1 sm:min-w-[200px]">
          <label className={LABEL_CLASS} htmlFor="sel-especialidad">
            Especialidad
          </label>
          <select
            id="sel-especialidad"
            className={SELECT_CLASS}
            value={state.especialidad}
            onChange={(e) =>
              dispatch({ type: 'SET_ESPECIALIDAD', value: e.target.value as EspecialidadFiltro })
            }
          >
            <option value="todas">Todas las especialidades</option>
            {Object.entries(ESPECIALIDADES)
              .sort(([, a], [, b]) => a.localeCompare(b, 'es'))
              .map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
          </select>
        </div>
        <div className="col-span-1 sm:flex-1 sm:min-w-[160px]">
          <label className={LABEL_CLASS} htmlFor="sel-periodo">
            Periodo
          </label>
          <select
            id="sel-periodo"
            className={SELECT_CLASS}
            value={state.periodo}
            onChange={(e) => dispatch({ type: 'SET_PERIODO', value: e.target.value as Periodo })}
          >
            {PERIODOS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1 sm:flex-none flex sm:items-end">
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => dispatch({ type: 'RESET_SIM' })}
          >
            Reiniciar simulación
          </Button>
        </div>
      </div>
    </div>
  );
}
