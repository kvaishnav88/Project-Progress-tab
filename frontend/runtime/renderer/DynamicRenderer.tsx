import React, { useEffect, useState } from "react";
import { parseGeneratedComponent } from "../babel/parser";
import { validateComponentSafety } from "../babel/validator";
import { compileGeneratedComponent } from "./compile";

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
      const moduleFactory = new Function(
        "React",
        `
        const exports = {};
        ${compiled.compiledCode.replace(
          /import\s*{\s*jsx as _jsx\s*}\s*from\s*["']react\/jsx-runtime["'];?/,
          "const _jsx = React.createElement;"
        )}
        return LoginForm;
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