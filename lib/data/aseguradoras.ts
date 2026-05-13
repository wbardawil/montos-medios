export type AseguradoraId =
  | 'gnp'
  | 'axa'
  | 'metlife'
  | 'monterrey'
  | 'mapfre'
  | 'bbva'
  | 'inbursa'
  | 'banorte'
  | 'allianz'
  | 'atlas'
  | 'qualitas'
  | 'panamerican';

export interface Aseguradora {
  nombre: string;
}

export const ASEGURADORAS: Record<AseguradoraId, Aseguradora> = {
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

export const ASEGURADORA_IDS = Object.keys(ASEGURADORAS) as AseguradoraId[];
