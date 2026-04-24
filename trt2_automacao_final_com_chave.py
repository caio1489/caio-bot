import requests
import base64
import json
import time
import os
import ddddocr

class TRT2BotFinal:
    def __init__(self, api_key_2captcha="ec722dea728475be0087f0666ca83772"):
        self.url_base = "https://pje.trt2.jus.br/pje-consulta-api/api/processos"
        self.session = requests.Session()
        self.api_key_2captcha = api_key_2captcha
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "X-Grau-Instancia": "1",
            "Content-Type": "application/json"
        }
        self.ocr_local = ddddocr.DdddOcr(show_ad=False)

    def resolver_captcha(self, imagem_b64):
        # Tenta 2Captcha
        if self.api_key_2captcha:
            try:
                post_res = requests.post("http://2captcha.com/in.php", data={
                    'key': self.api_key_2captcha, 'method': 'base64', 'body': imagem_b64, 'json': 1
                }, timeout=10)
                res_json = post_res.json()
                if res_json.get('status') == 1:
                    request_id = res_json.get('request')
                    for _ in range(10):
                        time.sleep(5)
                        get_res = requests.get(f"http://2captcha.com/res.php?key={self.api_key_2captcha}&action=get&id={request_id}&json=1")
                        if get_res.json().get('status') == 1:
                            return get_res.json().get('request')
            except: pass

        # Fallback OCR
        try:
            img_bytes = base64.b64decode(imagem_b64)
            return self.ocr_local.classification(img_bytes)
        except: return None
