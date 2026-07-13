import os

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ClientError, ServerError

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=API_KEY)


def generate_response(prompt: str) -> str:
    try:
        # print(f"Using model: {MODEL_NAME}")

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        return response.text

    except ClientError as e:
        print(f"Client Error: {e}")
        raise

    except ServerError as e:
        print(f"Server Error: {e}")
        raise