# Paquete de prompts para construir SAMMP con Claude Code

**Uso:** Crea un repo nuevo `sammp/`, coloca `sammp_mockup.html` en la raíz, copia el contenido de la sección 1 a un archivo `CLAUDE.md` en la raíz, y luego corre Claude Code dentro de ese directorio con el prompt de la sección 2.

---

## 1. Contenido para `CLAUDE.md`

Crea un archivo llamado `CLAUDE.md` en la raíz del proyecto y pega esto exactamente:

```markdown
# SAMMP — Portfolio Mix Manager

## Producto
Herramienta interna para el director comercial de un hospital privado mexicano. Administra la mezcla de portafolio de sub-procedimientos por aseguradora × especialidad. Objetivo principal: poder bajar el monto medio agregado por especialidad sin destruir margen, identificando qué sub-procedimientos de alto margen y bajo ticket conviene impulsar en volumen.

Esto NO es un sistema de cobranza, glosa, o contratos. Es exclusivamente análisis de mezcla y simulación.

## Usuario primario
Director comercial del hospital. No es técnico. La UI debe ser de un vistazo, sin requerir entrenamiento.

## Stack obligatorio
- Next.js 14 con App Router
- TypeScript estricto (no `any`)
- Tailwind CSS
- shadcn/ui para componentes (Button, Card, Tabs, Select, Slider, Table, Badge)
- Deploy en Vercel
- Sin base de datos en esta fase. Datos como constantes TypeScript en `/lib/data/`.

## Reglas de oro
1. **Iteración instantánea.** Cualquier cambio (agregar aseguradora, cambiar ticket, ajustar margen, modificar copy) debe ser una sola edición en un solo archivo, con hot reload visible en <1 segundo.
2. **Datos separados de lógica separados de UI.** `/lib/data/` solo datos. `/lib/calc.ts` solo cálculo puro testeable. `/components/` solo UI.
3. **Mexican peso formatting siempre.** `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })`. Versión compact para sumas grandes: $1.2M, $850K.
4. **Sentence case en español.** "Mezcla actual" no "Mezcla Actual" ni "MEZCLA ACTUAL".
5. **Sin loading states ni spinners.** Todo es síncrono sobre constantes locales.
6. **Tabular numbers en todas las cifras.** `font-variant-numeric: tabular-nums`.
7. **No agregues features no pedidas.** Si crees que falta algo, propón en chat antes de construir.

## Modelo de datos (en `/lib/data/`)

```typescript
// aseguradoras.ts
export type AseguradoraId = 'gnp' | 'axa' | 'metlife' | 'monterrey' | 'mapfre' | 'bbva' | 'inbursa' | 'banorte' | 'allianz' | 'atlas' | 'qualitas' | 'panamerican';
export const ASEGURADORAS: Record<AseguradoraId, { nombre: string }> = { ... };

// especialidades.ts
export type EspecialidadId = 'ortopedia' | 'cardio' | 'cirgral' | 'gineco';
export const ESPECIALIDADES: Record<EspecialidadId, string> = { ... };

// procedimientos.ts
export interface SubProcedimiento {
  id: string;
  nombre: string;
  baseTicket: number;       // MXN
  baseMargen: number;       // 0.0-1.0
  complejidad: 'alta' | 'media' | 'baja';
}
export const SUBPROCEDIMIENTOS: Record<EspecialidadId, SubProcedimiento[]> = { ... };

// gua.ts — Gasto Usual y Acostumbrado de referencia
export const GUA_REFERENCIA: Record<EspecialidadId, Record<AseguradoraId, number>> = { ... };

// perfiles.ts — modificador de volumen por aseguradora (refleja perfil premium vs masivo)
export const PERFIL_ASEGURADORA: Record<AseguradoraId, { alta: number; media: number; baja: number }> = { ... };
```

## Estructura de archivos esperada
```
sammp/
├── CLAUDE.md
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── app/
│   ├── layout.tsx
│   ├── page.tsx            ← entry, monta el dashboard
│   └── globals.css
├── components/
│   ├── header.tsx
│   ├── filter-bar.tsx
│   ├── kpi-cards.tsx
│   ├── tabs.tsx
│   ├── vista-mezcla.tsx
│   ├── vista-candidatos.tsx
│   └── vista-simulador.tsx
├── lib/
│   ├── data/
│   │   ├── aseguradoras.ts
│   │   ├── especialidades.ts
│   │   ├── procedimientos.ts
│   │   ├── gua.ts
│   │   └── perfiles.ts
│   ├── calc.ts             ← generarDatos, aplicarSimulacion, calcKPIs, identificarCandidatos
│   ├── format.ts           ← fmtMXN, fmtMXNCompact, fmtPct
│   └── state.tsx           ← Context + Provider para estado global
└── ui/                     ← shadcn components instalados aquí
```

## Comportamiento de cada vista

### Mezcla actual
Tabla con todos los sub-procedimientos de la especialidad seleccionada para la aseguradora seleccionada. Columnas: nombre, complejidad (badge color), casos, ticket promedio, % volumen, % monto (rojo si >15%), margen %, margen contributivo. Tfoot con totales y monto medio ponderado.

### Candidatos a push
Lista de cards con sub-procedimientos donde margen ≥ p60 y ticket ≤ p40. Cada card muestra el sub-procedimiento, ticket actual, margen, y el impacto proyectado si se duplica el volumen (cambio en monto medio + margen adicional). Botón "Agregar al simulador" que pre-popula la simulación y cambia a la siguiente tab.

### Simulador de mezcla
- Comparación lado a lado: situación actual vs simulada (casos totales, monto medio, gap vs GUA, margen contributivo)
- Slider + botones +/− por cada sub-procedimiento
- Texto interpretativo automático al pie cuando hay simulación activa
- Reset button para limpiar la simulación

## Estados a manejar (Context global)
- `aseguradoraId: AseguradoraId` (default: 'gnp')
- `especialidadId: EspecialidadId` (default: 'ortopedia')
- `periodo: '12m' | '6m' | 'ytd'` (default: '12m')
- `tab: 'mezcla' | 'candidatos' | 'simulador'` (default: 'mezcla')
- `simulacion: Record<string, number>` (procId → delta de casos)

Cambiar aseguradora o especialidad debe resetear la simulación.

## Lo que NO existe en esta versión
- Auth / login
- Persistencia (todo session-only, refresh borra la simulación)
- Integración con HIS, Postgres, o `cuenta_paciente_ue`
- Multi-usuario
- Exportar a PDF
- Módulo de cobranza, glosa, o contratos (eso es "Sistema B", proyecto distinto)
- Cualquier feature no listada arriba

Si pides agregar algo de esta lista, primero confirmo en chat antes de construir.
```

---

## 2. Prompt inicial (bootstrap) para Claude Code

Pega este prompt como tu primer mensaje a Claude Code después de tener `CLAUDE.md` y `sammp_mockup.html` en la raíz del repo:

```
Lee primero CLAUDE.md y sammp_mockup.html para entender qué vamos a construir.

Tu tarea: construir el proyecto Next.js 14 descrito en CLAUDE.md, replicando fielmente el comportamiento, los cálculos, los datos sintéticos, y el diseño visual del mockup HTML. La salida debe ser un proyecto que corra con `npm run dev` y se despliegue a Vercel con `vercel deploy --prod`.

Reglas específicas:

1. Inicializa el proyecto con `npx create-next-app@latest sammp-app --typescript --tailwind --app --src-dir=false --import-alias="@/*"` dentro de un subdirectorio nuevo, o configura todo en la raíz si prefieres — tú decides pero documenta la decisión.

2. Instala shadcn/ui y los componentes que necesites: button, card, tabs, select, slider, table, badge.

3. Extrae TODOS los datos del mockup HTML hacia archivos TypeScript en /lib/data/, uno por entidad. Mantén exactamente los mismos valores numéricos del mockup.

4. Refactoriza la lógica de cálculo del mockup (funciones generarDatos, aplicarSimulacion, calcKPIs, identificarCandidatos, hash) hacia /lib/calc.ts como funciones puras tipadas. Las funciones deben aceptar inputs explícitos, no leer de estado global.

5. Implementa el estado global con React Context + useReducer en /lib/state.tsx. Provider en app/layout.tsx.

6. Construye los componentes mencionados en CLAUDE.md uno por uno. Cada componente debe ser <200 líneas. Si crece más, divídelo.

7. Iconografía: usa lucide-react para los íconos que necesites. Mínimo y sutil.

8. Antes de declarar terminado:
   - Ejecuta `npm run build` y resuelve cualquier error de TypeScript o ESLint.
   - Ejecuta `npm run dev` y confirma que abre en localhost:3000.
   - Verifica que las tres vistas funcionan: cambiar filtros, agregar al simulador desde candidatos, mover sliders.

9. Crea un README.md corto con:
   - Cómo correr local
   - Cómo desplegar a Vercel
   - Dónde editar para cambiar aseguradoras, procedimientos, tickets, márgenes
   - Qué archivos NO tocar durante una demo en vivo (los componentes — solo editar /lib/data/)

10. Cuando termines, listame los comandos exactos para:
    - Correr local
    - Hacer commit y push a GitHub
    - Desplegar a Vercel

Empieza leyendo los dos archivos mencionados y proponme la estructura de carpetas final antes de crear archivos. Una vez que confirme, procede.
```

---

## 3. Cheatsheet de prompts para iteración en vivo

Estos son los prompts más útiles durante la sesión con el director comercial. Tenlos abiertos en otra ventana para copiar y pegar rápido. Cada uno está diseñado para cambios de 1-2 archivos con hot reload visible.

### Cambios de data

```
Agrega una nueva aseguradora a /lib/data/aseguradoras.ts:
- id: 'sura', nombre: 'Sura Seguros'
Asígnale un perfil mixto en /lib/data/perfiles.ts (alta: 0.9, media: 1.0, baja: 1.1)
y GUAs en /lib/data/gua.ts:
- ortopedia: 95000, cardio: 175000, cirgral: 78000, gineco: 68000
```

```
Cambia el ticket base de "Artroplastia total de rodilla" de 265,000 a 240,000
en /lib/data/procedimientos.ts. Solo ese campo, nada más.
```

```
Aumenta el margen base de "Artroscopia de rodilla" de 0.35 a 0.40
en /lib/data/procedimientos.ts.
```

```
Agrega un nuevo sub-procedimiento a Ortopedia en /lib/data/procedimientos.ts:
- id: 'fractura_cadera'
- nombre: 'Reducción de fractura de cadera'
- baseTicket: 185000
- baseMargen: 0.20
- complejidad: 'media'
```

### Cambios de copy y UX

```
Cambia el texto de "Mezcla actual" a "Mezcla del portafolio" en la tab,
en el header de la vista, y en el title del card. Busca exactamente esa
cadena en /components/ y reemplaza.
```

```
En la interpretación automática del simulador, cuando la mezcla es ideal
(monto medio baja y margen sube), agrega al final esta frase:
"Recomendación: incluir en la propuesta del próximo QBR con la aseguradora."
```

```
Agrega un campo "Notas internas" como textarea al final del simulador
que se persista solo en memoria (no en backend) usando el Context global.
Etiqueta: "Notas para reunión interna". Sin guardar a backend.
```

### Ajustes de cálculo

```
Ajusta el umbral de candidatos a push en /lib/calc.ts:
- margen mínimo: cambiar de p60 a p50
- ticket máximo: cambiar de p40 a p50
Quiero que aparezcan más candidatos.
```

```
En /lib/calc.ts agrega una nueva función `calcImpactoVsGUA` que reciba KPIs
y el GUA, y devuelva un objeto { gap_pct, severidad: 'critica' | 'alta' | 'media' | 'baja' | 'oportunidad' }
basado en:
- gap > 25%: critica
- gap entre 15-25%: alta
- gap entre 5-15%: media
- gap entre 0-5%: baja
- gap < 0%: oportunidad
Úsala en el KPI card del header.
```

### Visualización

```
Agrega un mini gráfico de barras horizontales en la vista Mezcla
que muestre la distribución de monto total por sub-procedimiento
(top 10). Usa recharts. Coloca arriba de la tabla, debajo del header
de la vista. Altura 200px máximo.
```

```
En la vista Candidatos a push, agrega un sparkline simple al lado del
ticket actual que muestre 12 puntos sintéticos generados con variación
del 10% sobre el baseline. Solo decorativo, no datos reales.
```

### Cambios de scope (más profundos — solo si el director pide algo grande)

```
Agrega una nueva vista "Comparador" como cuarta tab. Permite seleccionar
2 aseguradoras y comparar lado a lado sus monto medio, margen, y top 5
sub-procedimientos para la especialidad seleccionada. Mantén el mismo
diseño visual que las otras vistas.
```

```
Agrega una vista "Histórico" como quinta tab que muestre la evolución
mensual del monto medio de los últimos 12 meses para la combinación
aseguradora × especialidad seleccionada. Datos sintéticos con tendencia
ligera. Usa recharts AreaChart.
```

---

## 4. Comandos de deploy

Después de que Claude Code termine, ejecuta:

```bash
# 1. Inicializa git si no está
git init
git add .
git commit -m "feat: initial SAMMP portfolio mix manager prototype"

# 2. Crea repo en GitHub (o usa gh CLI)
gh repo create sammp --private --source=. --push

# 3. Despliega a Vercel
npm install -g vercel    # si no lo tienes
vercel login
vercel                   # primera vez: configura el proyecto
vercel --prod            # deploy a producción

# Cada cambio posterior:
git add .
git commit -m "ajuste X"
git push                 # Vercel auto-despliega del push
```

Vercel te dará una URL tipo `sammp-xxxxxx.vercel.app`. Esa es la que le mandas al director comercial.

---

## 5. Tips para la sesión en vivo con el director comercial

**Antes de empezar:**
- Ten Claude Code abierto en una terminal, el navegador con la app abierta en otro monitor, y este cheatsheet en una tercera ventana.
- Confirma que `npm run dev` está corriendo y hot reload funciona.
- Empieza con GNP + Ortopedia preseleccionados — es el escenario más rico para demostrar.

**Durante la sesión:**
- Anota los cambios que pida en una libreta antes de pedirlos a Claude Code. Acumula 2-3 cambios pequeños y pídelos juntos, no uno a uno — Claude Code es más rápido haciendo batches.
- Si el director pide algo grande ("agrégale autenticación", "conéctalo al HIS"), **no lo hagas en vivo.** Anótalo como follow-up y sigue con cambios chicos. La regla es: si toma más de 60 segundos verlo en pantalla, no es iteración en vivo.
- Si te sientes tentado a refactorizar o limpiar código durante la sesión, no lo hagas. La sesión es para validar la dirección del producto, no para mantenerlo limpio. Refactor va después.
- Si Claude Code se atora o produce algo raro, reinicia el thread sin pena. Vuelve a cargar CLAUDE.md mentalmente y empieza un prompt nuevo.

**Después de la sesión:**
- Captura screen recording de momentos clave para mandar a la dirección general.
- Crea un issue por cada follow-up que se quedó pendiente.
- Si la dirección está convencida, ese es el momento de empezar Fase 2: conexión a `cuenta_paciente_ue` real, ETL, persistencia, autenticación.

---

## 6. Punto de fricción típico y cómo resolverlo

El director comercial probablemente dirá una de tres cosas durante la sesión:

**a) "Esto no se parece a lo que yo veo en mi data real."** Respuesta: confirma — son datos sintéticos. Pídele un sample anonimizado de su data real (incluso 1 mes en Excel) para cargarla en fase 2 antes de la próxima iteración.

**b) "Cambia esto, agrega aquello, mueve aquello otro."** Respuesta esperada — eso es para lo que está la sesión. Usa el cheatsheet.

**c) "Necesito que se conecte con el HIS / sea multiusuario / tenga auth."** Respuesta: anótalo como bloqueador de Fase 2 (no MVP), explica que el prototipo es para validar la lógica del producto antes de meter infra. Sigue.

Si dice algo distinto a estos tres, escúchalo dos veces antes de actuar. Probablemente es el dato más valioso de la sesión.
