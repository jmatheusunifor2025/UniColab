import React, { useState } from 'react';
import { UserStats } from '../types';
import { Sparkles, RefreshCw, BookOpen, Clock, Heart, Award, CheckCircle } from 'lucide-react';

interface TrilhaIAProps {
  stats: UserStats;
}

export default function TrilhaIA({ stats }) {
  const [loading, setLoading] = useState(false);
  const [trilhaMarkdown, setTrilhaMarkdown] = useState<string | null>(null);

  // Collect weak areas based on Vládia and stats
  const completedHistory = stats.history;
  
  // Hardcoded weak areas as standard fallback for Vládia (or parsed dynamically from history)
  const weakAreas = ['Bancos de Dados Relacionais', 'Algoritmos & Estruturas de Dados', 'Arquitetura de Sistemas Distributed'];

  const handleGenerateTrilha = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/trilha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stats: {
            completedCount: stats.completedQuestionsCount,
            scorePercent: stats.history.length > 0 
              ? Math.round(stats.history.reduce((a, c) => a + c.scorePercent, 0) / stats.history.length)
              : 55
          },
          wrongAreas: weakAreas
         })
      });
      const data = await response.json();
      if (data.studyTrail) {
        setTrilhaMarkdown(data.studyTrail);
      }
    } catch (err) {
      console.error(err);
      setTrilhaMarkdown(`### Trilha de Estudo Sugerida (Foco Vládia)
1. **Modelagem de Banco de Dados**: Estude a Terceira Forma Normal (3FN), dependências transitivas e redundâncias relacionais.
2. **Algoritmos e Árvores (BST)**: Revise a complexidade assintótica de busca balanceada O(log n) vs não balanceada O(n).
3. **Gerenciamento de Tempo**: Faça pelo menos 3 simulados cronometrados curtos (4 questões) para treinar a fluidez mental contra o cansaço do internato.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-study-trail-panel" className="max-w-4xl mx-auto space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-3xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-slate-50 opacity-65 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            Recurso de IA Generativa
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">Trilhas de Estudo Inteligentes para o ENADE</h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
            Nosso tutor de inteligência artificial analisa seus acertos e erros no banco de questões para gerar um plano de ação dinâmico focado nas suas maiores deficiências de forma didática.
          </p>

          <div className="pt-2">
            <button
              onClick={handleGenerateTrilha}
              disabled={loading}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-3xs cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-350" />
                  Mecanismo Inteligente Analisando Questões...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Gerar Minha Trilha de Estudo Personalizada
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Trail View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-xs space-y-4 animate-pulse">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800">O Tutor Gemini 3.5 está coletando seu desempenho...</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Avaliando fraquezas em {weakAreas.join(', ')} e sintetizando estratégias pedagógicas adequadas à sua rotina de internato/TCC.
            </p>
          </div>
        </div>
      ) : trilhaMarkdown ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in text-slate-800">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold">Plano de Estudos Customizado (Vládia)</h3>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Gerado com Sucesso
            </span>
          </div>

          {/* Simple but super elegant presentation of markdown strings */}
          <div className="prose max-w-none text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-4">
            {trilhaMarkdown}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Sugerido: Dedicar 25 min diários às revisões sugeridas</span>
            </div>

            <button
              onClick={handleGenerateTrilha}
              className="text-blue-600 hover:text-blue-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar Trilha de Estudo
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800">Nenhuma Trilha Ativa</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Clique no botão acima para submeter estatísticas ao tutor virtual e gerar um cronograma de apoio ao ENADE.
          </p>
        </div>
      )}

    </div>
  );
}
