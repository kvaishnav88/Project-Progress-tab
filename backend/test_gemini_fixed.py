from ai.clients.gemini import GeminiClient

client = GeminiClient()
response = client.generate("Say Hello")
print(response)