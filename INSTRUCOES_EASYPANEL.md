# Guia de Instalação: TRT2 Scraper no Easypanel + Lovable

Este pacote contém tudo o que você precisa para rodar o seu robô de scraping de forma profissional em uma VPS usando o Easypanel e conectá-lo ao seu sistema no Lovable.

## 1. Preparação (Subir os arquivos)

1.  Crie um repositório no seu GitHub (pode ser privado).
2.  Suba todos os arquivos da pasta `easypanel_deploy` para esse repositório:
    *   `Dockerfile`
    *   `main.py`
    *   `trt2_automacao_final_com_chave.py`
    *   `requirements.txt`

## 2. Configuração no Easypanel

1.  No seu painel do **Easypanel**, clique em **"Create Project"**.
2.  Dentro do projeto, clique em **"App"** e selecione **"GitHub"**.
3.  Conecte ao repositório que você acabou de criar.
4.  O Easypanel detectará automaticamente o `Dockerfile`.
5.  **Variáveis de Ambiente (Opcional)**:
    *   Vá em **Environment** e adicione: `API_KEY_2CAPTCHA` com a sua chave (se quiser trocar a que já está no código).
6.  **Domínio**: O Easypanel gerará um domínio para você (ex: `trt2-bot.seuservidor.com`). **Copie este domínio.**
7.  Clique em **"Deploy"**.

## 3. Integração no Lovable

1.  Abra o seu projeto no **Lovable**.
2.  Crie um novo componente chamado `TRT2Scraper.tsx`.
3.  Copie o conteúdo do arquivo `LovableComponent.tsx` (que eu te mandei) para este novo arquivo.
4.  **Ajuste a URL**:
    *   No topo do arquivo `TRT2Scraper.tsx`, mude a linha:
    ```typescript
    const API_URL = "https://SEU-DOMINIO-DO-EASYPANEL.com";
    ```
5.  Salve e pronto! O Lovable agora falará diretamente com o seu robô no Easypanel.

## 4. Por que usar esta estrutura?

*   **Sem ngrok**: Seu robô tem um endereço fixo e seguro (HTTPS) na internet.
*   **Auto-healing**: Se o robô travar, o Easypanel o reinicia automaticamente.
*   **Interface Moderna**: O componente do Lovable já vem com Tailwind CSS e ícones (Lucide React) para um visual profissional.
*   **Híbrido**: Ele tenta resolver sozinho (OCR/2Captcha) e só abre o pop-up no Lovable se realmente precisar de você.

---
**Sucesso com o seu sistema de scraping!** Se precisar de ajustes finos na extração de campos específicos, é só me chamar.
