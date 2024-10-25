import transformers
import requests
import os
import sys
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

# Load environment variables
from dotenv import find_dotenv, load_dotenv
load_dotenv(find_dotenv())
HUGGINGFACEHUB_API_TOKEN = os.getenv("HUGGINGFACEHUB_API_TOKEN")

model_name = "gpt2"
device = "cuda" if torch.cuda.is_available() else "cpu"

tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)
model.to(device)

def img2text(image_path):
    print("img2text")
    image_to_text = transformers.pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")
    text = image_to_text(image_path)[0]["generated_text"]
    return text

def generate_story(scenario):
    print("generateStory")
    prompt = f"there once was a {scenario}"

    input_ids = tokenizer.encode(prompt, return_tensors='pt').to(device)
    attention_mask = torch.ones(input_ids.shape, device=device)
    output = model.generate(
        input_ids,
        attention_mask=attention_mask,
        max_new_tokens=200,
        pad_token_id=tokenizer.eos_token_id,
        do_sample=True,
        # top_k = 50,
        # top_p = 0.85
    )
    story = tokenizer.decode(output[0], skip_special_tokens=True)
    story = story[(len(prompt)-len(scenario)):].strip()
    return story

def text2speech(message):
    print("text2speech")
    API_URL = "https://api-inference.huggingface.co/models/espnet/kan-bayashi_ljspeech_vits"
    headers = {"Authorization": f"Bearer {HUGGINGFACEHUB_API_TOKEN}"}
    payload = {"inputs": message}

    response = requests.post(API_URL, headers=headers, json=payload)
    audio_path = "output\\audio.flac"
    with open(audio_path, "wb") as file:
        file.write(response.content)
    return audio_path

def main(image_path):
    scenario = img2text(image_path)
    story = generate_story(scenario)
    
    scenario_path = "output\\scenario.txt"
    with open(scenario_path, "w") as file:
        file.write(scenario)

    story_path = "output\\story.txt"
    with open(story_path, "w") as file:
        file.write(story)
    
    audio_path = text2speech(story)
    return scenario,story_path, audio_path

if __name__ == '__main__':
    # if len(sys.argv) != 2:
    #     print("Usage: python script.py <image_path>")
    #     sys.exit(1)

    # image_path = sys.argv[1]
    image_path = "output\\downloaded_image.jpg"
    scenario, story_path, audio_path = main(image_path)
    print(story_path)
    print(audio_path)
