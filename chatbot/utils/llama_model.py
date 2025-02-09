from langchain_ollama.llms import OllamaLLM
from langchain_core.messages import trim_messages

MODEL_NAME: str = "llama3.2:3b-instruct-fp16"
MAX_TOKEN: int = 500
model = OllamaLLM(model=MODEL_NAME)

trimmer = trim_messages(
    max_tokens=MAX_TOKEN, strategy="last", token_counter=model, include_system=True, allow_partial=False
)
