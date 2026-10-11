import React, { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import { validateComponentSafety } from "../babel/validator";
import { compileGeneratedComponent } from "./compile";
import { parseGeneratedComponent, extractComponentName } from "../babel/parser";

interface DynamicRendererProps {
  componentSource: string;
  fallback: React.ReactNode;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const MSG_SOURCE = "auragen-sandbox";

function collectStyles() {
  const links: string[] = [];
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((l) => {
    if (l.href.startsWith(window.location.origin + "/")) links.push(l.href);
  });
  let css = "";
  document.querySelectorAll("style").forEach((s) => {
    if (css.length < 400_000) css += s.textContent || "";
  });
  return { links, css: css.replace(/<\/style/gi, "") };
}

function buildSrcDoc(code: string, name: string, icons: string[]): string {
  const origin = window.location.origin;
  const { links, css } = collectStyles();
  const csp = [
    "default-src 'none'",
    `script-src 'unsafe-inline' ${origin}`,
    `style-src 'unsafe-inline' ${origin}`,
    `font-src ${origin} data:`,
    "img-src data:",
    "connect-src 'none'",
    "form-action 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "object-src 'none'",
  ].join("; ");
  const safeCode = code.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");
  const iconDecl = icons.map((n) => `var ${n} = __Icon;`).join("\n");

  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
${links.map((h) => `<link rel="stylesheet" href="${h}">`).join("\n")}
<style>html,body{margin:0;background:transparent}${css}</style>
</head><body><div id="root"></div>
<script src="${origin}/sandbox/react.production.min.js"></script>
<script src="${origin}/sandbox/react-dom.production.min.js"></script>
<script>
(function () {
  var TARGET = ${JSON.stringify(origin)};
  function post(m) { m.source = ${JSON.stringify(MSG_SOURCE)}; parent.postMessage(m, TARGET); }
  window.onerror = function (msg) { post({ type: "error", message: String(msg) }); };
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest && e.target.closest("a");
    if (a) e.preventDefault();
  }, true);
  document.addEventListener("submit", function (e) { e.preventDefault(); }, true);
  try {
    var React = window.React, ReactDOM = window.ReactDOM;
    var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo,
        useCallback = React.useCallback, useRef = React.useRef, useContext = React.useContext,
        useReducer = React.useReducer, useId = React.useId;
    var _jsx = React.createElement, _jsxs = React.createElement, _Fragment = React.Fragment;
    var __Icon = function () {
      return React.createElement("span", { "aria-hidden": "true", style: { display: "inline-block", width: "1em", height: "1em" } });
    };
    ${iconDecl}
    var Generated = (function () {
      var exports = {};
      ${safeCode}
      return ${name};
    })();
    var noop = function () {};
    ReactDOM.createRoot(document.getElementById("root")).render(
      React.createElement(Generated, { onSave: noop, onSubmit: noop, onComplete: noop, onCancel: noop, onChange: noop, onClick: noop })
    );
    var report = function () { post({ type: "height", value: document.documentElement.scrollHeight }); };
    new ResizeObserver(report).observe(document.body);
    report();
  } catch (e) {
    post({ type: "error", message: e && e.message ? e.message : "Unknown execution error" });
  }
})();
</script></body></html>`;
}

export function DynamicRenderer({ componentSource, fallback }: DynamicRendererProps) {
  const [error, setError] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [height, setHeight] = useState(120);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setError(null);
    setSrcDoc(null);

    const parsed = parseGeneratedComponent(componentSource);
    if (!parsed.valid) {
      setError(`Syntax error: ${parsed.error}`);
      return;
    }
    const name = extractComponentName(parsed.ast);
    if (!name || !IDENT.test(name)) {
      setError("Could not find a valid component function in the generated code.");
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

    const code = compiled.compiledCode
      .replace(/^import\s+.*$/gm, "")
      .replace(/export\s+default\s+/, "")
      .replace(/^export\s+/gm, "");
    const icons = Array.from(
      new Set((code.match(/[A-Z][A-Za-z0-9]*/g) || []).filter((n) => n in LucideIcons && IDENT.test(n)))
    );
    setSrcDoc(buildSrcDoc(code, name, icons));
  }, [componentSource]);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.source !== MSG_SOURCE) return;
      if (d.type === "height" && typeof d.value === "number") {
        setHeight(Math.min(Math.max(d.value, 60), 1600));
      } else if (d.type === "error") {
        setError(`Runtime error: ${String(d.message).slice(0, 200)}`);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
        Could not render generated UI ({error}). Showing fallback instead.
        <div className="mt-2">{fallback}</div>
      </div>
    );
  }
  if (!srcDoc) {
    return <div className="text-sm text-gray-500">Loading generated UI...</div>;
  }
  return (
    <iframe
      ref={frameRef}
      title="Generated UI"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      referrerPolicy="no-referrer"
      style={{ width: "100%", height, border: 0, background: "transparent" }}
    />
  );
}