'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  ASEGURADORAS,
  isBaseAseguradora,
  type Aseguradora,
  type AseguradoraId,
} from './data/aseguradoras';
import type { EspecialidadId } from './data/especialidades';
import type { PerfilAseguradora } from './data/perfiles';
import type { Periodo, Simulacion } from './calc';
import type { MetaComercial } from './metas';

export type TabId = 'mezcla' | 'simulador' | 'dashboard' | 'metas' | 'config';
export type EspecialidadFiltro = EspecialidadId | 'todas';

export const isTodasEspecialidades = (e: EspecialidadFiltro): e is 'todas' => e === 'todas';

export interface ProcOverride {
  ticket?: number;
  margen?: number;
}

export interface AseguradoraCustom {
  nombre: string;
  perfil: PerfilAseguradora;
}

export interface Overrides {
  procedimientos: Record<string, ProcOverride>;
  gua: Record<string, number>;
  aseguradorasCustom: Record<string, AseguradoraCustom>;
}

export interface AppState {
  aseguradora: AseguradoraId;
  especialidad: EspecialidadFiltro;
  periodo: Periodo;
  tab: TabId;
  simulacion: Simulacion;
  overrides: Overrides;
  metas: Record<string, MetaComercial>;
}

export const guaKey = (a: AseguradoraId, e: EspecialidadId) => `${a}:${e}`;

export type Action =
  | { type: 'SET_ASEGURADORA'; value: AseguradoraId }
  | { type: 'SET_ESPECIALIDAD'; value: EspecialidadFiltro }
  | { type: 'SET_PERIODO'; value: Periodo }
  | { type: 'SET_TAB'; value: TabId }
  | { type: 'UPDATE_SIM'; procId: string; delta: number }
  | { type: 'ADD_TO_SIM'; procId: string; delta: number }
  | { type: 'SET_SIM'; sim: Simulacion }
  | { type: 'RESET_SIM' }
  | { type: 'SET_PROC_OVERRIDE'; procId: string; field: 'ticket' | 'margen'; value: number | undefined }
  | { type: 'SET_GUA_OVERRIDE'; aseguradora: AseguradoraId; especialidad: EspecialidadId; value: number | undefined }
  | { type: 'IMPORT_OVERRIDES'; overrides: Overrides }
  | { type: 'RESET_OVERRIDES' }
  | { type: 'ADD_META'; meta: MetaComercial }
  | { type: 'UPDATE_META'; id: string; updates: Partial<MetaComercial> }
  | { type: 'REMOVE_META'; id: string }
  | { type: 'LOAD_META_INTO_SIM'; id: string };

const EMPTY_OVERRIDES: Overrides = { procedimientos: {}, gua: {}, aseguradorasCustom: {} };

const initialState: AppState = {
  aseguradora: 'gnp',
  especialidad: 'ortopedia',
  periodo: '12m',
  tab: 'mezcla',
  simulacion: {},
  overrides: EMPTY_OVERRIDES,
  metas: {},
};

const STORAGE_KEY = 'sammp-overrides-v1';
const STORAGE_KEY_METAS = 'sammp-metas-v1';

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ASEGURADORA':
      return { ...state, aseguradora: action.value, simulacion: {} };
    case 'SET_ESPECIALIDAD':
      return { ...state, especialidad: action.value, simulacion: {} };
    case 'SET_PERIODO':
      return { ...state, periodo: action.value };
    case 'SET_TAB':
      return { ...state, tab: action.value };
    case 'UPDATE_SIM': {
      const sim = { ...state.simulacion };
      if (action.delta === 0) delete sim[action.procId];
      else sim[action.procId] = action.delta;
      return { ...state, simulacion: sim };
    }
    case 'ADD_TO_SIM': {
      const sim = { ...state.simulacion };
      const next = (sim[action.procId] ?? 0) + action.delta;
      if (next === 0) delete sim[action.procId];
      else sim[action.procId] = next;
      return { ...state, simulacion: sim, tab: 'simulador' };
    }
    case 'SET_SIM':
      return { ...state, simulacion: action.sim };
    case 'RESET_SIM':
      return { ...state, simulacion: {} };
    case 'SET_PROC_OVERRIDE': {
      const procs = { ...state.overrides.procedimientos };
      const current = { ...(procs[action.procId] ?? {}) };
      if (action.value === undefined) delete current[action.field];
      else current[action.field] = action.value;
      if (current.ticket === undefined && current.margen === undefined) delete procs[action.procId];
      else procs[action.procId] = current;
      return { ...state, overrides: { ...state.overrides, procedimientos: procs }, simulacion: {} };
    }
    case 'SET_GUA_OVERRIDE': {
      const gua = { ...state.overrides.gua };
      const k = guaKey(action.aseguradora, action.especialidad);
      if (action.value === undefined) delete gua[k];
      else gua[k] = action.value;
      return { ...state, overrides: { ...state.overrides, gua } };
    }
    case 'IMPORT_OVERRIDES': {
      const ov: Overrides = {
        procedimientos: action.overrides.procedimientos ?? {},
        gua: action.overrides.gua ?? {},
        aseguradorasCustom: action.overrides.aseguradorasCustom ?? {},
      };
      const aseguradoraSigueValida =
        isBaseAseguradora(state.aseguradora) || state.aseguradora in ov.aseguradorasCustom;
      return {
        ...state,
        overrides: ov,
        simulacion: {},
        aseguradora: aseguradoraSigueValida ? state.aseguradora : 'gnp',
      };
    }
    case 'RESET_OVERRIDES': {
      const aseguradoraSigueValida = isBaseAseguradora(state.aseguradora);
      return {
        ...state,
        overrides: EMPTY_OVERRIDES,
        simulacion: {},
        aseguradora: aseguradoraSigueValida ? state.aseguradora : 'gnp',
      };
    }
    case 'ADD_META':
      return { ...state, metas: { ...state.metas, [action.meta.id]: action.meta } };
    case 'UPDATE_META': {
      const current = state.metas[action.id];
      if (!current) return state;
      return {
        ...state,
        metas: { ...state.metas, [action.id]: { ...current, ...action.updates } },
      };
    }
    case 'REMOVE_META': {
      const next = { ...state.metas };
      delete next[action.id];
      return { ...state, metas: next };
    }
    case 'LOAD_META_INTO_SIM': {
      const meta = state.metas[action.id];
      if (!meta) return state;
      return {
        ...state,
        aseguradora: meta.aseguradoraId,
        especialidad: meta.especialidad,
        periodo: meta.periodo,
        simulacion: { ...meta.simulacionSnapshot },
        tab: 'simulador',
      };
    }
  }
}

function loadOverrides(): Overrides {
  if (typeof window === 'undefined') return EMPTY_OVERRIDES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_OVERRIDES;
    const parsed = JSON.parse(raw) as Partial<Overrides>;
    return {
      procedimientos: parsed.procedimientos ?? {},
      gua: parsed.gua ?? {},
      aseguradorasCustom: parsed.aseguradorasCustom ?? {},
    };
  } catch {
    return EMPTY_OVERRIDES;
  }
}

function loadMetas(): Record<string, MetaComercial> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_METAS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, MetaComercial>;
  } catch {
    return {};
  }
}

interface StateContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StateContext = createContext<StateContextValue | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const hydrated = loadOverrides();
    if (
      Object.keys(hydrated.procedimientos).length > 0 ||
      Object.keys(hydrated.gua).length > 0 ||
      Object.keys(hydrated.aseguradorasCustom).length > 0
    ) {
      dispatch({ type: 'IMPORT_OVERRIDES', overrides: hydrated });
    }
    const metasHidratadas = loadMetas();
    for (const meta of Object.values(metasHidratadas)) {
      dispatch({ type: 'ADD_META', meta });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.overrides));
    } catch {
      /* quota or private mode — ignore */
    }
  }, [state.overrides]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_METAS, JSON.stringify(state.metas));
    } catch {
      /* ignore */
    }
  }, [state.metas]);

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de StateProvider');
  return ctx;
}

export function useAseguradoras(): Record<string, Aseguradora> {
  const { state } = useAppState();
  return useMemo(
    () => ({ ...ASEGURADORAS, ...state.overrides.aseguradorasCustom }),
    [state.overrides.aseguradorasCustom],
  );
}

export function useAseguradoraIds(): string[] {
  const aseguradoras = useAseguradoras();
  return useMemo(() => Object.keys(aseguradoras), [aseguradoras]);
}
