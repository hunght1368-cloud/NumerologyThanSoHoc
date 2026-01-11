
export interface UserData {
  fullName: string;
  birthDate: string;
  intention?: string;
}

export interface NumerologyIndicator {
  name: string;
  value: number | string;
  description: string;
  category: 'Sức Mạnh' | 'Áp Lực'; // Power vs Force
  color: string;
  colorHex: string;
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
  POWER = 'Sức Mạnh',
  FORCE = 'Áp Lực'
}
