import React from 'react';
import { UserStats, Badge } from '../types';
import { Trophy, Award, Flame, BookOpen, Clock, AlertTriangle, Play, CheckCircle } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  onNavigateToSimulado: () => void;
  onSelectTrilha: () => void;
}

export default function Dashboard({ stats, onNavigateToSimulado, onSelectTrilha }: DashboardProps) {
  // Let's calculate average score
  const totalSimulados = stats.history.length;
  const avgScore = totalSimulados > 0 
    ? Math.round(stats.history.reduce((acc, curr) => acc + curr.scorePercent, 0) / totalSimulados)
    : 0;

  // Hardcoded competencies for beautiful progress visualization (using pure Tailwind SVGs!)
  const competencies = [
    { name: 'Padrões de Projeto & ES', score: 85, color: '#2563eb' },
    { name: 'Arquitetura de Sistemas', score: 60, color: '#3b82f6' },
    { name: 'Responsabilidade Social & ESG', score: 100, color: '#10b981' },
    { name: 'Tecnologia & Ética', score: 90, color: '#059669' },
    { name: 'Algoritmos & ED', score: 70, color: '#f59e0b' },
    { name: 'Bancos de Dados Relacionais', score: 40, color: '#ef4444' },
  ];

  // We find competencies with low scores (<70%) to recommend focus
  const lowCompetencies = competencies.filter(c => c.score < 75).map(c => c.name);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div id="dashboard-hero" className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-slate-50 opacity-50 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
              Perfil ENADE Ativo
            </div>
            <h1 id="user-greeting" className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Bem-vinda, Vládia
            </h1>
            <p className="text-slate-500 text-xs md:text-sm max-w-xl leading-relaxed font-medium">
              Estudante de Engenharia de Computação • UNIFOR.
              Seu progresso inteligente e discussões com o corpo docente estão calibrados para o sucesso no ENADE.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              id="start-quick-sim"
              onClick={onNavigateToSimulado}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm text-xs uppercase tracking-wider cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Iniciar Simulado
            </button>
            <button
              id="view-trilha-btn"
              onClick={onSelectTrilha}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold rounded-xl transition-all border border-slate-200/80 text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver Minha Trilha IA
            </button>
          </div>
        </div>

        {/* Rapid summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="text-center sm:text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pontuação Geral</p>
            <p className="text-xl font-extrabold flex items-center justify-center sm:justify-start gap-1 text-slate-900 mt-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              {stats.points} <span className="text-[10px] font-bold text-slate-450">XP</span>
            </p>
          </div>
          <div className="text-center sm:text-left border-l border-slate-100 sm:pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Questões Respondidas</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {stats.completedQuestionsCount} <span className="text-[10px] font-normal text-slate-400">praticadas</span>
            </p>
          </div>
          <div className="text-center sm:text-left border-l border-slate-100 sm:pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Média de Acertos</p>
            <p className="text-xl font-extrabold text-[#10b981] mt-1">
              {avgScore}% <span className="text-[10px] font-normal text-slate-400">geral</span>
            </p>
          </div>
          <div className="text-center sm:text-left border-l border-slate-100 sm:pl-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Duração de Foco</p>
            <p className="text-xl font-extrabold text-sky-600 mt-1">
              {totalSimulados * 15} <span className="text-[10px] font-normal text-slate-400">min</span>
            </p>
          </div>
        </div>
      </div>

      {/* Focus Area Advisory Recommendation */}
      {lowCompetencies.length > 0 && (
        <div id="advisor-banner" className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-amber-50/50 border border-amber-250/50 rounded-xl text-slate-700 shadow-3xs animate-fade-in">
          <div className="p-2 bg-amber-100/60 text-amber-600 rounded-lg shrink-0">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs md:text-sm">Recomendação de Mentoria Inteligente (Painel da Vládia)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Você está mandando muito bem em <span className="font-bold text-[#10b981]">Responsabilidade Social (100%)</span> e <span className="font-bold text-[#10b981]">Tecnologia (90%)</span>, mas identificamos margem para otimização em:
              <span className="font-bold text-slate-800"> {lowCompetencies.join(' e ')}</span>. Revise esses temas usando os filtros e clique no menu **Trilha Inteligente** para gerar um cronograma de estudos sob medida por IA!
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Performance Charts & Gamification Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Competency Map (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-150/80 shadow-3xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                Desempenho por Competência
              </h3>
              <p className="text-xs text-slate-500">Mapeamento de proficiência atual por área temática do ENADE</p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100/40 px-2.5 py-1 rounded-full">
              6 Temas Monitorados
            </span>
          </div>

          {/* Elegant Custom SVGs & Tailwind Bars to represent data without layout failure */}
          <div className="space-y-4">
            {competencies.map((comp) => (
              <div key={comp.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="truncate max-w-[240px] md:max-w-none">{comp.name}</span>
                  <span className={comp.score >= 80 ? 'text-emerald-600 font-bold' : comp.score >= 60 ? 'text-blue-600 font-bold' : 'text-rose-600 font-bold'}>
                    {comp.score}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${comp.score}%`, 
                      backgroundColor: comp.score >= 80 ? '#10b981' : comp.score >= 60 ? '#3b82f6' : '#f43f5e'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between gap-4 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500 font-medium">Excelente (&ge; 80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-slate-500 font-medium">Intermediário (60% - 79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-slate-500 font-medium">Atenção Crítica (&lt; 60%)</span>
            </div>
          </div>
        </div>

        {/* Gamification Badges (4 Columns) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-150/80 shadow-3xs space-y-6">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-400" />
              Conquistas
            </h3>
            <p className="text-xs text-slate-500">Medalhas decorrentes da plataforma</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.badges.map((badge) => {
              const isUnlocked = !!badge.unlockedAt;
              return (
                <div 
                  key={badge.id} 
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    isUnlocked 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 shadow-3xs' 
                      : 'bg-slate-50/20 border-slate-100 text-slate-400 opacity-50'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-1.5 ${
                    isUnlocked ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-300'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-bold leading-tight truncate w-full">{badge.title}</h4>
                  <p className="text-[9px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-2xl p-6 border border-slate-150/80 shadow-3xs space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Histórico de Simulados
        </h3>
        {totalSimulados === 0 ? (
          <div className="text-center py-8 text-slate-400">
            Nenhum simulado registrado no momento. Comece um para ver seu progresso!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Aproveitamento</th>
                  <th className="py-2.5 px-3">Desempenho</th>
                  <th className="py-2.5 px-3">Análise de Tempo</th>
                  <th className="py-2.5 px-3 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.history.map((hist) => (
                  <tr key={hist.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{hist.date}</td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {hist.correctAnswers} de {hist.totalQuestions} questões
                    </td>
                    <td className="py-2.5 px-3">
                      {/* Interactive bar log */}
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#10b981] rounded-full" 
                            style={{ width: `${hist.scorePercent}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">{hist.scorePercent}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {Math.floor(hist.durationSeconds / 60)}m {hist.durationSeconds % 60}s
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        hist.scorePercent >= 70 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/60' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100/60'
                      }`}>
                        {hist.scorePercent >= 70 ? 'Aprovado' : 'Revisar Foco'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
