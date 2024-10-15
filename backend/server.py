import base64
from fastapi import FastAPI, File, UploadFile, Form
import requests
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
 
IBM_WATSON_URL = "https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29"
PROJECT_ID = ""
MODEL_ID = "meta-llama/llama-3-2-90b-vision-instruct"
ACCESS_TOKEN = ""

@app.middleware("http")
async def add_access_control_allow_origin(request: requests, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

origins = [
    "http://localhost:8082",  # Your React Native app's URL during development
    "http://127.0.0.1:8000",  # Add any other origins as needed
]

@app.post("/ask-question/")
async def ask_question(
    image: UploadFile = File(...)
):
    patient_info=None
    question="is this food healthy"
    # Convert the uploaded image to base64
    image_bytes = await image.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    
    prompt=f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>You are a experienced dieticion working for need and poor people your job is to provide cheap and healthy alternatives to the food the patients are consuming and you will be provided by an image wich will contains edibles, you will be provided by additional info about the patient Patient_info:{patient_info}, your job is to provide nutritional information, strictly mention the attributes in the following manner "{{foods:{{food1:{{"macronutrients":{{"calories":"","protein":"","fat":"","carbs":"","fiber":""}}, "micronutrients":{{list all micronutrients}}}},food2:..}}}}",you will also provide alternative to the foods that are detected   <|eot_id|><|start_header_id|>user<|end_header_id|>{question} <|eot_id|><|start_header_id|>assistant<|end_header_id|>"""
   
    # Prepare the request body for Watson API
    body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"{prompt} "},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                ]
            }
        ],
        "project_id": PROJECT_ID,
        "model_id": MODEL_ID,
        "decoding_method": "greedy",
        "repetition_penalty": 1,
        "max_tokens": 900
    }
   
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Access-Control-Allow-Origin": "*"
    }
   
    # Send request to IBM Watson API
    response = requests.post(IBM_WATSON_URL, headers=headers, json=body)
   
    if response.status_code != 200:
        raise Exception(f"Non-200 response: {response.text}")
   
    # Return the response from the Watson API
    data = response.json()
    # response_text = response.choices[0].message.content
    # print(response_text)
    data=data['choices'][0]
    data=data['message']
    print(data['content'])
    task=f"""you job is to convert the given text to json {data['content']}"""
 
 
    body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f" {task} "},
                   
                ]
            }
        ],
        "project_id": PROJECT_ID,
        "model_id": MODEL_ID,
        "decoding_method": "greedy",
        "repetition_penalty": 1,
        "max_tokens": 900
    }
    response2 = requests.post(IBM_WATSON_URL, headers=headers, json=body)
   
    if response2.status_code != 200:
        raise Exception(f"Non-200 response: {response.text}")
   
    # Return the response from the Watson API
    data2 = response2.json()
    # response_text = response.choices[0].message.content
    # print(response_text)
    data2=data2['choices'][0]
    data2=data2['message']
    print(data2['content'])
    return data2['content']