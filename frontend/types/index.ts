export interface RiskPoint {
  lat: number;
  lng: number;
  level: 'low' | 'medium' | 'high';
  score: number;
  count?: number;
}

export interface SearchParams {
  query: string;
  hour?: number;
  day?: number;
  month?: number;
}
