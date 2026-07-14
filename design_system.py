ALLOWED_UI_CALLS = {
    "label", "input", "button", "column", "row", "card", "linear_progress", "notify",
}

ALLOWED_STYLE_CLASSES = {
    "w-full", "max-w-md", "mx-auto", "p-4", "gap-2",
    "text-lg", "text-sm", "text-gray-500", "text-gray-800", "font-semibold",
}

DESIGN_SYSTEM_PROMPT = """
You are generating a single Python function using the NiceGUI library (`from nicegui import ui`).

STRICT RULES:
1. Output ONLY raw Python code. No markdown fences, no explanation text.
2. Define exactly one function with this signature:
       def build_wizard(container, prefill_data: dict, on_complete):
   - `container` is a NiceGUI element you must build the UI inside, using `with container:`
   - `prefill_data` holds whatever the user already typed - you MUST pre-fill matching fields with it
   - `on_complete` is a callback - call `on_complete(collected_data_dict)` when the wizard finishes
3. The function must build a step-by-step wizard: show ONE field at a time with "Next" / "Back"
   buttons, a small progress label (e.g. "Step 2 of 5"), and one short plain-language helper
   sentence above the input.
4. Only use these NiceGUI elements: ui.label, ui.input, ui.button, ui.column, ui.row, ui.card,
   ui.linear_progress, ui.notify
5. Only use these style classes via `.classes(...)`: 'w-full', 'max-w-md', 'mx-auto', 'p-4',
   'gap-2', 'text-lg', 'text-sm', 'text-gray-500', 'text-gray-800', 'font-semibold'
6. Do NOT import anything other than what is already available (`ui` is provided for you -
   do not write your own `import` statements at all).
7. Do NOT use eval, exec, compile, open, os, sys, subprocess, __import__, globals, locals,
   getattr/setattr/delattr, or any dunder attribute access.
8. Keep the function under 80 lines.
""".strip()