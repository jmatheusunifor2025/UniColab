import React, { useState, useEffect } from 'react';
import { Question, UserStats, Badge, SimulationHistoryItem } from './types';
import Dashboard from './components/Dashboard';
import QuestionBank from './components/QuestionBank';
import Simulation from './components/Simulation';
import Forum from './components/Forum';
import TeacherArea from './components/TeacherArea';
import TrilhaIA from './components/TrilhaIA';
import { 
  Trophy, 
  BookOpen, 
  MessageSquare, 
  PlusCircle, 
  Sparkles, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  HelpCircle,
  GraduationCap
} from 'lucide-react';

const INITIAL_BADGES: Badge[] = [
  {
    id: 'b1',
    title: 'Estudante Ativa',
    description: 'Submeteu sua primeira dúvida pedagógica no fórum de discussão.',
    icon: 'MessageSquare',
    unlockedAt: '19/05/2026'
  },
  {
    id: 'b2',
    title: 'Foco Inicial',
    description: 'Fez sua primeira decolagem em simulados rápidos cronometrados.',
    icon: 'Clock',
    unlockedAt: '19/05/2026'
  },
  {
    id: 'b3',
    title: 'Mestre do Banco',
    description: 'Resolva mais de 6 questões no banco de dados geral.',
    icon: 'Trophy'
  },
  {
    id: 'b4',
    title: 'Foco Blindado',
    description: 'Bata 100% de aproveitamento correto em simulados curtos.',
    icon: 'Award'
  }
];

const INITIAL_USER_STATS: UserStats = {
  points: 1250,
  completedQuestionsCount: 12,
  correctCount: 9,
  history: [
    {
      id: 'h-1',
      date: '18/05/2026',
      durationSeconds: 450,
      totalQuestions: 6,
      correctAnswers: 5,
      scorePercent: 83,
      areasStats: {
        'Padrões de Projeto & ES': { total: 2, correct: 2 },
        'Responsabilidade Social & ESG': { total: 2, correct: 2 },
        'Bancos de Dados Relacionais': { total: 2, correct: 1 }
      }
    },
    {
      id: 'h-2',
      date: '19/05/2026',
      durationSeconds: 320,
      totalQuestions: 4,
      correctAnswers: 3,
      scorePercent: 75,
      areasStats: {
        'Algoritmos & ED': { total: 2, correct: 2 },
        'Arquitetura de Sistemas Distributed': { total: 2, correct: 1 }
      }
    }
  ],
  badges: INITIAL_BADGES
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'banco' | 'forum' | 'professor' | 'trilha'>('dashboard');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('unicolab_user_stats');
    return saved ? JSON.parse(saved) : INITIAL_USER_STATS;
  });

  // Simulation states
  const [activeSimQuestions, setActiveSimQuestions] = useState<Question[] | null>(null);
  const [activeSimMinutes, setActiveSimMinutes] = useState<number>(10);
  const [activeForumQuestion, setActiveForumQuestion] = useState<Question | undefined>(undefined);

  // Responsive mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const resp = await fetch('/api/questoes');
      const data = await resp.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    }
  };

  // Persist stats state
  useEffect(() => {
    localStorage.setItem('unicolab_user_stats', JSON.stringify(stats));
  }, [stats]);

  // Action: Complete active simulation session
  const handleFinishSimulation = (result: { correct: number; total: number; durationSeconds: number; areasStats: { [area: string]: { total: number; correct: number } } }) => {
    const scorePct = Math.round((result.correct / result.total) * 100);
    const addedPoints = result.correct * 50 + (scorePct >= 70 ? 200 : 50);

    const newHistItem: SimulationHistoryItem = {
      id: `h-sim-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }),
      durationSeconds: result.durationSeconds,
      totalQuestions: result.total,
      correctAnswers: result.correct,
      scorePercent: scorePct,
      areasStats: result.areasStats
    };

    // Build new badges list
    let updatedBadges = [...stats.badges];
    
    // b3: Total questions completed badge trigger
    const newTotalCompleted = stats.completedQuestionsCount + result.total;
    if (newTotalCompleted >= 6 && !updatedBadges.find(b => b.id === 'b3')?.unlockedAt) {
      updatedBadges = updatedBadges.map(b => b.id === 'b3' ? { ...b, unlockedAt: new Date().toLocaleDateString('pt-BR') } : b);
    }

    // b4: perfect score badge trigger
    if (scorePct === 100 && !updatedBadges.find(b => b.id === 'b4')?.unlockedAt) {
      updatedBadges = updatedBadges.map(b => b.id === 'b4' ? { ...b, unlockedAt: new Date().toLocaleDateString('pt-BR') } : b);
    }

    setStats(prev => ({
      ...prev,
      points: prev.points + addedPoints,
      completedQuestionsCount: prev.completedQuestionsCount + result.total,
      correctCount: prev.correctCount + result.correct,
      history: [newHistItem, ...prev.history],
      badges: updatedBadges
    }));

    // Back to dashboard
    setActiveSimQuestions(null);
    setActiveTab('dashboard');
  };

  // Action: start custom simulation
  const handleStartSimulation = (config: { size: number; limitMinutes: number }) => {
    // Select questions
    // Simple random sampling helper
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(config.size, shuffled.length));
    
    setActiveSimMinutes(config.limitMinutes);
    setActiveSimQuestions(selected);
  };

  // Action: review single question in gabarito view mode
  const handleExploreSingleQuestion = (question: Question) => {
    // Turn single question into a 1-question simulation block so student can test answer & review explanations
    setActiveSimMinutes(4);
    setActiveSimQuestions([question]);
  };

  // Action: Add new question as a teacher
  const handleTeacherAddQuestion = async (newQuestionData: any) => {
    const response = await fetch('/api/questoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuestionData)
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Falha ao cadastrar questão.');
    }

    // Refresh questions lists
    await fetchQuestions();
  };

  // Action: Post comment to forum
  const handleAddForumComment = async (qId: string, author: string, role: 'student' | 'teacher', commentText: string, askAi: boolean) => {
    const response = await fetch(`/api/questoes/${qId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: author,
        role,
        text: commentText,
        askAi
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Falha ao publicar comentário.');
    }

    // Unlock badge for commenting
    let updatedBadges = [...stats.badges];
    if (role === 'student' && !updatedBadges.find(b => b.id === 'b1')?.unlockedAt) {
      updatedBadges = updatedBadges.map(b => b.id === 'b1' ? { ...b, unlockedAt: new Date().toLocaleDateString('pt-BR') } : b);
      setStats(prev => ({
        ...prev,
        badges: updatedBadges,
        points: prev.points + 100
      }));
    }

    // Refresh questions definitions
    await fetchQuestions();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Vládia', icon: LayoutDashboard },
    { id: 'banco', label: 'Banco de Questões', icon: BookOpen },
    { id: 'forum', label: 'Fórum de Dúvidas', icon: MessageSquare },
    { id: 'professor', label: 'Espaço do Professor', icon: PlusCircle },
    { id: 'trilha', label: 'Trilha Inteligente IA', icon: Sparkles },
  ];

  return (
    <div id="unicolab-app" className="min-h-screen bg-slate-50 text-slate-850 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md text-slate-800 border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-lg text-white shadow-xs">
              U
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">UniColab</span>
                <span className="text-[10px] font-extrabold bg-[#2563eb] text-white px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  ENADE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Universidade de Fortaleza (UNIFOR)</p>
            </div>
          </div>

          {/* Desktop Tab Selection Bar (Accompanying the Left navigation on the right side) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id && !activeSimQuestions;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSimQuestions(null);
                    setActiveTab(item.id as any);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Points widget */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-250/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-3xs">
              <Trophy className="w-4 h-4 text-amber-600 fill-current" />
              <span>{stats.points} XP Colab</span>
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold font-mono text-slate-700">
                V
              </div>
              <div className="text-left leading-none">
                <p className="text-xs font-bold text-slate-800">Vládia</p>
                <span className="text-[9px] text-slate-400 font-medium font-sans">Eng. Computação</span>
              </div>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50/70 p-1.5 px-2.5 rounded-full text-xs font-bold text-amber-800">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>{stats.points} XP</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Sidebar Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-dropdown" className="lg:hidden bg-white border-b border-slate-200 text-slate-800 py-4 px-4 space-y-3 shadow-lg">
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isSelected = activeTab === item.id && !activeSimQuestions;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSimQuestions(null);
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Live Active Sim Session Top Bar Indicator */}
      {activeSimQuestions && (
        <div id="sim-active-alert" className="bg-amber-500 text-slate-950 px-4 py-2 font-bold text-xs flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>Simulado em Execução — Progresso atual não salvo até finalização das respostas!</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Deseja mesmo cancelar o simulado em andamento? Suas respostas serão esquecidas.')) {
                setActiveSimQuestions(null);
              }
            }}
            className="text-[10px] uppercase font-extrabold bg-slate-950/10 hover:bg-slate-950/20 px-2 py-1 rounded-md transition-colors"
          >
            Sair e Descartar
          </button>
        </div>
      )}

      {/* Main Content Area Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        
        {activeSimQuestions ? (
          <Simulation
            questions={activeSimQuestions}
            limitMinutes={activeSimMinutes}
            onCancel={() => {
              if (confirm('Deseja fechar o simulado? Seu progresso parcial será perdido.')) {
                setActiveSimQuestions(null);
              }
            }}
            onFinishSimulation={handleFinishSimulation}
          />
        ) : (
          <>
            {/* Conditional Tab Rendering */}
            {activeTab === 'dashboard' && (
              <Dashboard
                stats={stats}
                onNavigateToSimulado={() => {
                  // Direct trigger of standard rapid simulation with 4 questions and 10 minutes limit
                  handleStartSimulation({ size: 4, limitMinutes: 10 });
                }}
                onSelectTrilha={() => setActiveTab('trilha')}
              />
            )}

            {activeTab === 'banco' && (
              <QuestionBank
                questions={questions}
                onStartSimulation={handleStartSimulation}
                onExploreSingleQuestion={handleExploreSingleQuestion}
              />
            )}

            {activeTab === 'forum' && (
              <Forum
                questions={questions}
                activeQuestion={activeForumQuestion}
                onAddComment={handleAddForumComment}
              />
            )}

            {activeTab === 'professor' && (
              <TeacherArea
                onAddQuestion={handleTeacherAddQuestion}
                existingQuestions={questions}
              />
            )}

            {activeTab === 'trilha' && (
              <TrilhaIA
                stats={stats}
              />
            )}
          </>
        )}

      </main>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="font-bold text-slate-350">UniColab — Plataforma de Estudos Baseada em Engenharia de Requisitos</p>
            <p className="text-[11px] text-slate-500">
              Desenvolvedores: Francisco R. F. Araújo Jr. • Lucas S. Bandeira • Pedro M. C. Costa • Vinicius G. C. Barbosa • José M. L. M. Barroso • Carlos L. C. Rocha
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Orientação: Professor Gerhard Philippe de Saboia • Universidade de Fortaleza (UNIFOR)
          </p>
        </div>
      </footer>

    </div>
  );
}
