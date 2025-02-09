from dotenv import load_dotenv
import os

os.environ["USER_AGENT"] = "custom_agent"


from utils.gradio_setup import demo


load_dotenv()


if __name__ == "__main__":
    demo.queue().launch(share=True)
