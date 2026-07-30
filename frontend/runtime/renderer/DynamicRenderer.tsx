import React, { useEffect, useState } from "react";
import { validateComponentSafety } from "../babel/validator";
import { compileGeneratedComponent } from "./compile";
import { parseGeneratedComponent, extractComponentName } from "../babel/parser";

interface DynamicRendererProps {
  componentSource: string;
  fallback: React.ReactNode;
}

export function DynamicRenderer({ componentSource, fallback }: DynamicRendererProps) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setComponent(null);

    const parsed = parseGeneratedComponent(componentSource);
    if (!parsed.valid) {
      setError(`Syntax error: ${parsed.error}`);
      return;
    }

    const componentName = extractComponentName(parsed.ast);
    if (!componentName) {
      setError("Could not find a component function in the generated code.");
      return;
    }

    const safety = validateComponentSafety(parsed.ast);
    if (!safety.valid) {
      setError(`Safety check failed: ${safety.errors.join(", ")}`);
      return;
    }

    const compiled = compileGeneratedComponent(componentSource);
    if (!compiled.success) {
      setError(`Compile error: ${compiled.error}`);
      return;
    }

    try {
      const cleanedCode = compiled.compiledCode
        .replace(
          /import\s*{\s*jsx as _jsx\s*}\s*from\s*["']react\/jsx-runtime["'];?/,
          "const _jsx = React.createElement;"
        )
        .replace(/^import\s+.*$/gm, "")
        .replace(/export\s+default\s+/, "")
        .replace(/^export\s+/gm, "");

      const moduleFactory = new Function(
        "React",
        `
        const { useState, useEffect, useMemo, useCallback, useRef, useContext, useReducer } = React;
        const exports = {};
        ${cleanedCode}
        return ${componentName};
        `
      );

      const GeneratedComponent = moduleFactory(React);
      setComponent(() => GeneratedComponent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown execution error");
    }
  }, [componentSource]);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
        Could not render generated UI ({error}). Showing fallback instead.
        <div className="mt-2">{fallback}</div>
      </div>
    );
  }

  if (!Component) {
    return <div className="text-sm text-gray-500">Loading generated UI...</div>;
  }

  return <Component />;
}