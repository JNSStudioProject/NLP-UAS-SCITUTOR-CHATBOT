from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI()

# Load model and tokenizer directly (no pipeline needed)
model_id = "jessicanathania39/qa-scientifi-model-essay-nlp-uas"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSeq2SeqLM.from_pretrained(model_id)

class RequestModel(BaseModel):
    inputs: str
    parameters: dict = None

# We accept both the original URL format and a simple /predict
@app.post("/models/" + model_id)
@app.post("/predict")
def predict(req: RequestModel):
    params = req.parameters or {}
    
    gen_kwargs = {
        "max_new_tokens": params.get("max_new_tokens", 325),
        "repetition_penalty": params.get("repetition_penalty", 1.2),
        "no_repeat_ngram_size": params.get("no_repeat_ngram_size", 3),
        "do_sample": params.get("do_sample", True),
        "temperature": params.get("temperature", 0.7),
        "top_p": params.get("top_p", 0.95),
    }

    # Tokenize input, generate output, decode result
    input_ids = tokenizer(req.inputs, return_tensors="pt").input_ids
    outputs = model.generate(input_ids, **gen_kwargs)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Return in the exact array format expected by our Node.js backend
    return [{"generated_text": result}]

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SciTutor API is running!"}
