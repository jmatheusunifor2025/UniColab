import React, { useState } from 'react';
import { Question, QuestionComment } from '../types';
import { MessageSquare, Calendar, User, Heart, Send, Sparkles, RefreshCw, GraduationCap } from 'lucide-react';

interface ForumProps {
  questions: Question[];
  activeQuestion?: Question;
  onAddComment: (qId: string, author: string, role: 'student' | 'teacher', commentText: string, askAi: boolean) => Promise<void>;
}

export default function Forum({ questions, activeQuestion, onAddComment }: ForumProps) {
  // We can let the user pick a question on the forum screen or focus on a pre-selected one
  const [selectedQId, setSelectedQId] = useState<string>(activeQuestion?.id || questions[0]?.id || '');
  const [authorName, setAuthorName] = useState<string>('Vládia'); // Persona defaults to Vládia
  const [authorRole, setAuthorRole] = useState<'student' | 'teacher'>('student');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [askAi, setAskAi] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const selectedQuestion = questions.find(q => q.id === selectedQId);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedQId) return;

    setSubmitting(true);
    try {
      await onAddComment(selectedQId, authorName, authorRole, newCommentText, askAi);
      setNewCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="forum-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Question Directory (4 cols desktop) */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4 self-start">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Fórum de Dúvidas</h3>
        <p className="text-xs text-slate-500 font-medium">Selecione uma questão do banco para examinar debates pedagógicos ou submeter dúvidas ao Professor de IA.</p>
        
        <div className="space-y-3 pt-2 max-h-[450px] overflow-y-auto pr-1">
          {questions.map((q) => {
            const isSelected = q.id === selectedQId;
            return (
              <button
                key={q.id}
                onClick={() => setSelectedQId(q.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-950 text-white shadow-3xs' 
                    : 'bg-slate-50 hover:bg-slate-100/60 border-slate-200/60 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-150 text-slate-700'
                  }`}>
                    {q.area}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {q.comments.length} rps
                  </span>
                </div>
                <p className={`text-xs font-semibold leading-relaxed line-clamp-2 ${isSelected ? 'text-slate-100' : 'text-slate-700'}`}>
                  {q.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discussion Thread (8 cols desktop) */}
      <div className="lg:col-span-8 space-y-6">
        {selectedQuestion ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-3xs space-y-6">
            
            {/* Thread Header */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex flex-wrap gap-2 items-center text-[10px]">
                <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {selectedQuestion.type === 'geral' ? 'Formação Geral' : 'Componente Específico'}
                </span>
                <span className="text-slate-400 font-bold">ENADE {selectedQuestion.year}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-bold">{selectedQuestion.area}</span>
              </div>
              <p className="text-xs md:text-sm text-slate-800 font-semibold leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                {selectedQuestion.text}
              </p>
              <div className="text-xs text-emerald-700 font-bold bg-emerald-55/40 border border-emerald-100/60 p-3 rounded-lg">
                Gabarito Homologado: Alternativa {String.fromCharCode(65 + selectedQuestion.correctAlternative)}
              </div>
            </div>

            {/* Comments Stream */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                Debates Acadêmicos ({selectedQuestion.comments.length})
              </h4>

              {selectedQuestion.comments.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100/50 text-slate-450 space-y-2">
                  <p className="text-xs font-bold text-slate-500">Este espaço ainda está vazio.</p>
                  <p className="text-[10px]">Seja o primeiro a publicar um questionamento ou ativar a tutoria de IA!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedQuestion.comments.map((comm) => {
                    const isAi = comm.role === 'ai';
                    const isTeacher = comm.role === 'teacher';
                    
                    let avatarBg = 'bg-blue-100 text-blue-800';
                    let layoutBg = 'bg-slate-50/60 border-slate-100';

                    if (isAi) {
                      avatarBg = 'bg-indigo-600 text-indigo-50 animate-pulse';
                      layoutBg = 'bg-indigo-50/70 border-indigo-150 ring-1 ring-indigo-200/40 text-indigo-950 shadow-xs';
                    } else if (isTeacher) {
                      avatarBg = 'bg-emerald-600 text-white';
                      layoutBg = 'bg-emerald-50/50 border-emerald-100 text-emerald-950';
                    }

                    return (
                      <div 
                        key={comm.id} 
                        className={`p-4 rounded-2xl border flex gap-3.5 transition-all ${layoutBg}`}
                      >
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${avatarBg}`}>
                          {isAi ? <Sparkles className="w-4 h-4 fill-current" /> : comm.userName.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Text and context metadata */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap justify-between items-center gap-1.5">
                            <span className="text-xs font-bold flex items-center gap-1">
                              {comm.userName}
                              {isAi && (
                                <span className="text-[9px] font-extrabold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1">
                                  Tutor IA
                                </span>
                              )}
                              {isTeacher && (
                                <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider ml-1">
                                  Corpo Docente
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {comm.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                            {comm.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Post Comentário Form Box */}
            <form onSubmit={handlePostComment} className="pt-6 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submeter Novo Comentário</h4>
              
              {/* Persona Profile config line in the form (highly contextual) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome do Autor</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Atuação / Papel</label>
                  <select
                    value={authorRole}
                    onChange={(e: any) => setAuthorRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="student">Estudante de Graduação (Vládia)</option>
                    <option value="teacher">Professor (Corpo Docente UNIFOR)</option>
                  </select>
                </div>
              </div>

              {/* Text Area */}
              <div className="space-y-1">
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Seja cortês. Digite sua dúvida ou anotação para compartilhar com a comunidade..."
                  required
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs md:text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              {/* Toggle to activate Gemini response */}
              {authorRole === 'student' && (
                <div className="flex items-center justify-between p-3.5 bg-indigo-950 text-white rounded-xl border border-indigo-900 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold text-indigo-100">Ativar Mentoria de IA do Canal</h5>
                      <p className="text-[10px] text-indigo-300">
                        O Gemini responderá ao seu comentário na primeira pessoa em instantes tirando suas dúvidas.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={askAi}
                      onChange={(e) => setAskAi(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-indigo-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              )}

              {/* Submit triggers */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Publicar no Fórum
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        ) : (
          <div className="bg-white rounded-2xl py-12 text-center text-slate-400">
            Nenhuma questão disponível para debate nesta área.
          </div>
        )}
      </div>

    </div>
  );
}
