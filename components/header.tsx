import { HOSPITAL } from '@/lib/data/hospital';

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div>
            <div className="font-bold text-base leading-tight">
              SAMMP{' '}
              <span className="font-normal text-slate-400 text-xs ml-1">
                Portfolio Mix Manager
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {HOSPITAL.nombre} · {HOSPITAL.camas} camas · ~{HOSPITAL.cirugiasPromedioMes}{' '}
              cirugías/mes · Dirección comercial
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 font-medium">
            ⚠ Datos sintéticos · PoC
          </span>
          <span>Mayo 2026</span>
        </div>
      </div>
    </header>
  );
}
