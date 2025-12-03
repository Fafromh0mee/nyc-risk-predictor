export interface RiskProbabilities {
  low: number;
  medium: number;
  high: number;
}

export interface RiskPoint {
  lat: number;
  lng: number;
  level: 'low' | 'medium' | 'high';
  score: number;
  count?: number;
  probabilities?: RiskProbabilities;
  isPrediction?: boolean; // Flag to highlight prediction points
  contribFactorName?: string;
}

export interface SearchParams {
  query: string;
  hour?: number;
  dayOfWeek?: number; // 0=Monday, 6=Sunday
  contribFactor?: number;
}

export interface ContribFactor {
  id: number;
  name: string;
}
