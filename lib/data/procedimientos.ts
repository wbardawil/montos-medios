import type { EspecialidadId } from './especialidades';

export type Complejidad = 'alta' | 'media' | 'baja';

export interface SubProcedimiento {
  id: string;
  nombre: string;
  cie9: string;
  cie10: string;
  baseTicket: number;
  baseMargen: number;
  complejidad: Complejidad;
}

export const SUBPROCEDIMIENTOS: Record<EspecialidadId, SubProcedimiento[]> = {
  ortopedia: [
    { id: 'columna_lumbar', nombre: 'Cirugía de columna lumbar (fusión)', cie9: '81.08', cie10: 'M51.9', baseTicket: 385000, baseMargen: 0.12, complejidad: 'alta' },
    { id: 'columna_cervical', nombre: 'Discectomía cervical', cie9: '80.51', cie10: 'M50.9', baseTicket: 320000, baseMargen: 0.13, complejidad: 'alta' },
    { id: 'artroplastia_cadera', nombre: 'Artroplastia total de cadera', cie9: '81.51', cie10: 'M16.1', baseTicket: 295000, baseMargen: 0.15, complejidad: 'alta' },
    { id: 'artroplastia_rodilla', nombre: 'Artroplastia total de rodilla', cie9: '81.54', cie10: 'M17.1', baseTicket: 265000, baseMargen: 0.14, complejidad: 'alta' },
    { id: 'osteo_femur', nombre: 'Osteosíntesis de fémur', cie9: '79.35', cie10: 'S72.9', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'osteo_tibia', nombre: 'Osteosíntesis de tibia', cie9: '79.36', cie10: 'S82.2', baseTicket: 95000, baseMargen: 0.26, complejidad: 'media' },
    { id: 'rep_lca', nombre: 'Reparación ligamento cruzado anterior', cie9: '81.45', cie10: 'S83.5', baseTicket: 98000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'artros_rodilla', nombre: 'Artroscopia diagnóstica de rodilla', cie9: '80.26', cie10: 'M23.9', baseTicket: 62000, baseMargen: 0.35, complejidad: 'baja' },
    { id: 'artros_hombro', nombre: 'Artroscopia de hombro', cie9: '80.21', cie10: 'M75.9', baseTicket: 75000, baseMargen: 0.32, complejidad: 'baja' },
    { id: 'menisco', nombre: 'Meniscectomía artroscópica', cie9: '80.6', cie10: 'M23.2', baseTicket: 48000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'tunel_carp', nombre: 'Liberación de túnel carpiano', cie9: '04.43', cie10: 'G56.0', baseTicket: 32000, baseMargen: 0.42, complejidad: 'baja' },
    { id: 'hallux', nombre: 'Corrección de hallux valgus', cie9: '77.51', cie10: 'M20.1', baseTicket: 38000, baseMargen: 0.38, complejidad: 'baja' },
  ],
  cardio: [
    { id: 'bypass', nombre: 'Cirugía de revascularización coronaria', cie9: '36.15', cie10: 'I25.1', baseTicket: 520000, baseMargen: 0.14, complejidad: 'alta' },
    { id: 'reemplazo_valv', nombre: 'Reemplazo valvular aórtico', cie9: '35.22', cie10: 'I35.0', baseTicket: 580000, baseMargen: 0.13, complejidad: 'alta' },
    { id: 'angio_stent', nombre: 'Angioplastia con stent farmacoactivo', cie9: '36.07', cie10: 'I25.1', baseTicket: 235000, baseMargen: 0.20, complejidad: 'media' },
    { id: 'marcapasos', nombre: 'Implante de marcapasos definitivo', cie9: '37.83', cie10: 'I44.2', baseTicket: 180000, baseMargen: 0.25, complejidad: 'media' },
    { id: 'ablacion', nombre: 'Ablación cardíaca por radiofrecuencia', cie9: '37.34', cie10: 'I47.1', baseTicket: 195000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'catet_diag', nombre: 'Cateterismo diagnóstico', cie9: '37.23', cie10: 'I25.9', baseTicket: 75000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'cardiov', nombre: 'Cardioversión eléctrica', cie9: '99.61', cie10: 'I48.0', baseTicket: 28000, baseMargen: 0.45, complejidad: 'baja' },
    { id: 'eco_estres', nombre: 'Ecocardiograma con estrés farmacológico', cie9: '88.72', cie10: 'I25.9', baseTicket: 12000, baseMargen: 0.48, complejidad: 'baja' },
  ],
  cirgral: [
    { id: 'bypass_gast', nombre: 'Bypass gástrico laparoscópico', cie9: '44.38', cie10: 'E66.0', baseTicket: 285000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'manga_gast', nombre: 'Manga gástrica laparoscópica', cie9: '43.82', cie10: 'E66.0', baseTicket: 195000, baseMargen: 0.22, complejidad: 'alta' },
    { id: 'tiroidectomia', nombre: 'Tiroidectomía total', cie9: '06.4', cie10: 'E04.9', baseTicket: 125000, baseMargen: 0.25, complejidad: 'media' },
    { id: 'colecist', nombre: 'Colecistectomía laparoscópica', cie9: '51.23', cie10: 'K80.2', baseTicket: 68000, baseMargen: 0.35, complejidad: 'baja' },
    { id: 'apendi', nombre: 'Apendicectomía laparoscópica', cie9: '47.01', cie10: 'K35.8', baseTicket: 55000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'hernia_ing', nombre: 'Herniorrafía inguinal con malla', cie9: '17.11', cie10: 'K40.9', baseTicket: 42000, baseMargen: 0.42, complejidad: 'baja' },
    { id: 'hernia_umb', nombre: 'Reparación de hernia umbilical', cie9: '53.49', cie10: 'K42.9', baseTicket: 35000, baseMargen: 0.40, complejidad: 'baja' },
  ],
  gineco: [
    { id: 'cesarea', nombre: 'Cesárea con complicaciones', cie9: '74.1', cie10: 'O82', baseTicket: 85000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'parto', nombre: 'Parto eutócico sin complicación', cie9: '73.59', cie10: 'O80', baseTicket: 48000, baseMargen: 0.30, complejidad: 'baja' },
    { id: 'histerectomia', nombre: 'Histerectomía total abdominal', cie9: '68.49', cie10: 'D25.9', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'mioma', nombre: 'Miomectomía', cie9: '68.29', cie10: 'D25.9', baseTicket: 95000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'lapar_diag', nombre: 'Laparoscopia diagnóstica ginecológica', cie9: '54.21', cie10: 'N94.8', baseTicket: 52000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'salp', nombre: 'Salpingoclasia bilateral', cie9: '66.39', cie10: 'Z30.2', baseTicket: 38000, baseMargen: 0.42, complejidad: 'baja' },
  ],
};
