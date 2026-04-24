# Use uma imagem Python leve, mas com suporte a bibliotecas de sistema
FROM python:3.11-slim

# Evitar a geração de arquivos .pyc e garantir logs em tempo real
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Instalar dependências de sistema necessárias para OpenCV e ddddocr
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o requirements primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# Instalar dependências do Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código
COPY . .

# Expor a porta que o FastAPI vai usar
EXPOSE 8000

# Comando para rodar a aplicação usando Gunicorn com workers Uvicorn para produção
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
