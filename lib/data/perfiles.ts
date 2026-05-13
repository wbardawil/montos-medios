import type { AseguradoraId } from './aseguradoras';
import type { Complejidad } from './procedimientos';

export type PerfilAseguradora = Record<Complejidad, number>;

export const PERFIL_ASEGURADORA: Record<AseguradoraId, PerfilAseguradora> = {
  gnp: { alta: 1.0, media: 1.0, baja: 1.0 },
  axa: { alta: 1.2, media: 1.0, baja: 0.8 },
  metlife: { alta: 0.9, media: 1.0, baja: 1.1 },
  monterrey: { alta: 1.1, media: 1.0, baja: 0.9 },
  mapfre: { alta: 0.7, media: 0.9, baja: 1.3 },
  bbva: { alta: 0.8, media: 1.0, baja: 1.2 },
  inbursa: { alta: 0.6, media: 0.8, baja: 1.4 },
  banorte: { alta: 0.7, media: 0.9, baja: 1.3 },
  allianz: { alta: 1.1, media: 1.0, baja: 0.9 },
  atlas: { alta: 0.8, media: 1.1, baja: 1.1 },
  qualitas: { alta: 0.5, media: 0.8, baja: 1.5 },
  panamerican: { alta: 1.2, media: 1.0, baja: 0.8 },
};
