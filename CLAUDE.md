# SAMMP — Portfolio Mix Manager

## Producto

Herramienta interna para el director comercial de un hospital privado mexicano. Administra la mezcla de portafolio de sub-procedimientos por aseguradora × especialidad. Objetivo principal: poder bajar el monto medio agregado por especialidad sin destruir margen, identificando qué sub-procedimientos de alto margen y bajo ticket conviene impulsar en volumen.

Esto NO es un sistema de cobranza, glosa, o contratos. Es exclusivamente análisis de mezcla y simulación.

## Usuario primario

Director comercial del hospital. No es técnico. La UI debe ser de un vistazo, sin requerir entrenamiento.

## Stack

- Next.js 14 con App Router
- TypeScript estricto (no `any`)
- Tailwind CSS v3
- Componentes minimalistas estilo shadcn (vendored en `/components/ui/`, sin Radix — para evitar peso extra dado que el mockup usa controles HTML nativos)
- Recharts para gráficos del dashboard
- Deploy en Vercel
- Sin base de datos. Datos como constantes TypeScript en `/lib/data/`.

## Estructura

```
montos-medios/
├── CLAUDE.md, README.md
├── package.json, tsconfig.json, next.config.mjs, tailwind.config.ts, postcss.config.mjs
├── sammp_mockup.html         ← referencia visual original
├── app/{layout.tsx, page.tsx, globals.css}
├── components/
│   ├── header.tsx, filter-bar.tsx, kpi-cards.tsx, tabs.tsx
│   ├── vista-mezcla.tsx, vista-candidatos.tsx, vista-simulador.tsx,
│   ├── vista-dashboard.tsx, vista-config.tsx
│   └── ui/{button,card,badge}.tsx
├── lib/
│   ├── data/{aseguradoras,especialidades,procedimientos,gua,perfiles}.ts
│   ├── format.ts, calc.ts, optimizer.ts, state.tsx, utils.ts
```

## Reglas de oro

1. **Iteración instantánea.** Cualquier cambio (agregar aseguradora, cambiar ticket, ajustar margen, modificar copy) es una sola edición en un solo archivo con hot reload <1s. En sesión en vivo puede usarse la pestaña **Configuración** (overrides persistidos en localStorage).
2. **Datos separados de lógica separados de UI.** `/lib/data/` solo datos. `/lib/calc.ts` y `/lib/optimizer.ts` solo cálculo puro testeable. `/components/` solo UI.
3. **Mexican peso formatting siempre.** `Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })`.
4. **Sentence case en español.**
5. **Sin loading states ni spinners.** Todo es síncrono sobre constantes locales.
6. **Tabular numbers en cifras.** clase `tabular-nums`.
7. **No agregues features no pedidas.** Si crees que falta algo, propón en chat antes de construir.

## Modelo de datos

Ver `/lib/data/`. Tipos clave:

- `AseguradoraId` — 12 aseguradoras mexicanas
- `EspecialidadId` — 4 especialidades (ortopedia, cardio, cirgral, gineco)
- `SubProcedimiento` — incluye `cie9` (CIE-9-MC, procedimiento) y `cie10` (CIE-10, diagnóstico típico)
- `Complejidad` — alta / media / baja

### Catálogos CIE-9-MC y CIE-10

Cada sub-procedimiento tiene asignado un código **CIE-9-MC** (procedimiento quirúrgico, lo que se hace) y un código **CIE-10** (diagnóstico típico asociado, por qué se opera). Ejemplos:

| Procedimiento | CIE-9-MC | CIE-10 |
|---|---|---|
| Artroplastia total de cadera | 81.51 | M16.1 (Coxartrosis primaria) |
| Cirugía de revascularización coronaria | 36.15 | I25.1 (Cardiopatía isquémica aterosclerótica) |
| Colecistectomía laparoscópica | 51.23 | K80.2 (Cálculo de la vesícula biliar) |
| Cesárea con complicaciones | 74.1 | O82 (Parto único por cesárea) |

Estos códigos son **representativos pero ilustrativos** — para Fase 2 con datos reales del HIS, deben validarse contra el catálogo institucional. CIE-9-MC para procedimientos sigue vigente en mucha facturación mexicana (Seguros, GMM) aunque OMS publica CIE-11; algunas aseguradoras también piden CPT-4 paralelo.

## Comportamiento de cada vista

### Mezcla actual
Tabla con todos los sub-procedimientos de la especialidad seleccionada para la aseguradora seleccionada. Columnas: nombre, **CIE-9/CIE-10**, complejidad (badge color), casos, ticket promedio, % volumen, % monto (rojo si >15%), margen %, margen contributivo. Tfoot con totales y monto medio ponderado.

### Candidatos a push
Cards con sub-procedimientos donde margen ≥ p60 y ticket ≤ p40. Cada card muestra: códigos CIE, ticket actual, margen, impacto proyectado si se duplica el volumen. Botón "Agregar al simulador" que pre-popula la simulación y cambia a la siguiente tab.

### Simulador de mezcla
- **Optimizador automático**: objetivo (reducir monto medio / maximizar margen / balanceado), cap de incremento por procedimiento (50%, 100%, 150%, 200%), cap de reducción (0%, 20%, 30%, 50%), opción para preservar complejidad alta. Botón **Optimizar** llena los sliders con la propuesta heurística greedy.
- Comparación lado a lado: situación actual vs simulada.
- Slider + botones +/− por cada sub-procedimiento.
- Texto interpretativo automático al pie cuando hay simulación activa.

### Dashboard hospital
- KPIs hospital: monto medio ponderado, casos totales, monto total, margen contributivo (across todas las aseguradoras × especialidades del periodo).
- Barras: monto medio por especialidad para la aseguradora seleccionada, comparado contra GUA. Click en barra → selecciona esa especialidad.
- Barras: monto medio por aseguradora (promedio across especialidades). Línea de referencia con el promedio hospital. La aseguradora seleccionada se resalta en verde. Click en barra → selecciona esa aseguradora.

### Configuración (on-the-fly)
- **Tickets/márgenes por procedimiento**: override del valor base (afecta a todas las aseguradoras). Filtra por especialidad.
- **GUA por aseguradora × especialidad**: override del monto medio que reconoce la aseguradora.
- **Exportar / importar JSON**: para compartir el escenario o respaldarlo.
- **Persistencia**: localStorage del navegador (sobrevive refresh, no cross-device). Botón "Resetear todo" limpia los overrides.

## Estados (Context global)

Ver `/lib/state.tsx`. Forma:
```ts
{
  aseguradora, especialidad, periodo, tab,
  simulacion: Record<procId, deltaCases>,
  overrides: {
    procedimientos: Record<procId, { ticket?: number; margen?: number }>,
    gua: Record<`${aseguradora}:${especialidad}`, number>,
  }
}
```
Cambiar aseguradora, especialidad o cualquier override resetea la simulación (los KPIs cambiarían y la simulación previa dejaría de tener sentido). Los overrides persisten en `localStorage` con key `sammp-overrides-v1`.

## Optimizador

Heurística greedy en `/lib/optimizer.ts`. En cada iteración escoge el movimiento (+1 ó −1 caso en un procedimiento) con mejor puntaje según el objetivo, respetando límites de movimiento por procedimiento. Itera hasta 200 veces o hasta que no encuentre movimientos positivos.

**Objetivos**:
- `reducir_monto_medio`: prioriza subir volumen de procedimientos por debajo del monto medio actual; bajar de los que están por arriba.
- `maximizar_margen`: prioriza margen unitario absoluto.
- `balanceado`: combinación 50/50.

**Límites**:
- Incremento máximo por procedimiento (50%, 100%, 150%, 200% del volumen actual).
- Reducción máxima por procedimiento (0%, 20%, 30%, 50%).
- Preservar complejidad alta (no toca esos procedimientos).

Para Fase 2 con catálogos más grandes, migrar a solver LP real (e.g. JavaScript port de GLPK o servicio en backend).

## Lo que NO existe en esta versión

- Auth / login
- Persistencia server-side (todo session-only en localStorage del navegador)
- Integración con HIS, Postgres, o `cuenta_paciente_ue`
- Multi-usuario
- Exportar a PDF (sí hay export JSON de overrides)
- Catálogo CIE oficial validado contra el HIS (códigos son ilustrativos)
- Módulo de cobranza, glosa, o contratos (eso es "Sistema B", proyecto distinto)
- Solver de optimización lineal real

Si pides agregar algo de esta lista, primero confirmo en chat antes de construir.
