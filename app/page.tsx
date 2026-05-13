'use client';

import { FilterBar } from '@/components/filter-bar';
import { Header } from '@/components/header';
import { KPICards } from '@/components/kpi-cards';
import { Tabs } from '@/components/tabs';
import { VistaCandidatos } from '@/components/vista-candidatos';
import { VistaConfig } from '@/components/vista-config';
import { VistaDashboard } from '@/components/vista-dashboard';
import { VistaMetas } from '@/components/vista-metas';
import { VistaMezcla } from '@/components/vista-mezcla';
import { VistaSimulador } from '@/components/vista-simulador';
import { useAppState } from '@/lib/state';

export default function Page() {
  const { state } = useAppState();
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-5">
        <FilterBar />
        <KPICards />
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Tabs />
          <div className="p-5">
            {state.tab === 'mezcla' && <VistaMezcla />}
            {state.tab === 'candidatos' && <VistaCandidatos />}
            {state.tab === 'simulador' && <VistaSimulador />}
            {state.tab === 'dashboard' && <VistaDashboard />}
            {state.tab === 'metas' && <VistaMetas />}
            {state.tab === 'config' && <VistaConfig />}
          </div>
        </div>
        <footer className="mt-8 text-center text-xs text-slate-500 pb-6">
          <p>
            SAMMP Portfolio Mix Manager · Prueba de concepto generada con datos sintéticos
            representativos del mercado mexicano de gastos médicos mayores.
          </p>
          <p className="mt-1">
            Aseguradoras y montos GUA referenciados son ilustrativos. Construido para validación con
            dirección comercial.
          </p>
        </footer>
      </main>
    </>
  );
}
