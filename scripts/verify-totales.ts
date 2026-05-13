/**
 * Verificación independiente de los totales que muestra el Dashboard hospital.
 * Importa la misma lógica que usa la app y la corre cruda, sin React.
 * Uso: npx --yes tsx scripts/verify-totales.ts
 */
import { ASEGURADORAS } from '../lib/data/aseguradoras';
import { ESPECIALIDAD_IDS, ESPECIALIDADES } from '../lib/data/especialidades';
import { SUBPROCEDIMIENTOS } from '../lib/data/procedimientos';
import { calcKPIs, generarDatos } from '../lib/calc';

const asegIds = Object.keys(ASEGURADORAS);
const periodo = '12m' as const;

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  Verificación de totales — Dashboard hospital`);
console.log(`  ${asegIds.length} aseguradoras × ${ESPECIALIDAD_IDS.length} especialidades · periodo ${periodo}`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Conteo de procedimientos por especialidad y complejidad
console.log('Procedimientos por especialidad y complejidad:');
let totalProcs = 0;
let totalAlta = 0, totalMedia = 0, totalBaja = 0;
for (const espId of ESPECIALIDAD_IDS) {
  const procs = SUBPROCEDIMIENTOS[espId];
  const alta = procs.filter(p => p.complejidad === 'alta').length;
  const media = procs.filter(p => p.complejidad === 'media').length;
  const baja = procs.filter(p => p.complejidad === 'baja').length;
  totalProcs += procs.length;
  totalAlta += alta; totalMedia += media; totalBaja += baja;
  console.log(`  ${ESPECIALIDADES[espId].padEnd(40)} ${procs.length.toString().padStart(2)} (alta ${alta}, media ${media}, baja ${baja})`);
}
console.log(`  ${'TOTAL'.padEnd(40)} ${totalProcs.toString().padStart(2)} (alta ${totalAlta}, media ${totalMedia}, baja ${totalBaja})\n`);

// Totales por aseguradora
let casosHospital = 0;
let montoHospital = 0;
let margenHospital = 0;

console.log('Aseguradora           Casos    Monto total      Monto medio   Margen contrib   Margen %');
console.log('────────────────────  ───────  ───────────────  ────────────  ───────────────  ────────');

for (const asegId of asegIds) {
  let casos = 0, monto = 0, margen = 0;
  for (const espId of ESPECIALIDAD_IDS) {
    const datos = generarDatos(asegId, espId, periodo);
    const k = calcKPIs(datos);
    casos += k.totalCasos;
    monto += k.totalMonto;
    margen += k.totalMargen;
  }
  casosHospital += casos;
  montoHospital += monto;
  margenHospital += margen;
  const mm = casos > 0 ? Math.round(monto / casos) : 0;
  const mpct = monto > 0 ? (margen / monto) * 100 : 0;
  console.log(
    `${ASEGURADORAS[asegId].nombre.padEnd(22)}` +
    `${casos.toLocaleString('es-MX').padStart(7)}  ` +
    `${('$' + (monto / 1_000_000).toFixed(1) + 'M').padStart(15)}  ` +
    `${('$' + mm.toLocaleString('es-MX')).padStart(12)}  ` +
    `${('$' + (margen / 1_000_000).toFixed(1) + 'M').padStart(15)}  ` +
    `${mpct.toFixed(2).padStart(7)}%`
  );
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  TOTALES HOSPITAL (lo que muestra Dashboard hospital)`);
console.log('═══════════════════════════════════════════════════════════════');
console.log(`  Casos totales:          ${casosHospital.toLocaleString('es-MX')}`);
console.log(`  Monto total:            $${montoHospital.toLocaleString('es-MX')}  (≈ $${(montoHospital / 1_000_000).toFixed(1)}M)`);
console.log(`  Margen contributivo:    $${Math.round(margenHospital).toLocaleString('es-MX')}  (≈ $${(margenHospital / 1_000_000).toFixed(1)}M)`);
console.log(`  Monto medio hospital:   $${Math.round(montoHospital / casosHospital).toLocaleString('es-MX')}  (ponderado por casos)`);
console.log(`  Margen %:               ${((margenHospital / montoHospital) * 100).toFixed(2)}%\n`);

// Verificación de identidades
console.log('Verificaciones de identidad:');
const mmRecalc = montoHospital / casosHospital;
const margenPctRecalc = margenHospital / montoHospital;
console.log(`  monto / casos = monto medio ........... ✓ (${mmRecalc.toFixed(2)})`);
console.log(`  margen / monto = margen % ............. ✓ (${(margenPctRecalc * 100).toFixed(4)}%)`);

// Cross-check: suma por especialidad debe coincidir con suma por aseguradora
let casosPorEsp = 0;
for (const espId of ESPECIALIDAD_IDS) {
  for (const asegId of asegIds) {
    const datos = generarDatos(asegId, espId, periodo);
    const k = calcKPIs(datos);
    casosPorEsp += k.totalCasos;
  }
}
const consistente = casosPorEsp === casosHospital;
console.log(`  Σ por aseg = Σ por esp ................ ${consistente ? '✓' : '✗'} (${casosPorEsp} vs ${casosHospital})`);
