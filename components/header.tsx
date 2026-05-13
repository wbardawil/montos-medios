import { HOSPITAL } from '@/lib/data/hospital';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            S
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm sm:text-base leading-tight truncate">
              SAMMP{' '}
              <span className="font-normal text-slate-400 text-xs ml-1 hidden sm:inline">
                Portfolio Mix Manager
              </span>
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">
              {HOSPITAL.nombre} · {HOSPITAL.camas} camas · ~{HOSPITAL.cirugiasPromedioMes}{' '}
              cirugías/mes · Dirección comercial
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 flex-shrink-0">
          <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 font-medium whitespace-nowrap">
            <span className="hidden sm:inline">⚠ Datos sintéticos · </span>
            <span className="sm:hidden">⚠ </span>
            PoC
          </span>
          <span className="hidden sm:inline">Mayo 2026</span>
        </div>
      </div>
    </header>
  );
}
