from ai.interfaces.llm import LLMClient
from ai.logger import logger
from ai.chains.ui_generation_chain import UIGenerationChain


class GeminiClient(LLMClient):
    """
    Gemini implementation powered by LangChain.
    """

    def __init__(self):
        self.chain = UIGenerationChain()

    def generate(self, prompt: str) -> str:

        logger.info(
            "Executing LangChain UI Generation..."
        )

        component = self.chain.invoke(prompt)

        component = (
            component
            .replace("```tsx", "")
            .replace("```typescript", "")
            .replace("```jsx", "")
            .replace("```", "")
            .strip()
        )

        logger.info(
            "LangChain generation completed."
        )

        return component