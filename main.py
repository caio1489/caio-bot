from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Optional
import base64
import uuid
import os

# Importar a lógica do robô
from trt2_automacao_final_com_chave import TRT2BotFinal

app = FastAPI(title="TRT2 Scraper API - Easypanel")

# CONFIGURAÇÃO DE CORS - Essencial para o Lovable conseguir acessar a API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, você pode restringir ao domínio do seu Lovable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância do bot (a chave 2captcha pode ser passada por variável de ambiente no Easypanel)
API_KEY_2CAPTCHA = os.getenv("API_KEY_2CAPTCHA", "ec722dea728475be0087f0666ca83772")
bot = TRT2BotFinal(api_key_2captcha=API_KEY_2CAPTCHA)

ongoing_challenges: Dict[str, Dict] = {}

class ProcessoRequest(BaseModel):
    numero_processo: str

class CaptchaResponse(BaseModel):
    challenge_id: str
    resposta: str

@app.get("/")
async def root():
    return {"status": "online", "message": "TRT2 Scraper API rodando no Easypanel"}

@app.post("/consultar_processo")
async def consultar_processo(request: ProcessoRequest):
    numero_processo = request.numero_processo
    print(f"[*] Recebida consulta para: {numero_processo}")
    
    try:
        bot.headers["Referer"] = f"https://pje.trt2.jus.br/consultaprocessual/detalhe-processo/{numero_processo}/1"
        res_dados = bot.session.get(f"{bot.url_base}/dadosbasicos/{numero_processo}", headers=bot.headers, timeout=15)
        
        if res_dados.status_code != 200:
            raise HTTPException(status_code=400, detail="Processo não encontrado ou sistema TRT2 instável.")
        
        data = res_dados.json()
        processo_id = data[0].get("id") if isinstance(data, list) else data.get("id")
        
        res_desafio = bot.session.get(f"{bot.url_base}/{processo_id}", headers=bot.headers, timeout=15)
        desafio_data = res_desafio.json()
        
        token_desafio = desafio_data.get('tokenDesafio')
        imagem_b64 = desafio_data.get('imagem')

        # Tenta resolver automático primeiro
        resposta_auto = bot.resolver_captcha(imagem_b64)
        
        if resposta_auto:
            url_valida = f"{bot.url_base}/{processo_id}?tokenDesafio={token_desafio}&resposta={resposta_auto}"
            res_valida = bot.session.get(url_valida, headers=bot.headers)
            
            if res_valida.status_code == 200:
                captcha_token = res_valida.headers.get('captchatoken')
                if captcha_token:
                    res_final = bot.session.get(f"{bot.url_base}/{processo_id}?tokenCaptcha={captcha_token}", headers=bot.headers)
                    return JSONResponse(content=res_final.json())

        # Se falhou automático, pede ajuda ao humano no Lovable
        challenge_id = str(uuid.uuid4())
        ongoing_challenges[challenge_id] = {
            "numero_processo": numero_processo,
            "processo_id": str(processo_id),
            "token_desafio": token_desafio
        }
        
        return {
            "status": "captcha_required",
            "challenge_id": challenge_id,
            "imagem_captcha_base64": imagem_b64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resolver_captcha")
async def resolver_captcha(response: CaptchaResponse):
    challenge_data = ongoing_challenges.pop(response.challenge_id, None)
    if not challenge_data:
        raise HTTPException(status_code=404, detail="Desafio expirado.")

    try:
        url_valida = f"{bot.url_base}/{challenge_data['processo_id']}?tokenDesafio={challenge_data['token_desafio']}&resposta={response.resposta}"
        res_valida = bot.session.get(url_valida, headers=bot.headers)
        
        captcha_token = res_valida.headers.get('captchatoken')
        if captcha_token:
            res_final = bot.session.get(f"{bot.url_base}/{challenge_data['processo_id']}?tokenCaptcha={captcha_token}", headers=bot.headers)
            return JSONResponse(content=res_final.json())
        
        raise HTTPException(status_code=400, detail="Captcha incorreto. Tente novamente.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
