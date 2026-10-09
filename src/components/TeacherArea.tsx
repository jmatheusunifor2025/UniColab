import React, { useState } from 'react';
import { Question } from '../types';
import { PlusCircle, Info, BookOpen, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface TeacherAreaProps {
  onAddQuestion: (newQuestionData: any) => Promise<void>;
  existingQuestions: Question[];
}

export default function TeacherArea({ onAddQuestion, existingQuestions }: TeacherAreaProps) {
  // Form State
  const [text, setText] = useState('');
  const [type, setType] = useState<'geral' | 'especifico'>('especifico');
  const [area, setArea] = useState('Padrões de Projeto & Engenharia de Software');
  const [year, setYear] = useState('2024');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil'>('medio');
  const [altA, setAltA] = useState('');
  const [altB, setAltB] = useState('');
  const [altC, setAltC] = useState('');
  const [altD, setAltD] = useState('');
  const [altE, setAltE] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [commentary, setCommentary] = useState('');
  const [references, setReferences] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validation
    if (!text.trim() || !altA.trim() || !altB.trim() || !altC.trim() || !altD.trim() || !altE.trim()) {
      setStatusMessage({ type: 'error', text: 'Por favor, preencha o enunciado e todas as 5 alternativas (A, B, C, D e E).' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        text,
        type,
        area,
        year: parseInt(year) || 2024,
        difficulty,
        alternatives: [altA, altB, altC, altD, altE],
        correctAlternative: correctIdx,
        commentary,
        references
      };

      await onAddQuestion(payload);

      setStatusMessage({ type: 'success', text: 'Questão cadastrada com sucesso! Ela já está disponível no banco geral e simulados.' });
      
      // Reset parts of the form
      setText('');
      setAltA('');
      setAltB('');
      setAltC('');
      setAltD('');
      setAltE('');
      setCommentary('');
      setReferences('');
      setCorrectIdx(0);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Houve um erro ao cadastrar a questão.' });
    } finally {
      setSubmitting(false);
    }
  };

  // We show a list of custom registered questions for the teacher as confirmation/review log
  const professorAddedQuestions = existingQuestions.filter(q => q.id.startsWith('custom-'));

  const commonAreas = [
    'Padrões de Projeto & Engenharia de Software',
    'Arquitetura de Sistemas Distributed',
    'Responsabilidade Social & ESG',
    'Tecnologia & Ética na Sociedade',
    'Algoritmos & Estruturas de Dados',
    'Engenharia de Bancos de Dados Relacionais',
    'Inteligência Artificial & Ciência de Dados',
    'Infraestrutura & Redes de Computadores'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar explanation for Professors (4 cols desktop) */}
      <div className="lg:col-span-4 space-y-6 self-start">
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md border border-indigo-950 space-y-5">
          <div className="space-y-1">
            <h3 className="text-xl font-bold">Portal do Docente</h3>
            <p className="text-xs text-indigo-200">Painel de Curadoria Pedagógica UNIFOR para o ENADE</p>
          </div>

          <p className="text-xs text-indigo-100/90 leading-relaxed">
            Professores, coordenadores e auxiliares pedagógicos (como a Prof.ª Juliana Marinho e o Prof. Gerhard Philippe de Saboia) utilizam esta central de inserção ativa para nutrir a plataforma UniColab.
          </p>

          <div className="space-y-3.5 pt-1 text-xs">
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-emerald-500 font-extrabold text-[10px] shrink-0 text-slate-950 flex items-center justify-center">1</span>
              <div>
                <strong className="block text-emerald-400 font-bold">Estilo de Enunciado Completo:</strong>
                <span className="text-indigo-200 text-[11px]">As questões do ENADE são contextualizadas, com enunciados profundos e fundamentados.</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-emerald-500 font-extrabold text-[10px] shrink-0 text-slate-950 flex items-center justify-center">2</span>
              <div>
                <strong className="block text-emerald-400 font-bold">Gabarito Consolidado:</strong>
                <span className="text-indigo-200 text-[11px]">Sempre ofereça uma explicação pormenorizada (Gabarito Comentado Oficial) e referências bibliográficas do tema.</span>
              </div>
            </div>
          </div>
        </div>

        {/* List of custom questions added by professor */}
        <div id="authoritative-registry" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Questões Cadastradas Pela UNIFOR</h4>
          
          {professorAddedQuestions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhuma questão inserida nesta sessão pelo docente.</p>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {professorAddedQuestions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-500">#{idx + 1} • Ano {q.year}</span>
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[9px]">{q.difficulty}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold truncate">{q.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Form container (8 cols desktop) */}
      <div id="add-question-form" className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
          <PlusCircle className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">Cadastrar Nova Questão ENADE</h3>
            <p className="text-xs text-slate-400">Insira a questão em formato "abcd" conforme padrões recentes do INEP</p>
          </div>
        </div>

        {statusMessage && (
          <div className={`p-4 rounded-xl flex items-start gap-3 text-xs font-semibold ${
            statusMessage.type === 'success' ? 'bg-emerald-50 border border-emerald-100 text-emerald-950' : 'bg-rose-50 border border-rose-100 text-rose-950'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.2" />
            )}
            <p>{statusMessage.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Question Core Settings */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Componente</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="especifico font-semibold">Componente Específico</option>
                <option value="geral font-semibold">Formação Geral</option>
              </select>
            </div>

            {/* Area */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Área Temática / Disciplina</label>
              <select
                value={area}
                onChange={(e: any) => setArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {commonAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ano do ENADE</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nível de Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Médio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>
          </div>

          {/* Enunciado text */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enunciado Principal / Contexto da Questão</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite o enunciado completo da questão. Exponha dados ou tabelas se julgar necessário para reflexão do estudante."
              rows={4}
              required
              className="w-full border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alternatives label */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternativas de Resposta</h4>
            
            {/* A */}
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-1">A</span>
              <input
                type="text"
                value={altA}
                onChange={(e) => setAltA(e.target.value)}
                placeholder="Conteúdo descritivo da alternativa A..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* B */}
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-1">B</span>
              <input
                type="text"
                value={altB}
                onChange={(e) => setAltB(e.target.value)}
                placeholder="Conteúdo descritivo da alternativa B..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* C */}
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-1">C</span>
              <input
                type="text"
                value={altC}
                onChange={(e) => setAltC(e.target.value)}
                placeholder="Conteúdo descritivo da alternativa C..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* D */}
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-1">D</span>
              <input
                type="text"
                value={altD}
                onChange={(e) => setAltD(e.target.value)}
                placeholder="Conteúdo descritivo da alternativa D..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* E */}
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0 mt-1">E</span>
              <input
                type="text"
                value={altE}
                onChange={(e) => setAltE(e.target.value)}
                placeholder="Conteúdo descritivo da alternativa E..."
                required
                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Correct Selection */}
          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Gabarito Verdadeiro (Alternativa Correta)</label>
            <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl max-w-sm">
              {['A', 'B', 'C', 'D', 'E'].map((letter, idx) => (
                <button
                  key={letter}
                  type="button"
                  onClick={() => setCorrectIdx(idx)}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    correctIdx === idx 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Professional commentary and citation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Justificativa Acadêmica (Gabarito Comentado)</label>
              <textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Explicação didática detalhando por que o gabarito selecionado está correto em relação às alternativas incorretas."
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Referência Bibliográfica / Fonte de Pesquisa</label>
              <textarea
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="Exemplo: Silberschatz, A. Sistemas Operacionais com Java. Editora Campus. 2021."
                rows={3}
                className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
            >
              {submitting ? 'Cadastrando...' : 'Cadastrar na Plataforma'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
