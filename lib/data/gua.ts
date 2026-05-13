import type { AseguradoraId } from './aseguradoras';
import type { EspecialidadId } from './especialidades';

export const GUA_REFERENCIA: Record<EspecialidadId, Record<AseguradoraId, number>> = {
  ortopedia: {
    gnp: 110000, axa: 125000, metlife: 105000, monterrey: 118000,
    mapfre: 85000, bbva: 82000, inbursa: 75000, banorte: 80000,
    allianz: 115000, atlas: 90000, qualitas: 70000, panamerican: 130000,
  },
  cardio: {
    gnp: 195000, axa: 220000, metlife: 188000, monterrey: 205000,
    mapfre: 155000, bbva: 150000, inbursa: 138000, banorte: 148000,
    allianz: 205000, atlas: 165000, qualitas: 130000, panamerican: 225000,
  },
  cirgral: {
    gnp: 88000, axa: 95000, metlife: 82000, monterrey: 90000,
    mapfre: 68000, bbva: 65000, inbursa: 60000, banorte: 62000,
    allianz: 92000, atlas: 72000, qualitas: 58000, panamerican: 98000,
  },
  gineco: {
    gnp: 75000, axa: 85000, metlife: 70000, monterrey: 78000,
    mapfre: 55000, bbva: 52000, inbursa: 48000, banorte: 50000,
    allianz: 80000, atlas: 58000, qualitas: 45000, panamerican: 88000,
  },
};
