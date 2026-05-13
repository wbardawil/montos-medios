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
  urologia: [
    { id: 'prostatectomia_lap', nombre: 'Prostatectomía radical laparoscópica', cie9: '60.5', cie10: 'C61', baseTicket: 285000, baseMargen: 0.17, complejidad: 'alta' },
    { id: 'nefrectomia_lap', nombre: 'Nefrectomía radical laparoscópica', cie9: '55.51', cie10: 'C64', baseTicket: 245000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'rtu_prostata', nombre: 'Resección transuretral de próstata', cie9: '60.29', cie10: 'N40', baseTicket: 95000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'uretero_litotricia', nombre: 'Ureterolitotricia endoscópica', cie9: '56.0', cie10: 'N20.1', baseTicket: 78000, baseMargen: 0.32, complejidad: 'media' },
    { id: 'cistoscopia', nombre: 'Cistoscopia diagnóstica', cie9: '57.32', cie10: 'N32.9', baseTicket: 18000, baseMargen: 0.45, complejidad: 'baja' },
    { id: 'circuncision', nombre: 'Circuncisión adulto', cie9: '64.0', cie10: 'N47.1', baseTicket: 28000, baseMargen: 0.42, complejidad: 'baja' },
  ],
  neuro: [
    { id: 'craneo_tumor', nombre: 'Craneotomía para resección tumoral', cie9: '01.59', cie10: 'C71', baseTicket: 620000, baseMargen: 0.10, complejidad: 'alta' },
    { id: 'clipaje_aneur', nombre: 'Clipaje de aneurisma cerebral', cie9: '39.51', cie10: 'I67.1', baseTicket: 580000, baseMargen: 0.11, complejidad: 'alta' },
    { id: 'microdisc_lumbar', nombre: 'Microdiscectomía lumbar', cie9: '80.51', cie10: 'M51.1', baseTicket: 295000, baseMargen: 0.15, complejidad: 'alta' },
    { id: 'estim_medular', nombre: 'Estimulador medular implantado', cie9: '03.93', cie10: 'G89.4', baseTicket: 425000, baseMargen: 0.13, complejidad: 'media' },
    { id: 'shunt_vp', nombre: 'Derivación ventrículo-peritoneal', cie9: '02.34', cie10: 'G91', baseTicket: 185000, baseMargen: 0.20, complejidad: 'media' },
    { id: 'biopsia_estereo', nombre: 'Biopsia cerebral estereotáctica', cie9: '01.13', cie10: 'C71', baseTicket: 95000, baseMargen: 0.28, complejidad: 'media' },
  ],
  orl: [
    { id: 'mast_radical', nombre: 'Mastoidectomía radical', cie9: '20.42', cie10: 'H70.1', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'timpanoplastia', nombre: 'Timpanoplastia', cie9: '19.4', cie10: 'H72', baseTicket: 85000, baseMargen: 0.30, complejidad: 'media' },
    { id: 'microcir_laring', nombre: 'Microcirugía laríngea', cie9: '30.09', cie10: 'J38', baseTicket: 78000, baseMargen: 0.30, complejidad: 'media' },
    { id: 'septoplastia', nombre: 'Septoplastía', cie9: '21.5', cie10: 'J34.2', baseTicket: 65000, baseMargen: 0.32, complejidad: 'baja' },
    { id: 'adenoamigda', nombre: 'Adenoamigdalectomía', cie9: '28.3', cie10: 'J35.3', baseTicket: 38000, baseMargen: 0.40, complejidad: 'baja' },
    { id: 'tubos_vent', nombre: 'Colocación de tubos de ventilación', cie9: '20.01', cie10: 'H65', baseTicket: 22000, baseMargen: 0.45, complejidad: 'baja' },
  ],
  oftalmo: [
    { id: 'queratoplastia', nombre: 'Queratoplastia penetrante', cie9: '11.64', cie10: 'H18', baseTicket: 165000, baseMargen: 0.18, complejidad: 'media' },
    { id: 'cerclaje_retina', nombre: 'Cerclaje escleral por desprendimiento de retina', cie9: '14.49', cie10: 'H33', baseTicket: 125000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'vitrectomia', nombre: 'Vitrectomía posterior', cie9: '14.74', cie10: 'H43.1', baseTicket: 95000, baseMargen: 0.25, complejidad: 'media' },
    { id: 'trabeculectomia', nombre: 'Trabeculectomía para glaucoma', cie9: '12.64', cie10: 'H40.1', baseTicket: 68000, baseMargen: 0.30, complejidad: 'media' },
    { id: 'facoemul', nombre: 'Facoemulsificación con lente intraocular', cie9: '13.41', cie10: 'H25', baseTicket: 48000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'estrabismo', nombre: 'Cirugía de estrabismo', cie9: '15.3', cie10: 'H50', baseTicket: 52000, baseMargen: 0.34, complejidad: 'baja' },
  ],
  plastica: [
    { id: 'colgajo_microquir', nombre: 'Colgajo libre microquirúrgico', cie9: '86.74', cie10: 'T98', baseTicket: 285000, baseMargen: 0.15, complejidad: 'alta' },
    { id: 'recons_facial', nombre: 'Reconstrucción facial post-trauma', cie9: '86.89', cie10: 'T90.4', baseTicket: 225000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'recons_mama', nombre: 'Reconstrucción mamaria con implante', cie9: '85.53', cie10: 'Z42.1', baseTicket: 185000, baseMargen: 0.20, complejidad: 'media' },
    { id: 'abdominoplastia_func', nombre: 'Abdominoplastia post-bariátrica', cie9: '86.83', cie10: 'L98.7', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'injerto_piel', nombre: 'Injerto de piel libre', cie9: '86.65', cie10: 'T98.3', baseTicket: 65000, baseMargen: 0.30, complejidad: 'baja' },
    { id: 'liberacion_cicatriz', nombre: 'Liberación de contractura cicatricial', cie9: '86.84', cie10: 'L90.5', baseTicket: 48000, baseMargen: 0.36, complejidad: 'baja' },
  ],
  vascular: [
    { id: 'bypass_femp', nombre: 'Bypass femoropoplíteo', cie9: '39.29', cie10: 'I70.2', baseTicket: 295000, baseMargen: 0.16, complejidad: 'alta' },
    { id: 'endart_carotidea', nombre: 'Endarterectomía carotídea', cie9: '38.12', cie10: 'I65.2', baseTicket: 245000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'angio_perif', nombre: 'Angioplastia periférica con stent', cie9: '39.5', cie10: 'I70', baseTicket: 195000, baseMargen: 0.20, complejidad: 'media' },
    { id: 'embolectomia', nombre: 'Embolectomía arterial', cie9: '38.08', cie10: 'I74', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'fav_dialisis', nombre: 'Fístula arteriovenosa para hemodiálisis', cie9: '39.27', cie10: 'N18.6', baseTicket: 85000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'safenectomia', nombre: 'Safenectomía con flebectomías', cie9: '38.59', cie10: 'I83', baseTicket: 65000, baseMargen: 0.32, complejidad: 'baja' },
  ],
  torax: [
    { id: 'lobectomia_pulm', nombre: 'Lobectomía pulmonar', cie9: '32.4', cie10: 'C34', baseTicket: 425000, baseMargen: 0.13, complejidad: 'alta' },
    { id: 'timectomia', nombre: 'Timectomía', cie9: '07.83', cie10: 'G70.0', baseTicket: 285000, baseMargen: 0.16, complejidad: 'alta' },
    { id: 'decort_pleural', nombre: 'Decorticación pleural', cie9: '34.51', cie10: 'J86', baseTicket: 195000, baseMargen: 0.20, complejidad: 'media' },
    { id: 'vats_diag', nombre: 'VATS (videotoracoscopia) diagnóstica', cie9: '34.21', cie10: 'J98.4', baseTicket: 125000, baseMargen: 0.24, complejidad: 'media' },
    { id: 'mediastinoscopia', nombre: 'Mediastinoscopia', cie9: '34.22', cie10: 'R59.1', baseTicket: 95000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'pleurodesis_toracos', nombre: 'Pleurodesis por toracoscopia', cie9: '34.6', cie10: 'J91', baseTicket: 85000, baseMargen: 0.30, complejidad: 'baja' },
  ],
  gastro: [
    { id: 'cpre', nombre: 'CPRE terapéutica', cie9: '51.85', cie10: 'K83.1', baseTicket: 95000, baseMargen: 0.30, complejidad: 'media' },
    { id: 'mucosectomia', nombre: 'Mucosectomía endoscópica', cie9: '45.43', cie10: 'D13', baseTicket: 65000, baseMargen: 0.32, complejidad: 'media' },
    { id: 'gastros_endo', nombre: 'Gastrostomía endoscópica percutánea', cie9: '43.11', cie10: 'R63.3', baseTicket: 38000, baseMargen: 0.40, complejidad: 'baja' },
    { id: 'dilatacion_eso', nombre: 'Dilatación esofágica endoscópica', cie9: '42.92', cie10: 'K22.2', baseTicket: 32000, baseMargen: 0.42, complejidad: 'baja' },
    { id: 'colonosc_polip', nombre: 'Colonoscopia con polipectomía', cie9: '45.42', cie10: 'K63.5', baseTicket: 28000, baseMargen: 0.45, complejidad: 'baja' },
    { id: 'panendoscopia', nombre: 'Panendoscopia con biopsia', cie9: '45.16', cie10: 'K29', baseTicket: 18000, baseMargen: 0.48, complejidad: 'baja' },
  ],
  onco: [
    { id: 'gastrect_total', nombre: 'Gastrectomía total por neoplasia', cie9: '43.99', cie10: 'C16', baseTicket: 385000, baseMargen: 0.13, complejidad: 'alta' },
    { id: 'res_colon_onco', nombre: 'Resección colónica oncológica', cie9: '45.79', cie10: 'C18', baseTicket: 295000, baseMargen: 0.16, complejidad: 'alta' },
    { id: 'mastect_total', nombre: 'Mastectomía radical modificada', cie9: '85.43', cie10: 'C50', baseTicket: 245000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'vac_axilar', nombre: 'Vaciamiento axilar', cie9: '40.51', cie10: 'C50', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'biopsia_centinela', nombre: 'Biopsia de ganglio centinela', cie9: '40.23', cie10: 'C50', baseTicket: 65000, baseMargen: 0.32, complejidad: 'baja' },
    { id: 'port_cath', nombre: 'Implante de port-a-cath', cie9: '86.07', cie10: 'Z51.1', baseTicket: 38000, baseMargen: 0.40, complejidad: 'baja' },
  ],
  pediatria: [
    { id: 'onfalocele', nombre: 'Reparación de onfalocele', cie9: '54.71', cie10: 'Q79.2', baseTicket: 285000, baseMargen: 0.16, complejidad: 'alta' },
    { id: 'piloromiot', nombre: 'Piloromiotomía de Ramstedt', cie9: '43.3', cie10: 'Q40.0', baseTicket: 95000, baseMargen: 0.28, complejidad: 'media' },
    { id: 'intusus_red', nombre: 'Reducción de intususcepción', cie9: '46.80', cie10: 'K56.1', baseTicket: 78000, baseMargen: 0.30, complejidad: 'media' },
    { id: 'apend_ped', nombre: 'Apendicectomía pediátrica laparoscópica', cie9: '47.01', cie10: 'K35', baseTicket: 58000, baseMargen: 0.36, complejidad: 'baja' },
    { id: 'hernio_ing_ped', nombre: 'Herniorrafía inguinal pediátrica', cie9: '53.0', cie10: 'K40', baseTicket: 45000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'criptorq', nombre: 'Orquidopexia por criptorquidia', cie9: '62.5', cie10: 'Q53', baseTicket: 38000, baseMargen: 0.40, complejidad: 'baja' },
  ],
  neumo: [
    { id: 'ebus', nombre: 'EBUS con biopsia transbronquial', cie9: '33.24', cie10: 'C34', baseTicket: 78000, baseMargen: 0.32, complejidad: 'media' },
    { id: 'biopsia_pulm_perc', nombre: 'Biopsia pulmonar percutánea', cie9: '33.27', cie10: 'J84', baseTicket: 45000, baseMargen: 0.36, complejidad: 'baja' },
    { id: 'toracostomia', nombre: 'Toracostomía cerrada', cie9: '34.04', cie10: 'J93', baseTicket: 35000, baseMargen: 0.40, complejidad: 'baja' },
    { id: 'broncoscopia_biop', nombre: 'Broncoscopia diagnóstica con biopsia', cie9: '33.24', cie10: 'J98', baseTicket: 28000, baseMargen: 0.42, complejidad: 'baja' },
    { id: 'pleurocent', nombre: 'Pleurocentesis', cie9: '34.91', cie10: 'J91', baseTicket: 15000, baseMargen: 0.48, complejidad: 'baja' },
    { id: 'titul_bipap', nombre: 'Titulación de BiPAP/CPAP nocturna', cie9: '89.17', cie10: 'G47.3', baseTicket: 12000, baseMargen: 0.50, complejidad: 'baja' },
  ],
  maxilo: [
    { id: 'ortognatica', nombre: 'Cirugía ortognática bimaxilar', cie9: '76.69', cie10: 'K07.0', baseTicket: 245000, baseMargen: 0.18, complejidad: 'alta' },
    { id: 'atm', nombre: 'Cirugía de articulación temporomandibular', cie9: '76.5', cie10: 'K07.6', baseTicket: 145000, baseMargen: 0.22, complejidad: 'media' },
    { id: 'frac_facial', nombre: 'Reducción abierta de fractura facial', cie9: '76.79', cie10: 'S02', baseTicket: 125000, baseMargen: 0.24, complejidad: 'media' },
    { id: 'implantes_dent', nombre: 'Colocación de implantes dentales', cie9: '23.5', cie10: 'K08', baseTicket: 65000, baseMargen: 0.40, complejidad: 'baja' },
    { id: 'quiste_max', nombre: 'Enucleación de quiste maxilar', cie9: '24.4', cie10: 'K09', baseTicket: 48000, baseMargen: 0.38, complejidad: 'baja' },
    { id: 'terceros_molares', nombre: 'Extracción de terceros molares incluidos', cie9: '23.19', cie10: 'K01.1', baseTicket: 32000, baseMargen: 0.45, complejidad: 'baja' },
  ],
};
