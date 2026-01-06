
export interface UserData {
  fullName: string;
  birthDate: string;
  intention?: string;
}

export interface NumerologyIndicator {
  name: string;
  value: number | string;
  description: string;
  category: 'Power' | 'Force';
  color: string;
  colorHex: string; // Thêm mã hex cho từng chỉ số
}

export interface AnalysisResult {
  introduction: string;
  mainColorDescription: string;
  mainColorHex: string;
  indicators: NumerologyIndicator[];
  fullReading: string;
  blessing: string;
}

export enum EnergyLevel {
  POWER = 'Power',
  FORCE = 'Force'
}
