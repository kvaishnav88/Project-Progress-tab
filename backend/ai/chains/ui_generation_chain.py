from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from ai.config import settings


class UIGenerationChain:
    """
    LangChain pipeline responsible for generating adaptive UI components.
    """

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is missing. "
                "Set it in backend/.env or as an environment variable. "
                "Get a key from https://aistudio.google.com/apikey"
            )

        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )

        self.prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    """
You are a Senior React, TypeScript and Tailwind CSS Engineer.

Generate production-ready React components.

Always:

- Use TypeScript
- Use Tailwind CSS
- Return ONLY React code
- Never include explanations
""",
                ),
                (
                    "human",
                    "{prompt}",
                ),
            ]
        )

        self.chain = (
            self.prompt
            | self.llm
            | StrOutputParser()
        )

    def invoke(self, prompt: str) -> str:

        return self.chain.invoke(
            {
                "prompt": prompt,
            }
        )
