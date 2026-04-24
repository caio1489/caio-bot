import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// --- CONFIGURAÇÃO ---
// Substitua pela URL do seu serviço no Easypanel (ex: https://meu-bot.meu-dominio.com)
const API_URL = "http://localhost:8000"; 

export const TRT2Scraper = () => {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processoData, setProcessoData] = useState<any>(null);
  const [captchaChallenge, setCaptchaChallenge] = useState<{challenge_id: string, imagem_captcha_base64: string} | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');

  const handleConsultar = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setProcessoData(null);
    setCaptchaChallenge(null);

    try {
      const response = await fetch(`${API_URL}/consultar_processo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_processo: numeroProcesso }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Erro na consulta');

      if (data.status === 'captcha_required') {
        setCaptchaChallenge(data);
      } else {
        setProcessoData(data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolverCaptcha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/resolver_captcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          challenge_id: captchaChallenge?.challenge_id, 
          resposta: captchaInput 
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Captcha incorreto');

      setProcessoData(data);
      setCaptchaChallenge(null);
      setCaptchaInput('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Consulta TRT2 em Massa
        </h2>
        
        <form onSubmit={handleConsultar} className="flex gap-3">
          <input
            type="text"
            placeholder="0000000-00.0000.5.02.0000"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={numeroProcesso}
            onChange={(e) => setNumeroProcesso(e.target.value)}
          />
          <button 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Consultar'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </div>

      {/* Pop-up de Captcha */}
      {captchaChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Intervenção Necessária</h3>
            <p className="text-slate-600 mb-6 text-sm">O sistema do TRT2 solicita validação humana.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 flex justify-center">
              <img 
                src={`data:image/png;base64,${captchaChallenge.imagem_captcha_base64}`} 
                alt="Captcha" 
                className="h-16 rounded shadow-sm"
              />
            </div>

            <form onSubmit={handleResolverCaptcha} className="space-y-4">
              <input
                autoFocus
                type="text"
                placeholder="Digite os caracteres"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setCaptchaChallenge(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Validar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resultado */}
      {processoData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Dados do Processo</h3>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Sincronizado
            </span>
          </div>
          <div className="p-6">
            <pre className="text-xs bg-slate-900 text-blue-400 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(processoData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
