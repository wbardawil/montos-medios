export interface HospitalConfig {
  nombre: string;
  camas: number;
  cirugiasPromedioMes: number;
}

export const HOSPITAL: HospitalConfig = {
  nombre: 'Hospital privado',
  camas: 60,
  cirugiasPromedioMes: 600,
};
