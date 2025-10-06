from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
from configs.settings import settings
from configs.paths import MODEL_DIR
class Translator:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        model_path = f"{MODEL_DIR}/{settings.model_registry['translator']}"
        self.tokenizer = AutoTokenizer.from_pretrained(model_path)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_path).to(self.device)

    def translate(self,text, src_lang="vie_Latn", tgt_lang="eng_Latn"):
        self.tokenizer.src_lang = src_lang
        encoded = self.tokenizer(text, return_tensors="pt").to(self.model.device)
        generated_tokens = self.model.generate(
            **encoded, forced_bos_token_id=self.tokenizer.convert_tokens_to_ids(tgt_lang), max_length=512
        )
        return self.tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
