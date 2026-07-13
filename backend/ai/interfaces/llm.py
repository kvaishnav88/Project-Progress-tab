from abc import ABC, abstractmethod


class LLMClient(ABC):
    """
    Base interface for all LLM providers.
    """

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """
        Generate a response from an LLM.
        """
        pass