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
    <div className="border-b border-slate-200 px-4">
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
  );
}
