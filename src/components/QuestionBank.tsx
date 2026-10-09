import React, { useState } from 'react';
import { Question } from '../types';
import { Search, Filter, BookOpen, Clock, AlertTriangle, Play, ChevronRight, GraduationCap } from 'lucide-react';

interface QuestionBankProps {
  questions: Question[];
  onStartSimulation: (config: { size: number; limitMinutes: number }) => void;
  onExploreSingleQuestion: (question: Question) => void;
}

export default function QuestionBank({ questions, onStartSimulation, onExploreSingleQuestion }: QuestionBankProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'geral' | 'especifico'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'facil' | 'medio' | 'dificil'>('all');
  const [yearFilter, setYearFilter] = useState<'all' | '2023' | '2022' | '2021'>('all');

  // Interactive config state for simulation
  const [simSize, setSimSize] = useState<number>(4);
  const [simTime, setSimTime] = useState<number>(10); // in minutes

  // Filter logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || q.type === typeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesYear = yearFilter === 'all' || q.year.toString() === yearFilter;

    return matchesSearch && matchesType && matchesDifficulty && matchesYear;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Simulation Constructor (4 columns desktop) */}
      <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-3xs self-start space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Simulados Inteligentes
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Customizar Simulado</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Monte uma rodada cronometrada com questões variadas de Formação Geral e Componentes Específicos do ENADE.
          </p>
        </div>

        {/* Form elements for config */}
        <div className="space-y-4 pt-2">
          {/* Question count */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Número de Questões</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 12].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSimSize(size)}
                  className={`py-1.5 text-center rounded-lg border text-xs font-bold transition-all ${
                    simSize === size 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {size} Q
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Tempo Máximo</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, 20].map(minutes => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => setSimTime(minutes)}
                  className={`py-1.5 text-center rounded-lg border text-xs font-bold transition-all ${
                    simTime === minutes 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {minutes} m
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Recomendação: aproximadamente 2.5 minutos por questão ENADE.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStartSimulation({ size: simSize, limitMinutes: simTime })}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer text-xs uppercase tracking-wider"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Iniciar Simulado Cronometrado
        </button>

        {/* Warning card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2.5 text-slate-600 text-xs font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Fidelidade ENADE:</strong> O cronômetro regressivo simula a pressão do dia de prova. Mantenha o foco!
          </p>
        </div>
      </div>

      {/* Database explorer (8 columns desktop) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Search and Filters panel */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Direct text search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar questões por palavra-chave ou competência..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>

            {/* Quick Component selector */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  typeFilter === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('geral')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  typeFilter === 'geral' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Geral
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('especifico')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  typeFilter === 'especifico' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                Específico
              </button>
            </div>
            
          </div>

          {/* Secondary filter selectors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            {/* Difficulty Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dificuldade</label>
              <select
                value={difficultyFilter}
                onChange={(e: any) => setDifficultyFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 py-1.5 px-2 rounded-lg text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">Ver Todas</option>
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>

            {/* Year Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ano do Exame</label>
              <select
                value={yearFilter}
                onChange={(e: any) => setYearFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 py-1.5 px-2 rounded-lg text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">Ver Todos</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
              </select>
            </div>
          </div>
        </div>

        {/* Database List rendering */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-slate-500">
              {filteredQuestions.length === 0 ? 'Nenhuma' : filteredQuestions.length} {filteredQuestions.length === 1 ? 'questão' : 'questões'} com esses filtros
            </span>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const difficultyColors = {
                facil: 'bg-emerald-50/70 text-emerald-700 border-emerald-100/60',
                medio: 'bg-blue-50/70 text-blue-700 border-blue-100/60',
                dificil: 'bg-rose-50/70 text-rose-700 border-rose-100/60'
              };

              return (
                <div
                  key={q.id}
                  className="bg-white hover:border-slate-350 border border-slate-200/70 rounded-2xl p-5 shadow-3xs transition-all hover:shadow-2xs space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                        q.type === 'geral' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100/60' : 'bg-indigo-50 text-indigo-700 border border-indigo-100/60'
                      }`}>
                        {q.type === 'geral' ? 'Formação Geral' : 'Componente Específico'}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase border ${difficultyColors[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        ENADE {q.year}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      {q.area}
                    </span>
                  </div>

                  {/* Question body excerpt */}
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-slate-800 font-semibold leading-relaxed line-clamp-3">
                      {q.text}
                    </p>
                  </div>

                  {/* Comments count indicator & CTA button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {q.comments.length} {q.comments.length === 1 ? 'comentário acadêmico' : 'comentários acadêmicos'}
                    </span>

                    <button
                      type="button"
                      onClick={() => onExploreSingleQuestion(q)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200/80 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs"
                    >
                      Exercitar e Ver Gabarito Correto
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl py-12 text-center text-slate-400">
                Nenhuma questão corresponde à sua busca. Tente mudar os filtros de área ou dificuldade!
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
