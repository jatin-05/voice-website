from fastapi import FastAPI, File, Form, UploadFile
import pytesseract
from PIL import Image
import io
import cv2
import base64
import os
import numpy as np
from together import Together
from dotenv import load_dotenv
import uvicorn

app = FastAPI()

load_dotenv()
client = Together(api_key=os.getenv('TOGETHER_API_KEY'))  # Ensure API key is correct


def process_image(image_bytes, question):
    """Convert an image to base64 and send it to Together API with the query."""
    try:
        # Convert bytes to a NumPy array for OpenCV handling
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise ValueError("Invalid image format or corrupted file.")

        # Convert OpenCV image to PIL
        pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        # Encode image to base64
        buffer = io.BytesIO()
        pil_image.save(buffer, format="JPEG")
        base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')

        # Create message payload
        message = [
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                    {"type": "text", "text": question}
                ]
            }
        ]

        print("🚀 Sending image & query to Together API...")

        # API call
        response = client.chat.completions.create(
            model="meta-llama/Llama-Vision-Free",
            messages=message,
            max_tokens=200,
            temperature=0.7,
            top_p=0.7,
            top_k=50,
            repetition_penalty=1,
            stop=["<|eot_id|>", "<|eom_id|>"],
            stream=True
        )

        # Process response
        answer = ""
        for token in response:
            try:
                if hasattr(token, 'choices') and token.choices:
                    content = token.choices[0].delta.content
                    if content:
                        answer += content
            except (IndexError, AttributeError):
                continue

        return answer.strip() if answer else "No valid response received."

    except Exception as e:
        print(f"❌ Error processing image: {str(e)}")
        return f"Error: {str(e)}"


@app.post("/process")
async def process(file: UploadFile = File(...), query: str = Form(...)):
    try:
        # Read image bytes
        image_bytes = await file.read()

        # Process the image and query
        extracted_text = process_image(image_bytes, query)

        return {"response": extracted_text}

    except Exception as e:
        print(f"❌ Server Error: {str(e)}")
        return {"error": f"Server error: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)








# from fastapi import FastAPI, File, Form, UploadFile
# import pytesseract
# from PIL import Image
# import io
# import cv2
# import base64
# import os
# import io
# import numpy as np

# import threading
# from PIL import Image
# from together import Together
# from dotenv import load_dotenv
# import uvicorn



# app = FastAPI()


# load_dotenv()

# # Initialize Together client with API key
# client = Together(api_key=os.getenv('TOGETHER_API_KEY'))  # Ensure the correct variable name in .env



# def process_image(image, question):
#     """Convert an image to base64 and ask a question about it."""
#     try:
#         # Convert BGR to RGB if it's a NumPy array (Live capture)
#         if isinstance(image, np.ndarray):
#             image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
#             pil_image = Image.fromarray(image)
#         else:
#             # Load image from path (Uploaded image)
#             pil_image = Image.open(image)

#         # Encode image to base64
#         buffer = io.BytesIO()
#         pil_image.save(buffer, format="JPEG")
#         base64_image = base64.b64encode(buffer.getvalue()).decode('utf-8')

#         # question = input("\nAsk a question about the image: ")

#         # Create message with image and question
#         message = [
#             {
#                 "role": "user",
#                 "content": [
#                     {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
#                     {"type": "text", "text": question}
#                 ]
#             }
#         ]


        

#         # API call
#         response = client.chat.completions.create(
#             model="meta-llama/Llama-Vision-Free",
#             messages=message,
#             max_tokens=200,
#             temperature=0.7,
#             top_p=0.7,
#             top_k=50,
#             repetition_penalty=1,
#             stop=["<|eot_id|>", "<|eom_id|>"],
#             stream=True
#         )

#         # Process response
#         answer = ""
#         print("\nResponse: ", end="", flush=True)
#         for token in response:
#             if hasattr(token, 'choices') and token.choices:
#                 try:
#                     content = token.choices[0].delta.content
#                     if content:
#                         print(content, end='', flush=True)
#                         answer += content
#                 except (IndexError, AttributeError):
#                     continue
#         print("\n\nFull Answer:", answer)
#         # return answer 
#         return answer.strip() if answer else "No valid response received."

#     except Exception as e:
#         print(f"Error: {str(e)}")
#         return f"Error processing image: {str(e)}"









# @app.post("/process")
# async def process(
#     file: UploadFile = File(...), 
#     query: str = Form(...)
# ):
#     # Read image
#     image_bytes = await file.read()
#     # image = Image.open(io.BytesIO(image_bytes))
#     extracted_text=process_image(image_bytes, query)

#     # Extract text using Tesseract
#     # extracted_text = pytesseract.image_to_string(image)
#     # print("🖼️ Extracted Text:", extracted_text)

#     # Process query (basic example)
#     response_text = f"You asked: '{query}'. Detected text: '{extracted_text}'."

#     return {"response": response_text}

# if __name__ == "__main__":
#     # uvicorn.run(app , host = '0.0.0.0')
#     uvicorn.run(app , host = 'localhost' , port =8000)
