"use client";

import { DynamicRenderer } from "../../runtime/renderer/DynamicRenderer";

const sampleComponentSource = `
function LoginForm() {
  return <button onClick={() => alert("Login clicked!")}>Login</button>;
}
`;

export default function TestRuntimePage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Runtime Engine Test</h1>
      <DynamicRenderer
        componentSource={sampleComponentSource}
        fallback={<div>Original static form would go here</div>}
      />
    </div>
  );
}