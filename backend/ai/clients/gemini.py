from ai.config import settings
from ai.interfaces.llm import LLMClient
from ai.logger import logger
from ai.chains.ui_generation_chain import UIGenerationChain


_FALLBACK_COMPONENT = """
import React from "react";

export default function AdaptivePaymentForm() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <form className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Secure Checkout</h1>
        <p className="text-lg text-slate-600">
          Simplified payment form for high cognitive load.
        </p>
        <label className="block space-y-2">
          <span className="text-base font-medium text-slate-800">Card number</span>
          <input
            className="w-full rounded-xl border border-slate-300 px-4 py-4 text-lg"
            type="text"
            placeholder="ACCT-000003"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-6 py-4 text-xl font-semibold text-white"
        >
          Pay now
        </button>
      </form>
    </div>
  );
}
""".strip()


class GeminiClient(LLMClient):
    """
    Gemini implementation powered by LangChain.
    Falls back to a validator-safe stub when GEMINI_API_KEY is unset.
    """

    def __init__(self):
        self._use_fallback = not bool(settings.GEMINI_API_KEY)
        self.chain = None if self._use_fallback else UIGenerationChain()
        if self._use_fallback:
            logger.warning(
                "GEMINI_API_KEY missing — using local React stub for generation."
            )

    def generate(self, prompt: str) -> str:
        if self._use_fallback:
            logger.info("Returning fallback React component (no Gemini API key).")
            return _FALLBACK_COMPONENT

        logger.info("Executing LangChain UI Generation...")

        component = self.chain.invoke(prompt)

        component = (
            component
            .replace("```tsx", "")
            .replace("```typescript", "")
            .replace("```jsx", "")
            .replace("```", "")
            .strip()
        )

        logger.info("LangChain generation completed.")

        return component
