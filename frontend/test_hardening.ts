import { parseGeneratedComponent, extractComponentName } from "./runtime/babel/parser";
import { validateComponentSafety } from "./runtime/babel/validator";
import { compileGeneratedComponent } from "./runtime/renderer/compile";
import * as React from "react";
import * as LucideIcons from "lucide-react";

const cases: { label: string; code: string }[] = [
  {
    label: "Icon import from lucide-react",
    code: `
import React from "react";
import { Lock } from "lucide-react";
export default function SecureField() {
  return (
    <div>
      <Lock size={16} />
      <input type="password" />
    </div>
  );
}
`,
  },
  {
    label: "Fragment shorthand + conditional rendering",
    code: `
import React, { useState } from "react";
export default function Step() {
  const [ok, setOk] = useState(false);
  return (
    <>
      {ok ? <p>Looks good</p> : <p>Please check the field</p>}
      {ok && <button>Continue</button>}
    </>
  );
}
`,
  },
  {
    label: "Array.map with keys",
    code: `
import React from "react";
export default function OptionsList() {
  const items = ["A", "B", "C"];
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
`,
  },
  {
    label: "Helper sub-component defined before main export",
    code: `
import React from "react";
function InputField({ label }) {
  return (
    <label>
      {label}
      <input />
    </label>
  );
}
export default function PaymentForm() {
  return (
    <div>
      <InputField label="Card number" />
    </div>
  );
}
`,
  },
];

async function run() {
  for (const { label, code } of cases) {
    console.log(`\n=== ${label} ===`);

    const parsed = parseGeneratedComponent(code);
    if (!parsed.valid) {
      console.log("PARSE FAILED:", parsed.error);
      continue;
    }

    const componentName = extractComponentName(parsed.ast);
    console.log("Detected component name:", componentName);

    const safety = validateComponentSafety(parsed.ast);
    if (!safety.valid) {
      console.log("VALIDATION FAILED:", safety.errors);
      continue;
    }

    const compiled = compileGeneratedComponent(code);
    if (!compiled.success) {
      console.log("COMPILE FAILED:", compiled.error);
      continue;
    }

    try {
      const cleanedCode = compiled.compiledCode
        .replace(/^import\s+.*$/gm, "")
        .replace(/export\s+default\s+/, "")
        .replace(/^export\s+/gm, "");

      const moduleFactory = new Function(
        "React",
        `
        const { useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer } = React;
        const _jsx = React.createElement;
        const _jsxs = React.createElement;
        const _Fragment = React.Fragment;
        const exports = {};
        ${cleanedCode}
        return ${componentName};
        `
      );
      const Comp = moduleFactory(React);
      const el = React.createElement(Comp);
      console.log("EXECUTION: OK (component constructed without throwing)");
    } catch (err) {
      console.log("EXECUTION FAILED:", err instanceof Error ? err.message : err);
    }
  }
}

run();