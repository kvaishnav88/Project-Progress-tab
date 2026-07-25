export interface FrictionSignals {
  component_name: string;
  mouse_velocity: number;
  hesitation_time: number;
  rage_clicks: number;
}

export interface GenerateUIResponse {
  strategy: string;
  component: string;
  is_valid: boolean;
  generation_time: number;
}

export async function fetchGeneratedComponent(
  signals: FrictionSignals,
  backendUrl: string
): Promise<GenerateUIResponse> {
  const response = await fetch(`${backendUrl}/generate-ui`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signals),
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  const data: GenerateUIResponse = await response.json();
  return data;
}