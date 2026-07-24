import traverse from "@babel/traverse";
import type { File } from "@babel/types";

const BANNED_IDENTIFIERS = new Set([
  "eval",
  "Function",
  "fetch",
  "XMLHttpRequest",
  "localStorage",
  "sessionStorage",
  "document",
  "window",
]);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateComponentSafety(ast: File): ValidationResult {
  const errors: string[] = [];

  traverse(ast, {
    Identifier(path) {
      if (BANNED_IDENTIFIERS.has(path.node.name)) {
        errors.push(`Disallowed identifier used: "${path.node.name}"`);
      }
    },
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (source !== "react" && !source.startsWith("./") && !source.startsWith("../")) {
        errors.push(`Disallowed import: "${source}"`);
      }
    },
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}