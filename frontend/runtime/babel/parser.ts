import { parse } from "@babel/parser";
import type { ParseResult } from "@babel/parser";
import type { File } from "@babel/types";

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