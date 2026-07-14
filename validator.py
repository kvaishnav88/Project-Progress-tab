import ast
from typing import List, Tuple

from design_system import ALLOWED_UI_CALLS, ALLOWED_STYLE_CLASSES

BANNED_NAMES = {
    "eval", "exec", "compile", "open", "os", "sys", "subprocess",
    "__import__", "globals", "locals", "vars", "getattr", "setattr",
    "delattr", "input", "exit", "quit",
}

REQUIRED_FUNCTION_NAME = "build_wizard"
REQUIRED_ARGS = ["container", "prefill_data", "on_complete"]

class _SafetyVisitor(ast.NodeVisitor):
    def __init__(self):
        self.errors: List[str] = []
        self.found_function = False

    def visit_Import(self, node):
        self.errors.append("Import statements are not allowed in generated code.")

    def visit_ImportFrom(self, node):
        self.errors.append("Import statements are not allowed in generated code.")

    def visit_Name(self, node):
        if node.id in BANNED_NAMES:
            self.errors.append(f'Disallowed identifier used: "{node.id}"')
        self.generic_visit(node)

    def visit_Attribute(self, node):
        if node.attr.startswith("__") and node.attr.endswith("__"):
            self.errors.append(f'Disallowed dunder attribute access: "{node.attr}"')
        if isinstance(node.value, ast.Name) and node.value.id == "ui":
            if node.attr not in ALLOWED_UI_CALLS and node.attr not in {"notify"}:
                self.errors.append(f'Disallowed NiceGUI element used: "ui.{node.attr}"')
        self.generic_visit(node)

    def visit_FunctionDef(self, node):
        if node.name == REQUIRED_FUNCTION_NAME:
            self.found_function = True
            arg_names = [a.arg for a in node.args.args]
            if arg_names != REQUIRED_ARGS:
                self.errors.append(
                    f"build_wizard must have signature {REQUIRED_ARGS}, got {arg_names}"
                )
        self.generic_visit(node)

def validate_generated_component(source_code: str) -> Tuple[bool, List[str]]:
    if not source_code or len(source_code) < 20:
        return False, ["Empty or malformed component source."]

    if len(source_code) > 8000:
        return False, ["Component exceeds maximum allowed size."]

    try:
        tree = ast.parse(source_code, mode="exec")
    except SyntaxError as e:
        return False, [f"Syntax error in generated code: {e}"]

    visitor = _SafetyVisitor()
    visitor.visit(tree)

    if not visitor.found_function:
        visitor.errors.append(f'No "{REQUIRED_FUNCTION_NAME}" function found.')

    return len(visitor.errors) == 0, visitor.errors