'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ASEGURADORAS, ASEGURADORA_IDS } from '@/lib/data/aseguradoras';
import { ESPECIALIDADES, ESPECIALIDAD_IDS } from '@/lib/data/especialidades';
import { calcKPIs, generarDatos, resolveGUA } from '@/lib/calc';
import { fmtMXN, fmtMXNCompact } from '@/lib/format';
import { useAppState } from '@/lib/state';

interface BarEsp {
  especialidad: string;
  especialidadId: string;
  montoMedio: number;
  gua: number;
  casos: number;
}

interface BarAseg {
  aseguradora: string;
  aseguradoraId: string;
  montoMedio: number;
  margen: number;
  casos: number;
}

export function VistaDashboard() {
  const { state, dispatch } = useAppState();

  const porEspecialidad: BarEsp[] = ESPECIALIDAD_IDS.map((espId) => {
    const datos = generarDatos(state.aseguradora, espId, state.periodo, state.overrides);
    const k = calcKPIs(datos);
    return {
      especialidad: ESPECIALIDADES[espId],
      especialidadId: espId,
      montoMedio: k.montoMedio,
      gua: resolveGUA(state.aseguradora, espId, state.overrides),
      casos: k.totalCasos,
    };
  });

  let montoTotalHospital = 0;
  let casosTotalHospital = 0;
  let margenTotalHospital = 0;
  const porAseguradora: BarAseg[] = ASEGURADORA_IDS.map((asegId) => {
    let monto = 0;
    let casos = 0;
    let margen = 0;
    for (const espId of ESPECIALIDAD_IDS) {
      const datos = generarDatos(asegId, espId, state.periodo);
      const k = calcKPIs(datos);
      monto += k.totalMonto;
      casos += k.totalCasos;
      margen += k.totalMargen;
    }
    montoTotalHospital += monto;
    casosTotalHospital += casos;
    margenTotalHospital += margen;
    return {
      aseguradora: ASEGURADORAS[asegId].nombre,
      aseguradoraId: asegId,
      montoMedio: casos > 0 ? monto / casos : 0,
      margen: monto > 0 ? margen / monto : 0,
      casos,
    };
  });

  const montoMedioHospital = casosTotalHospital > 0 ? montoTotalHospital / casosTotalHospital : 0;
  const margenPctHospital = montoTotalHospital > 0 ? margenTotalHospital / montoTotalHospital : 0;

  return (
    <>
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Dashboard hospital</h3>
        <p className="text-sm text-slate-600 mt-0.5">
          Vista agregada: monto medio por especialidad para la aseguradora seleccionada, y monto
          medio por aseguradora across todas las especialidades.
        </p>
      </div>

      {/* KPIs hospital */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <SummaryCard
          label="Monto medio hospital"
          value={fmtMXN(montoMedioHospital)}
          hint="Ponderado por casos · todas las aseguradoras × especialidades"
        />
        <SummaryCard
          label="Casos totales"
          value={casosTotalHospital.toLocaleString('es-MX')}
          hint={`Periodo ${state.periodo}`}
        />
        <SummaryCard
          label="Monto total"
          value={fmtMXNCompact(montoTotalHospital)}
          hint={`Margen ${(margenPctHospital * 100).toFixed(1)}%`}
        />
        <SummaryCard
          label="Margen contributivo"
          value={fmtMXNCompact(margenTotalHospital)}
          hint="Total acumulado del periodo"
        />
      </div>

      {/* Por especialidad */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-5">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Monto medio por especialidad · {ASEGURADORAS[state.aseguradora].nombre}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparado contra GUA de la aseguradora. Click en una barra para abrir esa especialidad.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-indigo-600 rounded-sm" /> Monto medio
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 bg-amber-400 rounded-sm" /> GUA
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={porEspecialidad} margin={{ top: 10, right: 20, left: 10, bottom: 70 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="especialidad"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={80}
            />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => fmtMXN(v)}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Bar
              dataKey="montoMedio"
              fill="#4f46e5"
              name="Monto medio"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            >
              {porEspecialidad.map((entry) => (
                <Cell
                  key={entry.especialidadId}
                  onClick={() =>
                    dispatch({ type: 'SET_ESPECIALIDAD', value: entry.especialidadId as never })
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="gua" fill="#fbbf24" name="GUA" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Por aseguradora */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Monto medio por aseguradora · hospital completo
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Promedio ponderado por casos across todas las especialidades. Línea punteada = promedio
              hospital.
            </p>
          </div>
          <span className="text-xs text-slate-600">Click en una barra para seleccionarla</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={porAseguradora}
            margin={{ top: 10, right: 20, left: 10, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="aseguradora"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-35}
              textAnchor="end"
            />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number) => fmtMXN(v)}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
            />
            <ReferenceLine
              y={montoMedioHospital}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{
                value: `Hospital: ${fmtMXN(montoMedioHospital)}`,
                position: 'insideTopRight',
                fontSize: 10,
                fill: '#475569',
              }}
            />
            <Bar
              dataKey="montoMedio"
              fill="#4f46e5"
              name="Monto medio"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
            >
              {porAseguradora.map((entry) => (
                <Cell
                  key={entry.aseguradoraId}
                  fill={entry.aseguradoraId === state.aseguradora ? '#10b981' : '#4f46e5'}
                  onClick={() =>
                    dispatch({ type: 'SET_ASEGURADORA', value: entry.aseguradoraId as never })
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 leading-relaxed">
        <strong>Lectura:</strong> Las aseguradoras con monto medio muy por encima del promedio
        hospital son donde más urge ajustar mezcla. Las que están por debajo representan
        oportunidad para empujar volumen sin romper su GUA. La barra verde es la aseguradora
        seleccionada en el filtro.
      </div>
    </>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{hint}</div>
    </div>
  );
}
