import { parse } from "@babel/parser";
import type { ParseResult } from "@babel/parser";
import type { File } from "@babel/types";
import traverse from "@babel/traverse";


export interface ParseSuccess {
  valid: true;
  ast: ParseResult<File>;
}

export interface ParseFailure {
  valid: false;
  error: string;
}

export function parseGeneratedComponent(
  code: string
): ParseSuccess | ParseFailure {
  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    return {
      valid: true,
      ast,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown parse error",
    };
  }
}


export function extractComponentName(ast: File): string | null {
  let foundName: string | null = null;

  traverse(ast, {
    FunctionDeclaration(path) {
      if (path.node.id?.name && path.getFunctionParent() === null) {
        foundName = path.node.id.name;
      }
    },
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration.type === "FunctionDeclaration" && declaration.id?.name) {
        foundName = declaration.id.name;
      }
    },
    VariableDeclarator(path) {
      const init = path.node.init;
      const isFunctionLike =
        init?.type === "ArrowFunctionExpression" || init?.type === "FunctionExpression";
      if (
        isFunctionLike &&
        path.node.id.type === "Identifier" &&
        path.getFunctionParent() === null
      ) {
        foundName = path.node.id.name;
      }
    },
  });

  return foundName;
}