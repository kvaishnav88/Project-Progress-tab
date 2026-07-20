export interface TelemetryRequest {
  component_name: string;
  cognitive_score: number;
  mouse_velocity: number;
  hesitation_time: number;
  rage_clicks: number;
}

export interface GenerateResponse {
  strategy: string;
  component: string;
  is_valid: boolean;
  generation_time: number;
}