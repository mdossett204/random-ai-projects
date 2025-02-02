from dotenv import load_dotenv

from configs.gradio_setup import demo


load_dotenv()


if __name__ == "__main__":
    demo.queue().launch(share=True)
