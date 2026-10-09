import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Clock, AlertTriangle, CheckCircle, XCircle, ChevronLeft, ChevronRight, HelpCircle, Sparkles, RefreshCw } from 'lucide-react';

interface SimulationProps {
  questions: Question[];
  limitMinutes: number;
  onFinishSimulation: (stats: { correct: number; total: number; durationSeconds: number; areasStats: { [area: string]: { total: number; correct: number } } }) => void;
  onCancel: () => void;
}

export default function Simulation({ questions, limitMinutes, onFinishSimulation, onCancel }: SimulationProps) {
  // Set of questions selected for this iteration
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(limitMinutes * 60);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // States for Gemini explanations
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<{ [qId: string]: string }>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    if (isSubmitted || isTimeUp) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          handleSubmit(true); // Auto-submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, isTimeUp]);

  const handleSelectAnswer = (qId: string, answerIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: answerIdx
    }));
  };

  const handleSubmit = (auto = false) => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    if (auto) {
      setIsTimeUp(true);
    }
  };

  const handleCompleteAndReport = () => {
    // Generate areas stats
    const areasStats: { [area: string]: { total: number; correct: number } } = {};
    let correctCount = 0;

    questions.forEach(q => {
      const isCorrect = selectedAnswers[q.id] === q.correctAlternative;
      if (isCorrect) correctCount++;

      if (!areasStats[q.area]) {
        areasStats[q.area] = { total: 0, correct: 0 };
      }
      areasStats[q.area].total += 1;
      if (isCorrect) {
        areasStats[q.area].correct += 1;
      }
    });

    const durationSeconds = (limitMinutes * 60) - timeLeft;

    onFinishSimulation({
      correct: correctCount,
      total: questions.length,
      durationSeconds: durationSeconds > 0 ? durationSeconds : 1,
      areasStats
    });
  };

  // Get explanation from Gemini for a missed question
  const fetchAiExplanation = async (question: Question, chosenIdx: number) => {
    setLoadingAi(question.id);
    try {
      const response = await fetch('/api/gemini/explicar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.text,
          alternatives: question.alternatives,
          correctIdx: question.correctAlternative,
          chosenIdx
        })
      });
      const data = await response.json();
      if (data.explanation) {
        setAiExplanations(prev => ({
          ...prev,
          [question.id]: data.explanation
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="space-y-6">
      
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors mr-1 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-extrabold text-slate-900">Simulado Cronometrado ENADE</h2>
          </div>
          <p className="text-xs text-slate-400 pl-8 font-medium">
            Progresso: {answeredCount} de {totalQuestions} questões respondidas
          </p>
        </div>

        {/* Chronometer */}
        <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto">
          <div className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-mono text-sm font-bold transition-all ${
            timeLeft < 60 
              ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Clock className="w-4 h-4 shrink-0 text-slate-500" />
            {formatTime(timeLeft)}
          </div>

          {!isSubmitted ? (
            <button
              onClick={() => handleSubmit(false)}
              className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-3xs cursor-pointer"
            >
              Finalizar Respostas
            </button>
          ) : (
            <button
              onClick={handleCompleteAndReport}
              className="flex-1 md:flex-none px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-3xs cursor-pointer"
            >
              Enviar e Ver Resultados
            </button>
          )}
        </div>
      </div>

      {isTimeUp && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Tempo Esgotado!</h4>
            <p className="text-xs mt-0.5">O simulado foi encerrado automaticamente. Você pode revisar as questões respondidas ou ver sua pontuação.</p>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation / Selection Panel (3 Cols) */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs self-start space-y-4">
          <h3 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Mapa do Simulado</h3>
          
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isCurrent = idx === currentIdx;
              
              let btnClass = 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50';
              if (isCurrent) {
                btnClass = 'border-slate-900 bg-slate-900 text-white font-bold shadow-3xs';
              } else if (isSubmitted) {
                const wasCorrect = selectedAnswers[q.id] === q.correctAlternative;
                btnClass = wasCorrect 
                  ? 'border-emerald-250 bg-emerald-50 text-emerald-800 font-bold' 
                  : 'border-rose-250 bg-rose-50 text-rose-800 font-bold';
              } else if (isAnswered) {
                btnClass = 'border-slate-300 bg-slate-50 text-slate-800 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`py-2 text-center rounded-lg border text-xs transition-all cursor-pointer ${btnClass}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-white border border-slate-200"></span>
              <span>Não respondido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-300"></span>
              <span>Respondido</span>
            </div>
            {isSubmitted && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#10b981]"></span>
                  <span className="text-emerald-700 font-bold">Resposta Correta</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                  <span className="text-rose-700 font-bold">Resposta Incorreta</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Question Panel (9 Cols) */}
        <div className="lg:col-span-9 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/80 shadow-3xs space-y-6">
          
          {/* Metadata */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="font-bold text-slate-400">Questão {currentIdx + 1} de {totalQuestions}</span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100/60 rounded-md font-extrabold uppercase tracking-wider text-[9px]">
              {currentQuestion.type === 'geral' ? 'Formação Geral' : 'Componente Específico'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{currentQuestion.area}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-400 font-bold">Ano {currentQuestion.year}</span>
          </div>

          {/* Enunciado */}
          <div className="space-y-4">
            <p className="text-slate-800 text-xs md:text-sm font-semibold leading-relaxed whitespace-pre-line">
              {currentQuestion.text}
            </p>
          </div>

          {/* Alternatives select */}
          <div className="space-y-3 pt-2">
            {currentQuestion.alternatives.map((alt, idx) => {
              const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
              const isSelected = selectedAnswers[currentQuestion.id] === idx;
              const isCorrectAlternative = currentQuestion.correctAlternative === idx;
              
              let altClass = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700';
              let badgeColor = 'bg-slate-100 border border-slate-200 text-slate-600';

              if (isSelected) {
                altClass = 'bg-slate-900 border-slate-950 text-white shadow-3xs font-semibold';
                badgeColor = 'bg-white text-slate-900 font-bold';
              }

              // Adjust styling when simulation has been submitted
              if (isSubmitted) {
                if (isCorrectAlternative) {
                  altClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold ring-2 ring-emerald-100/40';
                  badgeColor = 'bg-[#10b981] text-white';
                } else if (isSelected) {
                  altClass = 'bg-rose-50 border-rose-300 text-rose-950 ring-2 ring-rose-100/40 font-bold';
                  badgeColor = 'bg-rose-500 text-white';
                } else {
                  altClass = 'bg-slate-50 opacity-40 border-slate-150 text-slate-400';
                  badgeColor = 'bg-slate-100 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQuestion.id, idx)}
                  disabled={isSubmitted}
                  className={`w-full text-left p-4 rounded-xl border flex items-start gap-4 transition-all duration-150 ${altClass} ${!isSubmitted ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center ${badgeColor}`}>
                    {letter}
                  </span>
                  <span className="text-xs md:text-sm leading-relaxed">{alt}</span>
                </button>
              );
            })}
          </div>

          {/* Submitted feedback, comment, and Gemini assistant triggers */}
          {isSubmitted && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
              
              {/* Correction Verdict Header */}
              <div className="flex items-start gap-3">
                {selectedAnswers[currentQuestion.id] === currentQuestion.correctAlternative ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    Parabéns, você acertou a questão!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 bg-rose-50 border border-rose-100 p-4 rounded-xl w-full">
                    <div className="flex items-center gap-2 text-rose-900 text-sm font-bold">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      Que pena, resposta incorreta!
                    </div>
                    {selectedAnswers[currentQuestion.id] !== undefined && (
                      <p className="text-xs text-rose-800">
                        Você escolheu a alternativa <strong>{String.fromCharCode(65 + selectedAnswers[currentQuestion.id])}</strong>, mas a alternativa correta é a <strong>{String.fromCharCode(65 + currentQuestion.correctAlternative)}</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expert Static Commentary (The must-have described in the slides!) */}
              <div className="bg-blue-50/40 border border-blue-100/50 rounded-xl p-5 space-y-2">
                <h4 className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Gabarito Comentado (Oficial)
                </h4>
                <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                  {currentQuestion.commentary}
                </p>
                {currentQuestion.references && (
                  <div className="pt-2 text-[11px] text-slate-500 font-medium">
                    <span className="font-bold text-slate-700">Referência Bibliográfica:</span> {currentQuestion.references}
                  </div>
                )}
              </div>

              {/* Interactive IA Explanation (The innovative part: Gemini reviews the wrong answer choice!) */}
              {selectedAnswers[currentQuestion.id] !== undefined && selectedAnswers[currentQuestion.id] !== currentQuestion.correctAlternative && (
                <div className="bg-indigo-950 text-indigo-50 border border-indigo-800 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                      Análise de Erro Customizada por IA
                    </h5>

                    {!aiExplanations[currentQuestion.id] && (
                      <button
                        onClick={() => fetchAiExplanation(currentQuestion, selectedAnswers[currentQuestion.id])}
                        disabled={loadingAi === currentQuestion.id}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-[10px] uppercase tracking-wide border border-white/10 flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {loadingAi === currentQuestion.id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Analisando...
                          </>
                        ) : (
                          <>
                            Explicar Meu Erro
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {aiExplanations[currentQuestion.id] ? (
                    <div className="text-xs leading-relaxed space-y-2 text-indigo-100/95 font-medium whitespace-pre-line">
                      {aiExplanations[currentQuestion.id]}
                    </div>
                  ) : (
                    loadingAi !== currentQuestion.id && (
                      <p className="text-[11px] text-indigo-200/80">
                        Clique em <strong>Explicar Meu Erro</strong> para ter uma justificativa didática em tempo-real explicando o raciocínio sutil que levou à sua escolha equivocada.
                      </p>
                    )
                  )}
                </div>
              )}

            </div>
          )}

          {/* Card footer pagination navigation buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-xs font-bold text-slate-400">
              Questão {currentIdx + 1} de {totalQuestions}
            </span>

            <button
              onClick={() => setCurrentIdx(prev => Math.min(totalQuestions - 1, prev + 1))}
              disabled={currentIdx === totalQuestions - 1}
              className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
