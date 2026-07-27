import re


class ResponseValidator:
    """
    Validate AI-generated React components.
    """

    def validate(self, component: str) -> tuple[bool, list[str]]:
        errors = []

        if not component or not component.strip():
            errors.append("Generated component is empty.")

        markdown_pattern = r"```(?:tsx|jsx|typescript|javascript)?"

        if re.search(markdown_pattern, component):
            errors.append("Markdown code fences detected.")

        if "export default" not in component and "export const" not in component:
            errors.append("No exported React component found.")

        if "className=" not in component:
            errors.append("Tailwind CSS classes not found.")

        if "React" not in component:
            errors.append("React import or usage missing.")

        return len(errors) == 0, errors