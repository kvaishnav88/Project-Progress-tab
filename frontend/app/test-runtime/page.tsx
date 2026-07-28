"use client";

import { useEffect, useState } from "react";
import { DynamicRenderer } from "../../runtime/renderer/DynamicRenderer";
import { fetchGeneratedComponent } from "../../runtime/api/generateUI";

export default function TestRuntimePage() {
  const [componentSource, setComponentSource] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchGeneratedComponent(
      {
        component_name: "PaymentForm",
        cognitive_score: 0.85,
        mouse_velocity: 20,
        hesitation_time: 6.5,
        rage_clicks: 5,
      },
      "http://127.0.0.1:8000"
    )
      .then((data) => setComponentSource(data.component))
      .catch((err) => setFetchError(err.message));
  }, []);

  if (fetchError) {
    return <div style={{ padding: "2rem" }}>Failed to reach backend: {fetchError}</div>;
  }

  if (!componentSource) {
    return <div style={{ padding: "2rem" }}>Loading component from backend...</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Runtime Engine Test (Live Backend)</h1>
      <DynamicRenderer
        componentSource={componentSource}
        fallback={<div>Original static form would go here</div>}
      />
    </div>
  );
}

fetchGeneratedComponent(
      {
        component_name: "PaymentForm",
        cognitive_score: 0.85,
        mouse_velocity: 20,
        hesitation_time: 6.5,
        rage_clicks: 5,
      },
      "http://127.0.0.1:8000"
    )