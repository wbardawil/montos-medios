# SAMMP — Portfolio Mix Manager

Prototipo PoC para la dirección comercial de un hospital privado mexicano. Administra la mezcla de portafolio de sub-procedimientos por aseguradora × especialidad y permite simular ajustes de volumen para bajar el monto medio agregado sin destruir margen.

5 vistas: **Mezcla actual** (tabla con CIE-9/CIE-10) · **Candidatos a push** · **Simulador de mezcla** (con optimizador automático) · **Dashboard hospital** (barras por especialidad y aseguradora) · **Configuración** (overrides on-the-fly).

Ver [`CLAUDE.md`](./CLAUDE.md) para contexto completo de producto y reglas de desarrollo.

## Stack

Next.js 14 (App Router) · TypeScript estricto · Tailwind v3 · Recharts · Deploy en Vercel.

## Correr local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

## Build y type-check

```bash
npm run build   # corre TypeScript + ESLint + bundle
npm run start   # sirve el build de producción
```

## Estructura

```
app/                  ← layout + page (entry)
components/           ← UI por vista + primitivos en /ui/
lib/data/             ← datos sintéticos (aseguradoras, procedimientos con CIE, GUA, perfiles)
lib/calc.ts           ← cálculo puro (generarDatos, calcKPIs, identificarCandidatos, calcImpactoVsGUA, resolveGUA)
lib/optimizer.ts      ← optimizador heurístico greedy
lib/state.tsx         ← Context + useReducer + localStorage (overrides)
lib/format.ts         ← fmtMXN, fmtMXNCompact, fmtPct
```

## Dónde editar para iterar

### Vía código (requiere redeploy)
| Cambio                                  | Archivo                                    |
|-----------------------------------------|--------------------------------------------|
| Agregar/quitar aseguradora              | `lib/data/aseguradoras.ts` (+ `perfiles.ts` y `gua.ts`) |
| Agregar/quitar especialidad             | `lib/data/especialidades.ts` (+ `procedimientos.ts` y `gua.ts`) |
| Agregar sub-procedimiento               | `lib/data/procedimientos.ts`               |
| Cambiar CIE-9 o CIE-10 de un proc       | `lib/data/procedimientos.ts`               |
| Ajustar umbrales de candidatos          | `lib/calc.ts` (función `identificarCandidatos`) |
| Cambiar lógica del optimizador          | `lib/optimizer.ts`                         |

### Vía UI (en vivo, sin redeploy)
Pestaña **Configuración** dentro de la app:
- Override ticket o margen de cada procedimiento (filtrable por especialidad)
- Override GUA por aseguradora × especialidad
- Exportar/importar overrides como JSON
- Reset total

Los overrides se guardan en localStorage del navegador (key `sammp-overrides-v1`). Sobreviven al refresh pero NO se comparten entre dispositivos. Para llevarlos a otra máquina: Exportar JSON → copiar → Importar allá.

## Qué NO tocar durante una demo en vivo

Solo edita `lib/data/*`, `lib/calc.ts` y `lib/optimizer.ts`. Los componentes en `components/` y `app/` son UI estructural — modificarlos en vivo puede romper el render. Para tweaks de números/copy durante la demo usa la **pestaña Configuración**.

## Deploy en Vercel (la ruta más rápida)

### Opción A — Importar desde GitHub (recomendada, ~5 min)

1. Empuja este repo a GitHub:
   ```bash
   git push -u origin claude/sammp-prompt-package-rk4y7
   ```
2. Entra a https://vercel.com/new
3. Login con tu cuenta de GitHub si no estás logueado.
4. Click **Import Git Repository** → selecciona `wbardawil/montos-medios`.
5. Project Name: `sammp` (o el que prefieras). Framework: Vercel detecta Next.js automáticamente.
6. Branch a deployar: `claude/sammp-prompt-package-rk4y7` (o haz merge a `main` primero si prefieres).
7. Click **Deploy**. En ~60s tienes una URL `sammp-xxx.vercel.app`.
8. Cada `git push` futuro al branch configurado dispara un redeploy automático en ~30-60s.

### Opción B — CLI

```bash
npm i -g vercel
vercel login
vercel              # primera vez, acepta defaults; crea el proyecto
vercel --prod       # deploy de producción
```

### Configuración recomendada en Vercel

- **Production Branch**: `main` (haz merge cuando esté listo para producción)
- **Preview Branches**: `claude/sammp-prompt-package-rk4y7` (cada push genera URL preview)
- **Domain**: por defecto `*.vercel.app`. Si tienes dominio propio (`sammp.tuempresa.mx`), agrégalo en Settings → Domains.
- **Environment variables**: no se requieren en esta fase (sin backend).

### Plan de liberación (días, no semanas)

| Día | Acción |
|---|---|
| Día 0 (hoy) | Push a GitHub, conectar Vercel, primer deploy. Mandar URL a la dirección general para visibilidad. |
| Día 1 | Sesión con el director comercial sobre `vercel.app`. Tomar notas. Iteraciones chicas las haces con la pestaña Configuración en vivo. |
| Día 2 | Pasar las decisiones de la sesión a `/lib/data/` (ticket bases, GUAs reales) y `lib/optimizer.ts` (límites por defecto) — commit + push, redeploy automático. |
| Día 3 | Demo formal con dirección general sobre URL estable. Confirmar Fase 2 (catálogo HIS real, persistencia, auth). |

## Configuración on-the-fly: cómo se usa en una demo

1. Abre el deploy en Vercel en otra ventana.
2. En la pestaña **Configuración**:
   - Si el director dice "el ticket de artroplastia de cadera ya está en 280K, no 295K" → escribe 280000 en la columna *Ticket override*. Los KPIs de toda la app se actualizan al instante.
   - Si dice "MetLife nos reconoce 100K de GUA en ortopedia, no 105K" → cambia ortopedia para MetLife.
   - Si dice "guarda este escenario" → click **Exportar JSON**, copia el bloque, péguenlo en un Notion o doc compartido.
3. Vuelve a la pestaña **Simulador**, dale **Optimizar**, y muestra cómo cambian las recomendaciones con los nuevos valores.
4. Al final de la sesión: **Resetear todo** si no quieres dejar overrides en el navegador, o **Exportar JSON** para llevárte el snapshot.

## Commits + push manuales

```bash
git add .
git commit -m "feat: <qué cambió>"
git push -u origin claude/sammp-prompt-package-rk4y7
```

## Disclaimer

Todos los datos son sintéticos. Aseguradoras, montos GUA, tickets, márgenes y códigos CIE asignados son ilustrativos y no representan tarifas ni catálogos reales. Construido para validar la lógica del producto con dirección comercial antes de invertir en infra (HIS, Postgres, auth).
