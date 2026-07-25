import { parseGeneratedComponent } from "./runtime/babel/parser";

const goodCode = `
import React from "react";
export default function LoginForm() {
  return <div>Hello</div>;
}
`;

const badCode = `
const App = (
`;

console.log("GOOD CODE ->", parseGeneratedComponent(goodCode));
console.log("BAD CODE ->", parseGeneratedComponent(badCode));

import traverse from "@babel/traverse";
import type { File } from "@babel/types";

export function extractComponentName(ast: File): string | null {
  let foundName: string | null = null;

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id?.name) {
        foundName = path.node.id.name;
      }
    },
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration.type === "FunctionDeclaration" && declaration.id?.name) {
        foundName = declaration.id.name;
      }
    },
  });

  return foundName;
}