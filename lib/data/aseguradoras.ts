export interface Aseguradora {
  nombre: string;
}

export type AseguradoraId = string;

export const ASEGURADORAS: Record<string, Aseguradora> = {
  gnp: { nombre: 'GNP Seguros' },
  axa: { nombre: 'AXA Seguros' },
  metlife: { nombre: 'MetLife México' },
  monterrey: { nombre: 'Seguros Monterrey NYL' },
  mapfre: { nombre: 'MAPFRE Tepeyac' },
  bbva: { nombre: 'BBVA Seguros' },
  inbursa: { nombre: 'Inbursa Seguros' },
  banorte: { nombre: 'Banorte Seguros' },
  allianz: { nombre: 'Allianz México' },
  atlas: { nombre: 'Seguros Atlas' },
  qualitas: { nombre: 'Quálitas Salud' },
  panamerican: { nombre: 'Pan-American Life' },
};

export const ASEGURADORA_IDS = Object.keys(ASEGURADORAS);
export const BASE_ASEGURADORA_IDS_SET: ReadonlySet<string> = new Set(ASEGURADORA_IDS);

export function isBaseAseguradora(id: string): boolean {
  return BASE_ASEGURADORA_IDS_SET.has(id);
}

export function slugifyAseguradora(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}
