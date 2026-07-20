from google import genai
from google.genai.errors import ClientError, ServerError

from ai.config import settings
from ai.interfaces.llm import LLMClient
from ai.logger import logger


if not settings.GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")


client = genai.Client(api_key=settings.GEMINI_API_KEY)


class GeminiClient(LLMClient):
    """
    Gemini implementation of the LLM interface.
    """

    def generate(self, prompt: str) -> str:
        try:
            logger.info(
                "Sending request to Gemini model: %s",
                settings.GEMINI_MODEL,
            )

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
            )

            logger.info("Gemini response received successfully.")

            component = response.text

            component = component.replace("```tsx", "")
            component = component.replace("```typescript", "")
            component = component.replace("```jsx", "")
            component = component.replace("```", "")
            component = component.strip()

            return component

        except ClientError as e:
            logger.error("Gemini Client Error: %s", e)
            raise RuntimeError(f"Gemini Client Error: {e}") from e

        except ServerError as e:
            logger.error("Gemini Server Error: %s", e)
            raise RuntimeError(f"Gemini Server Error: {e}") from e

        except Exception as e:
            logger.exception("Unexpected Gemini Error")
            raise RuntimeError(f"Unexpected Gemini Error: {e}") from e