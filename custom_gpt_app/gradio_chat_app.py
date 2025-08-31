from datetime import datetime
import logging
import os
from typing import List, Tuple

from dotenv import load_dotenv
import gradio as gr
import openai


load_dotenv(override=True)
logger = logging.getLogger(__name__)
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    filename=f"logs/gradio_chat_app_{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}.log", level=logging.INFO
)


class OpenAIChat:
    def __init__(self):
        self.client = None
        self.conversation_history = []

        self.models = {
            "o3": "Reasoning model for complex tasks, suceeded by GPT-5",
            "o3-mini": "A small model alterantive to o3",
            "o4-mini": "Fast,cost efficient reasoning model, succeeded by GPT-5 mini",
            "gpt-4o": "Fast, intelligent, flexible GPT model",
            "gpt-4o-mini": "Fast, affordable small model for focused tasks",
            "gpt-4.1": "GPT-4.1 - Smartest non-reasioning model",
            "gpt-4.1-mini": "Smaller, faster version of GPT4.1.",
            "gpt-4.1-nano": "Fastest, most cost efficient version of GPT-4.1",
            "gpt-5": "GPT-5 - The best model for coding and agentic tasks across domains",
            "gpt-5-mini": "GPT-5 Mini - A faster, cost-efficient version of GPT-5 for well defined tasks",
            "gpt-5-nano": "GPT-5 Nano - Fastest, most cost efficient version of GPT-5",
        }
        self.non_param_models = ["o3", "o3-mini", "o4-mini", "gpt-5", "gpt-5-mini", "gpt-5-nano"]

    def get_client(self) -> str:
        """Get OpenAI client if API key is set"""
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if api_key == "":
            return "Please enter your OpenAI API key"

        if not api_key.startswith("sk-"):
            return "⚠️ API key should start with 'sk-'"

        try:
            self.client = openai.OpenAI(api_key=api_key)
            logger.info("Initializing OpenAI client initialized... ")
            return "✅ API key configured successfully!"
        except Exception as exc:
            logging.error(f"Error initializing OpenAI client: {exc}")
            return "❌ Error setting API key."

    def chat(
        self, message: str, model: str, max_tokens: int, temperature: float, history: List[Tuple[str, str]]
    ) -> Tuple[List[Tuple[str, str]], str]:
        """Send message to selected OpenAI model"""
        if not self.client:
            get_client_status = self.get_client()
            if get_client_status != "✅ API key configured successfully!":
                return history, get_client_status

        if not message.strip():
            return history, ""

        try:
            messages = [{"role": "system", "content": "You are a helpful assistant."}]

            for user_msg, assistant_msg in history:
                messages.append({"role": "user", "content": user_msg})
                messages.append({"role": "assistant", "content": assistant_msg})

            messages.append({"role": "user", "content": message})
            if model in self.non_param_models:
                logger.info(f"Model: {model}, Message: {message}")
            else:
                max_tokens = min(max(max_tokens, 16), 5000)
                temperature = min(max(temperature, 0.0), 2.0)
                logger.info(f"Model: {model}, Message: {message}, max token: {max_tokens}, temp: {temperature}")
            response = self.client.responses.create(
                model=model,
                input=messages,
                max_output_tokens=max_tokens if model not in self.non_param_models else None,
                temperature=temperature if model not in self.non_param_models else None,
            )

            assistant_response = response.output_text.strip()

            history.append((message, assistant_response))

            self.conversation_history = history.copy()

            return history, ""

        except Exception as exc:
            logging.error(f"Error during chat: {exc}")
            return history, "something went wrong, please try again."

    def save_conversation(self, folder_path: str = "") -> str:
        """Save conversation to a file"""
        if not self.conversation_history:
            return "No conversation to save."

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"chat_conversation_{timestamp}.txt"
            if folder_path.strip():
                folder_path = folder_path.strip()
                os.makedirs(folder_path, exist_ok=True)
                full_path = os.path.join(folder_path, filename)
            else:
                full_path = filename
            logger.info(f"Saving conversation to {full_path}")
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(f"OpenAI Chat Conversation - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write("=" * 60 + "\n\n")

                for i, (user_msg, assistant_msg) in enumerate(self.conversation_history, 1):
                    f.write(f"--- Message {i} ---\n")
                    f.write(f"User: {user_msg}\n\n")
                    f.write(f"Assistant: {assistant_msg}\n\n")
                    f.write("-" * 40 + "\n\n")

            return f"✅ Conversation saved as {filename}"

        except Exception as e:
            return f"❌ Error saving conversation: {str(e)}"

    def clear_chat(self) -> Tuple[List, str]:
        """Clear the chat history"""
        self.conversation_history = []
        logger.info("Chat history cleared.")
        return [], ""


def create_interface():
    chat_app = OpenAIChat()

    with open("style.css", "r") as style_file:
        custom_css = style_file.read()

    with gr.Blocks(css=custom_css, title="OpenAI Model Selection Chat", theme=gr.themes.Soft()) as demo:
        gr.Markdown("""
        # 🤖 OpenAI Model Selection Chat

        **⬇️ DOWNLOAD ONLY - FOR LOCAL USE**

        This tool bypasses ChatGPT's model limitations by connecting directly to OpenAI's API.

        **🔒 Security First**:
        - Download and run locally to protect your API keys
        - Never enter real API keys in online demos
        - Your keys stay on your machine only inside .env file

        **🚀 Quick Setup:**
        1. Download this code
        2. Create virtual environemnt: `pyenv shell 3.12 && python -m venv chat-env && source chat-env/bin/activate`
        2. Install: `pip install -r requirements.txt`
        3. Run: `python gradio_chat_app.py`
        4. Open: http://127.0.0.1:7860
        5. Use the chat interface!

        **📝 Blog**: [How to Use OpenAI API for Model Selection](your-blog-link-here)
        """)

        with gr.Row():
            with gr.Column(scale=1):
                # Model selection
                gr.Markdown("### 🎯 Model Selection")
                model_dropdown = gr.Dropdown(
                    choices=list(chat_app.models.keys()),
                    value="gpt-4.1-nano",
                    label="Select Model",
                    info="Choose your OpenAI model",
                )

                model_info = gr.Textbox(
                    label="Model Info", value=chat_app.models["gpt-4.1-nano"], interactive=False, lines=2
                )

                gr.Markdown("### 🎛️ Model Parameters")
                max_tokens = gr.Number(
                    label="Max Output Tokens",
                    value=500,
                    minimum=16,
                    maximum=5000,
                    info="Maximum tokens in response (10-5000)",
                )
                temperature = gr.Number(
                    label="Temperature",
                    value=0.0,
                    minimum=0.0,
                    maximum=2.0,
                    step=0.1,
                    info="Creativity level (0=focused, 2=creative)",
                )

                # Controls
                gr.Markdown("### 💾 Controls")
                with gr.Row():
                    folder_path = gr.Textbox(
                        label="Save Folder (optional)",
                        placeholder="./conversations",
                        info="Leave empty to save in current directory",
                        scale=2,
                    )
                    save_btn = gr.Button("Save Conversation", variant="secondary", scale=1)

                clear_btn = gr.Button("Clear Chat", variant="stop")
                save_status = gr.Textbox(label="Save Status", interactive=False, lines=2)

            with gr.Column(scale=2):
                # Chat interface
                gr.Markdown("### 💬 Chat Interface")
                chatbot = gr.Chatbot(label="Conversation", height=500, show_label=True)

                with gr.Row():
                    msg = gr.Textbox(label="Your message", placeholder="Type your message here...", scale=4, lines=1)
                    send_btn = gr.Button("Send", variant="primary", scale=1)

                error_display = gr.Textbox(label="Status", interactive=False, visible=False, lines=1)

        # Event handlers
        model_dropdown.change(
            fn=lambda model: chat_app.models.get(model, ""), inputs=[model_dropdown], outputs=[model_info]
        )

        def handle_message(message, model, max_tokens, temperature, history):
            new_history, error = chat_app.chat(message, model, max_tokens, temperature, history)
            return new_history, "", error, gr.update(visible=bool(error))

        send_btn.click(
            fn=handle_message,
            inputs=[msg, model_dropdown, max_tokens, temperature, chatbot],
            outputs=[chatbot, msg, error_display, error_display],
        )

        msg.submit(
            fn=handle_message,
            inputs=[msg, model_dropdown, max_tokens, temperature, chatbot],
            outputs=[chatbot, msg, error_display, error_display],
        )

        save_btn.click(fn=chat_app.save_conversation, inputs=[folder_path], outputs=[save_status])

        clear_btn.click(fn=chat_app.clear_chat, outputs=[chatbot, save_status])

        # Cost information
        with gr.Accordion("💰 Model Pricing Info:", open=True):
            gr.Markdown("""
            **Approximate pricing (check OpenAI's official pricing [here](https://platform.openai.com/docs/pricing?latest-pricing=standard)):**
            - **o3-mini**: $1.10/$4.40 per 1M tokens (input/output)
            - **o3**: $2.00/$8.00 per 1M tokens (input/output)
            - **o4-mini**: ~$1.10/$4.40 per 1M tokens (input/output)
            - **gpt-4o**: ~$2.50/$10.00 per 1M tokens (input/output)
            - **gpt-4o-mini**: ~$0.15/$0.60 per 1M tokens (input/output)
            - **gpt-4.1**: ~$2.00/$8.00 per 1M tokens (input/output)
            - **gpt-4.1-mini**: ~$0.40/$1.60 per 1M tokens (input/output)
            - **gpt-4.1-nano**: ~$0.10/$0.40 per 1M tokens (input/output)
            - **gpt-5**: ~$1.25/$10.00 per 1M tokens (input/output)
            - **gpt-5-mini**: ~$0.25/$2.00 per 1M tokens (input/output)
            - **gpt-5-nano**: ~$0.05/$0.40 per 1M tokens (input/output)

            💡 **Tip**: Start with cheaper models for testing, upgrade for complex tasks
            """)
    return demo


demo = create_interface()

if __name__ == "__main__":
    # Local development
    demo.launch(share=False, server_name="127.0.0.1", server_port=7860, show_error=True)
