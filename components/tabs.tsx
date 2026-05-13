'use client';

import { useAppState, type TabId } from '@/lib/state';
import { cn } from '@/lib/utils';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'mezcla', label: 'Mezcla actual' },
  { id: 'simulador', label: 'Simulador de mezcla' },
  { id: 'dashboard', label: 'Dashboard hospital' },
  { id: 'metas', label: 'Metas comerciales' },
  { id: 'config', label: 'Configuración' },
];

export function Tabs() {
  const { state, dispatch } = useAppState();
  return (
    <>
      {/* Mobile: select nativo */}
      <div className="sm:hidden border-b border-slate-200 px-4 py-2">
        <label className="sr-only" htmlFor="sel-tab">
          Sección
        </label>
        <select
          id="sel-tab"
          value={state.tab}
          onChange={(e) => dispatch({ type: 'SET_TAB', value: e.target.value as TabId })}
          className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-sm font-semibold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {TABS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: tabs horizontales */}
      <div className="hidden sm:block border-b border-slate-200 px-4">
        <nav className="flex gap-1 -mb-px flex-wrap">
          {TABS.map((t) => {
            const active = state.tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => dispatch({ type: 'SET_TAB', value: t.id })}
                className={cn(
                  'px-4 py-3 text-sm font-semibold border-b-2 transition',
                  active
                    ? 'text-indigo-700 border-indigo-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
