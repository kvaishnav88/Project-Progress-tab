import { GenerateResponse, TelemetryRequest } from "@/types/ai";

const BASE_URL = "http://127.0.0.1:8000";

export async function generateUI(
  payload: TelemetryRequest
): Promise<GenerateResponse> {
  const response = await fetch(`${BASE_URL}/generate-ui`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to generate UI");
  }

  return response.json();
}