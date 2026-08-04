import * as Babel from "@babel/standalone";

export interface CompileSuccess {
  success: true;
  compiledCode: string;
}

export interface CompileFailure {
  success: false;
  error: string;
}

export function compileGeneratedComponent(
  sourceCode: string
): CompileSuccess | CompileFailure {
  try {
    const result = Babel.transform(sourceCode, {
      presets: ["react", "typescript"],
      filename: "GeneratedComponent.tsx",
    });

    if (!result.code) {
      return { success: false, error: "Compilation produced no output." };
    }

    return { success: true, compiledCode: result.code };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown compile error",
    };
  }
}