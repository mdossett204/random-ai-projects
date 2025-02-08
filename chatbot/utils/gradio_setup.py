import gradio as gr

from chatbot.utils.chat_app import chat

HEADER_HTML: str = "<h1 style='color: #282c34; font-family: Arial;'>Welcome to your basic options trading AI advisor!"

CSS: str = """
#user_input {
 border-color: #61dafb;
 background-color: #f5f5f5;
    font-family: 'Arial'
    font-size: 18px;
    font-weight: bold;
    color: #333;
    padding: 10px; /* Add some padding */
    border-radius: 6px; /* Rounded corners */
}

#model_output {
border-color: #61dafb;
  background-color: #f5f5f5;
    color: #333;
    font-weight: bold;
    font-size: 18px;
    padding: 10px;
    border: 1px solid #ccc; /* Add a border */
    border-radius: 6px; /* Rounded corners */
}
"""


with gr.Blocks(css=CSS) as demo:
    gr.HTML(HEADER_HTML)
    with gr.Row():
        input_box = gr.Textbox(label="Enter your options trading questions here.", elem_id="user_input")
        clear_btn = gr.Button("Clear")
        submit_btn = gr.Button("Submit")
    output_box = gr.Textbox(label="Options AI bot response.", elem_id="model_output")

    submit_btn.click(fn=chat, inputs=input_box, outputs=output_box)
    clear_btn.click(fn=lambda: "", inputs=None, outputs=input_box)
