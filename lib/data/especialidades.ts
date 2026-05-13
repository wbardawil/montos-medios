export type EspecialidadId =
  | 'ortopedia'
  | 'cardio'
  | 'cirgral'
  | 'gineco'
  | 'urologia'
  | 'neuro'
  | 'orl'
  | 'oftalmo'
  | 'plastica'
  | 'vascular'
  | 'torax'
  | 'gastro'
  | 'onco'
  | 'pediatria'
  | 'neumo'
  | 'maxilo';

export const ESPECIALIDADES: Record<EspecialidadId, string> = {
  ortopedia: 'Ortopedia y Traumatología',
  cardio: 'Cardiología',
  cirgral: 'Cirugía General',
  gineco: 'Ginecología y Obstetricia',
  urologia: 'Urología',
  neuro: 'Neurocirugía',
  orl: 'Otorrinolaringología',
  oftalmo: 'Oftalmología',
  plastica: 'Cirugía plástica reconstructiva',
  vascular: 'Cirugía vascular',
  torax: 'Cirugía de tórax',
  gastro: 'Gastroenterología (endoscópica)',
  onco: 'Oncología quirúrgica',
  pediatria: 'Cirugía pediátrica',
  neumo: 'Neumología',
  maxilo: 'Cirugía maxilofacial',
};

export const ESPECIALIDAD_IDS = Object.keys(ESPECIALIDADES) as EspecialidadId[];
