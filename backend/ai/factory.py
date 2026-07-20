from ai.clients.gemini import GeminiClient
from ai.config import settings
from ai.interfaces.llm import LLMClient


def get_llm_client() -> LLMClient:
    """
    Returns the configured LLM client.
    """

    # Future:
    # if settings.LLM_PROVIDER == "openai":
    #     return OpenAIClient()

    return GeminiClient()