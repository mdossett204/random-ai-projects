import gradio as gr
import openai
from dotenv import load_dotenv
import os
from datetime import datetime
from typing import List, Tuple
import logging

load_dotenv(override=True)
logger = logging.getLogger(__name__)
logging.basicConfig(filename="gradio_chat_app.log", level=logging.INFO)


class OpenAIChat:
    def __init__(self):
        self.client = None
        self.conversation_history = []

        # Available models with descriptions and rough cost info
        self.models = {
            "o3-mini": "Latest O3 mini model - Fast and efficient",
            "o3": "Latest O3 model - Most capable reasoning",
            "gpt-4o": "GPT-4 Omni - Multimodal capabilities",
            "gpt-4o-mini": "GPT-4 Omni Mini - Faster and cheaper",
            "gpt-4-turbo": "GPT-4 Turbo - High performance",
            "gpt-5": "GPT-5 - Next generation model",
            "gpt-4": "GPT-4 - Original high-capability model",
        }

    def get_client(self) -> str:
        """Get OpenAI client if API key is set"""
        api_key = os.environ.get("OPENAI_API_KEY", "").strip()
        if api_key == "":
            return "Please enter your OpenAI API key"

        if not api_key.startswith("sk-"):
            return "⚠️ API key should start with 'sk-'"

        try:
            # Initialize OpenAI client
            self.client = openai.OpenAI(api_key=api_key)
            return "✅ API key configured successfully!"
        except Exception as exc:
            logging.error(f"Error initializing OpenAI client: {exc}")
            return "❌ Error setting API key."

    def chat(self, message: str, model: str, history: List[Tuple[str, str]]) -> Tuple[List[Tuple[str, str]], str]:
        """Send message to selected OpenAI model"""
        if not self.client:
            get_client_status = self.get_client()
            if get_client_status != "✅ API key configured successfully!":
                return history, get_client_status

        if not message.strip():
            return history, ""

        try:
            # Build messages for API
            messages = [{"role": "system", "content": "You are a helpful assistant."}]

            # Add conversation history
            for user_msg, assistant_msg in history:
                messages.append({"role": "user", "content": user_msg})
                messages.append({"role": "assistant", "content": assistant_msg})

            # Add current message
            messages.append({"role": "user", "content": message})

            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=model, messages=messages, max_tokens=50, temperature=0.5
            )

            assistant_response = response.choices[0].message.content

            # Update history
            history.append((message, assistant_response))

            # Store in conversation history for saving
            self.conversation_history = history.copy()

            return history, ""

        except Exception as exc:
            logging.error(f"Error during chat: {exc}")
            return history, "something went wrong, please try again."

    def save_conversation(self) -> str:
        """Save conversation to a file"""
        if not self.conversation_history:
            return "No conversation to save."

        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"chat_conversation_{timestamp}.txt"

            with open(filename, "w", encoding="utf-8") as f:
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
        return [], ""


def create_interface():
    chat_app = OpenAIChat()

    with gr.Blocks(title="OpenAI Model Selection Chat", theme=gr.themes.Soft()) as demo:
        gr.Markdown("""
        # 🤖 OpenAI Model Selection Chat

        **⬇️ DOWNLOAD ONLY - FOR LOCAL USE**

        This tool bypasses ChatGPT's model limitations by connecting directly to OpenAI's API.

        **🔒 Security First**:
        - Download and run locally to protect your API keys
        - Never enter real API keys in online demos
        - Your keys stay on your machine only

        **🚀 Quick Setup:**
        1. Download this code
        2. Install: `pip install gradio openai`
        3. Run: `python app.py`
        4. Open: http://localhost:7860
        5. Enter your OpenAI API key

        **📝 Blog**: [How to Use OpenAI API for Model Selection](your-blog-link-here)
        """)

        with gr.Row():
            with gr.Column(scale=1):
                # Model selection
                gr.Markdown("### 🎯 Model Selection")
                model_dropdown = gr.Dropdown(
                    choices=list(chat_app.models.keys()),
                    value="gpt-4o-mini",
                    label="Select Model",
                    info="Choose your OpenAI model",
                )

                model_info = gr.Textbox(
                    label="Model Info", value=chat_app.models["gpt-4o-mini"], interactive=False, lines=2
                )

                # Controls
                gr.Markdown("### 💾 Controls")
                save_btn = gr.Button("Save Conversation", variant="secondary")
                clear_btn = gr.Button("Clear Chat", variant="stop")
                save_status = gr.Textbox(label="Save Status", interactive=False, lines=1)

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

        def handle_message(message, model, history):
            new_history, error = chat_app.chat(message, model, history)
            return new_history, "", error, gr.update(visible=bool(error))

        send_btn.click(
            fn=handle_message,
            inputs=[msg, model_dropdown, chatbot],
            outputs=[chatbot, msg, error_display, error_display],
        )

        msg.submit(
            fn=handle_message,
            inputs=[msg, model_dropdown, chatbot],
            outputs=[chatbot, msg, error_display, error_display],
        )

        save_btn.click(fn=chat_app.save_conversation, outputs=[save_status])

        clear_btn.click(fn=chat_app.clear_chat, outputs=[chatbot, save_status])

        # Cost information
        with gr.Accordion("💰 Model Pricing Info", open=False):
            gr.Markdown("""
            **Approximate pricing (check OpenAI's official pricing):**
            - **o3-mini**: Most cost-effective for reasoning tasks
            - **o3**: Premium pricing for advanced reasoning
            - **gpt-4o-mini**: ~$0.15/$0.60 per 1M tokens (input/output)
            - **gpt-4o**: ~$2.50/$10.00 per 1M tokens (input/output)
            - **gpt-4-turbo**: ~$10.00/$30.00 per 1M tokens (input/output)
            - **gpt-5**: Pricing TBD

            💡 **Tip**: Start with cheaper models for testing, upgrade for complex tasks
            """)

    return demo


# For Hugging Face Spaces deployment
demo = create_interface()

if __name__ == "__main__":
    # Local development
    demo.launch(share=False, server_name="127.0.0.1", server_port=7860, show_error=True)
else:
    # Hugging Face Spaces deployment
    demo.launch()
