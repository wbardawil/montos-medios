export type EspecialidadId = 'ortopedia' | 'cardio' | 'cirgral' | 'gineco';

export const ESPECIALIDADES: Record<EspecialidadId, string> = {
  ortopedia: 'Ortopedia y Traumatología',
  cardio: 'Cardiología',
  cirgral: 'Cirugía General',
  gineco: 'Ginecología y Obstetricia',
};

export const ESPECIALIDAD_IDS = Object.keys(ESPECIALIDADES) as EspecialidadId[];
