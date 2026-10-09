import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Question, QuestionComment } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3001;

// Lazy initialize Gemini API client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Global list of questions seeded with standard ENADE questions
let databaseQuestoes: Question[] = [
  {
    id: 'en-01',
    text: 'No desenvolvimento de sistemas orientados a objetos, o padrão de projeto descritivo que visa garantir que uma determinada classe tenha exatamente uma única instância em todo o ciclo de execução, fornecendo um ponto de acesso global e seguro para ela na aplicação, é conhecido como:',
    type: 'especifico',
    area: 'Padrões de Projeto & Engenharia de Software',
    year: 2023,
    difficulty: 'facil',
    alternatives: [
      'Factory Method (Padrão de Criação por Métodos Fábrica)',
      'Singleton (Padrão de Criação de Instância Única)',
      'Adapter (Padrão Estrutural de Adaptador de Interfaces)',
      'Observer (Padrão Comportamental de Observação de Associações)',
      'Facade (Padrão Estrutural de Fachada Unificada)'
    ],
    correctAlternative: 1, // Singleton
    commentary: 'O Singleton é um padrão de criação que garante a existência de apenas uma instância de uma classe, mantendo uma referência estática global para a mesma. Factory Method cria instâncias variadas conforme parâmetros; Adapter converte uma interface em outra esperada pelos clientes; Observer gerencia dependências um-para-muitos entre objetos; Facade provê uma interface unificada para um conjunto de interfaces em um subsistema.',
    references: 'Gamma, E. et al. Padrões de Projeto (Design Patterns): Soluções Reutilizáveis de Software Orientado a Objetos. Bookman Editora.',
    comments: [
      {
        id: 'c1',
        userName: 'Carlos Levir',
        role: 'student',
        text: 'Esse padrão ajuda muito na conexão com bancos de dados, mas é preciso cuidado com concorrência.',
        timestamp: '19/05/2026 14:32'
      },
      {
        id: 'c2',
        userName: 'Prof. Gerhard',
        role: 'teacher',
        text: 'Excelente ponto, Carlos! Em ambientes multi-thread, a inicialização do Singleton precisa deter um mecanismo reflexivo ou sincronizado síncrono para evitar instâncias concorrentes duplicadas.',
        timestamp: '19/05/2026 15:45'
      }
    ]
  },
  {
    id: 'en-02',
    text: 'Considere a arquitetura de microserviços amplamente utilizada no mercado moderno para o desenvolvimento corporativo de sistemas integrados. Em termos estruturais e práticos, assinale a opção que representa uma das principais mudanças benéficas deste modelo em comparação com uma arquitetura monolítica tradicional:',
    type: 'especifico',
    area: 'Arquitetura de Sistemas Distributed',
    year: 2022,
    difficulty: 'medio',
    alternatives: [
      'Garantia natural de menor latência de rede em comunicações diretas síncronas entre quaisquer componentes internos.',
      'Possibilidade de escalabilidade independente de componentes de gargalo e isolamento intrínseco de falhas específicas por serviço.',
      'Ausência total de necessidade de provisionamento de logs distribuídos ou de monitoramento de instâncias individuais do ecossistema.',
      'Facilidade de realizar transações atômicas distribuídas ACID complexas sem adicionar sobrecarga operacional de rede.',
      'Garantia de que os bancos de dados de todos os serviços se mantenham consolidados em uma única máquina física síncrona.'
    ],
    correctAlternative: 1, // Possibilidade de escalabilidade...
    commentary: 'A arquitetura de microserviços divide uma aplicação em serviços menores e independentes. A principal vantagem é que cada serviço individual pode ser escalado de maneira independente em servidores distintos de acordo com sua demanda específica (ex: escalar apenas o carrinho de compras), além de falhas em um serviço isolado não derrubarem toda a aplicação recursivamente.',
    references: 'Newman, S. Criando Microsserviços: Projetando Sistemas Resilientes. Novatec Editora.',
    comments: [
      {
        id: 'c3',
        userName: 'Vinicius Gabriel',
        role: 'student',
        text: 'Já usei Docker para orquestrar microsserviços e a escalabilidade facilitou muito nosso escopo.',
        timestamp: '19/05/2026 16:10'
      }
    ]
  },
  {
    id: 'en-03',
    text: 'A dimensão social do conceito ESG (Environmental, Social, and Governance) engloba o impacto que uma corporação exerce no ecossistema de pessoas ao seu redor. Sobre a atuação ética e as políticas associadas a essa dimensão, assinale a opção correta:',
    type: 'geral',
    area: 'Responsabilidade Social & ESG',
    year: 2023,
    difficulty: 'facil',
    alternatives: [
      'A dimensão se atém puramente ao monitoramento da pegada de carbono organizacional para compensação florestal direta.',
      'Foca unicamente em auditorias de balanço patrimonial e fiscalização de tributação nacional.',
      'Reflete o compromisso com diversidade, inclusão social, bem-estar funcional de colaboradores, integridade na cadeia produtiva e relação harmoniosa comunitária.',
      'Exclui do monitoramento social os fornecedores terceirizados no intuito de incentivar a autonomia privada.',
      'Consiste em manter a governança executiva restrita apenas a investidores majoritários sem transparência geral.'
    ],
    correctAlternative: 2, // Reflete o compromisso...
    commentary: 'A letra "S" do ESG (Social) lida com as relações que a empresa estabelece com pessoas, tanto internas (funcionários, preenchendo diversidade, salários justos, saúde e segurança) quanto externas (comunidade local, fornecedores éticos, parceiros e consumidores).',
    references: 'Instituto Brasileiro de Governança Corporativa (IBGC). Caderno de Governança ESG nas Organizações.',
    comments: []
  },
  {
    id: 'en-04',
    text: 'A rápida ascensão de Inteligência Artificial generativa e de Modelos de Linguagem de Larga Escala (LLMs) suscita debates acalorados globais acerca da confiabilidade ética e legalidade dos dados gerados. Qual é um dos desafios éticos mais críticos identificados pela comunidade de engenharia de IA na implantação pública desses sistemas?',
    type: 'geral',
    area: 'Tecnologia & Ética na Sociedade',
    year: 2023,
    difficulty: 'medio',
    alternatives: [
      'A propagação massiva de desinformação amplificada por "alucinações" do modelo e vieses implícitos impregnados nos conjuntos de treinamento de dados históricos.',
      'A redução imediata e drástica no tráfego de redes de fibra óptica por conta da velocidade interna de processamento local nos celulares.',
      'A eliminação programática de qualquer viés cognitivo devido ao rigor probabilístico estrito e homogeneidade dos desenvolvedores iniciais.',
      'O abandono em massa da necessidade de computadores de alto desempenho uma vez que todo LLM se autotreina sem hardware associado.',
      'O encerramento iminente de pesquisas em métodos de programação heurística analítica pela automação completa das mentes científicas.'
    ],
    correctAlternative: 0,
    commentary: 'A disseminação de vieses preconceituosos existentes nos dados de treino históricos e o surgimento de alucinações (fatos gerados incorretamente com falsa aparência de autoridade) são os maiores desafios éticos na implantação indiscriminada de LLMs públicos.',
    references: 'Russell, S. & Norvig, P. Inteligência Artificial: Uma Abordagem Moderna. Rio de Janeiro: GEN LTC.',
    comments: []
  },
  {
    id: 'en-05',
    text: 'Considere o pior cenário operacional para a realização da busca exaustiva por uma determinada chave ordenada de identificação dentro de uma árvore binária de busca (BST) devidamente BALANCEADA com n chaves cadastradas. A complexidade assintótica de tempo de execução desta busca no pior caso seria descrita matematicamente pela função:',
    type: 'especifico',
    area: 'Algoritmos & Estruturas de Dados',
    year: 2021,
    difficulty: 'medio',
    alternatives: [
      'O(1) - Complexidade de tempo constante simples.',
      'O(n) - Ordem de tempo linear correspondente ao número total de nós.',
      'O(log n) - Representação de tempo logarítmico proporcional à altura equilibrada da árvore.',
      'O(n log n) - Relação de tempo de ordenação de divisão e conquista linear-logarítmico.',
      'O(n²) - Complexidade quadrática com laços aninhados independentes.'
    ],
    correctAlternative: 2, // O(log n)
    commentary: 'Como a árvore está perfeitamente balanceada por premissa da especificação, a sua altura máxima é expressa como O(log n). No pior caso de busca de uma chave inexistente ou em uma folha mais profunda, nós faremos no máximo um número de comparações proporcional ao tamanho do caminho da raiz até a folha mais baixa, correspondendo a O(log n). Se a árvore estivesse desbalanceada, a busca poderia degenerar para uma fila linear simples que seria O(n).',
    references: 'Cormen, T. H. et al. Algoritmos: Teoria e Prática. Editora Elsevier.',
    comments: [
      {
        id: 'c4',
        userName: 'Lucas Bandeira',
        role: 'student',
        text: 'A jogada aqui é a palavra "BALANCEADA". Se não estivesse balanceada seria O(n) no pior caso!',
        timestamp: '19/05/2026 18:02'
      }
    ]
  },
  {
    id: 'en-06',
    text: 'A normalização de dados é uma técnica de modelagem que busca eliminar redundâncias de armazenamento de tabelas no modelo relacional clássico de banco de dados. Nesse cenário, indique o critério técnico correto aplicável à consolidação da Terceira Forma Normal (3FN):',
    type: 'especifico',
    area: 'Engenharia de Bancos de Dados Relacionais',
    year: 2022,
    difficulty: 'dificil',
    alternatives: [
      'A tabela deve estar na Segunda Forma Normal (2FN) e todos os atributos multivalorados ou compostos devem ser segregados em tabelas de apoio unívocas.',
      'A tabela deve estar na Primeira Forma Normal (1FN) e as chaves estrangeiras devem obrigatoriamente referenciar tabelas em 2FN diretamente.',
      'A tabela deve repousar sobre a 2FN e cada coluna sem chave deve ser mutualmente transiente funcional de qualquer atributo composto da chave principal.',
      'A tabela deve estar na Segunda Forma Normal (2FN) e não pode conter quaisquer dependências funcionais transitivas de atributos não-chave em relação à chave primária.',
      'Todas as dependências transitivas devem ser reunidas no mesmo modelo relacional sem criar tabelas acessórias segregadas adicionais.'
    ],
    correctAlternative: 3, // Dependências transitivas... (O(n) ou não transiente)
    commentary: 'Para uma tabela estar em 3FN, ela precisa previamente atender a todas as exigências de 2FN e, adicionalmente, não possuir nenhum atributo não-chave que dependa de forma transitiva da chave primária através de outro atributo também não-chave. Em termos práticos, cada campo deve depender essencialmente da chave primária ("the key, the whole key, and nothing but the key, so help me Codd").',
    references: 'Elmasri, R. & Navathe, S. Sistemas de Banco de Dados. Pearson Education.',
    comments: []
  }
];

// --- API ROUTES ---

// 1. Get all questions
app.get('/api/questoes', (req, res) => {
  res.json(databaseQuestoes);
});

// 2. Submit new custom question (Espaço do Professor)
app.post('/api/questoes', (req, res) => {
  try {
    const { text, type, area, year, difficulty, alternatives, correctAlternative, commentary, references } = req.body;
    
    if (!text || !type || !area || !year || !difficulty || !alternatives || alternatives.length !== 5 || correctAlternative === undefined) {
      return res.status(400).json({ error: 'Campos obrigatórios insuficientes ou mal formatados.' });
    }

    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      text,
      type: type === 'geral' ? 'geral' : 'especifico',
      area,
      year: parseInt(year) || new Date().getFullYear(),
      difficulty: difficulty === 'facil' || difficulty === 'medio' || difficulty === 'dificil' ? difficulty : 'medio',
      alternatives,
      correctAlternative: parseInt(correctAlternative) ?? 0,
      commentary: commentary || 'Sem justificativa detalhada cadastrada pelo professor.',
      references: references || 'Edições Recentes ENADE.',
      comments: []
    };

    databaseQuestoes.unshift(newQuestion); // Add to beginning
    res.status(201).json(newQuestion);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Post a comment to a question's forum
app.post('/api/questoes/:id/comentarios', async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, role, text, askAi } = req.body;

    if (!userName || !text) {
      return res.status(400).json({ error: 'Autor e texto do comentário são obrigatórios.' });
    }

    const question = databaseQuestoes.find(q => q.id === id);
    if (!question) {
      return res.status(404).json({ error: 'Questão não encontrada.' });
    }

    // Create student comment
    const userComment: QuestionComment = {
      id: `comm-${Date.now()}`,
      userName,
      role: role || 'student',
      text,
      timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }).substring(0, 16)
    };

    question.comments.push(userComment);

    // If student checked "Perguntar ao Professor de IA" or we want to react with AI
    let aiComment: QuestionComment | null = null;
    if (askAi && ai) {
      try {
        const prompt = `Você é um Professor Universitário Preparador de ENADE altamente competente e didático.
O aluno de nome "${userName}" fez o seguinte comentário/pergunta em relação à questão do ENADE abaixo descrita:

Dúvida do Aluno: "${text}"

-- QUESTÃO DO ENADE --
Enunciado: "${question.text}"
Área: "${question.area}"
Dificuldade: "${question.difficulty}"
Alternativas:
A) ${question.alternatives[0]}
B) ${question.alternatives[1]}
C) ${question.alternatives[2]}
D) ${question.alternatives[3]}
E) ${question.alternatives[4]}
Gabarito correto: Alternativa ${String.fromCharCode(65 + question.correctAlternative)})
Anotação de Gabarito Comentado Oficial: "${question.commentary}"

Instruções para Resposta:
1. Explique didaticamente por que a alternativa correta é a correta em resposta direta ao aluno "${userName}".
2. Sanar a dúvida dele de forma objetiva, acadêmica e encorajadora.
3. Máximo de 4-5 frases curtas. Escreva na primeira pessoa como Professor de IA.`;

        const responseObj = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
        });

        const replyText = responseObj.text?.trim() || 'Desculpe, não consegui processar a resposta agora.';

        aiComment = {
          id: `ai-${Date.now()}`,
          userName: 'Professor IA (UniColab)',
          role: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Fortaleza' }).substring(0, 16)
        };

        question.comments.push(aiComment);
      } catch (gemIniErr) {
        console.error('Gemini error generating reply:', gemIniErr);
      }
    }

    res.json({ userComment, aiComment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Gemini endpoint to explain alternative choice in detail
app.post('/api/gemini/explicar', async (req, res) => {
  try {
    const { questionText, alternatives, correctIdx, chosenIdx } = req.body;

    if (!questionText || !alternatives || correctIdx === undefined || chosenIdx === undefined) {
      return res.status(400).json({ error: 'Parâmetros insuficientes para explicação por IA.' });
    }

    if (!ai) {
      return res.json({ 
        explanation: 'O serviço de IA está temporariamente indisponível (chave ausente), mas aqui está a análise oficial: A alternativa correta foi validada pelos editais oficiais do INEP de acordo com as referências acadêmicas.' 
      });
    }

    const prompt = `Você é um assistente acadêmico para simulados de ENADE. Forneça uma explicação curta, rápida e extremamente direta explicando por que o aluno escolheu a alternativa errada e por que a certa é a correta.
Dados:
Enunciado da Questão: "${questionText}"
Alternativas fornecidas:
A) ${alternatives[0]}
B) ${alternatives[1]}
C) ${alternatives[2]}
D) ${alternatives[3]}
E) ${alternatives[4]}

A alternativa correta é a de índice ${correctIdx} (${String.fromCharCode(65 + correctIdx)})
O aluno selecionou equivocadamente a alternativa de índice ${chosenIdx} (${String.fromCharCode(65 + chosenIdx)})

Explique o erro do aluno de forma clara, amigável e educativa. Máximo de 3 parágrafos curtos.`;

    const responseObj = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ explanation: responseObj.text?.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Gemini endpoint to suggest customized study guide (Trilhas Personalizadas - Could Have)
app.post('/api/gemini/trilha', async (req, res) => {
  try {
    const { stats, wrongAreas } = req.body;

    if (!ai) {
      return res.json({
        studyTrail: `### Trilha UniColab Estudo Recomendado
1. **Foque nas disciplinas com erros**: Revise temas de arquitetura de software e engenharia de requisitos.
2. **Faça resumos estruturados**: Dedique 20 minutos por dia a resolver questões comentadas do ENADE.
3. **Mantenha a constância**: Vládia, priorize fazer um simulado semanal cronometrado para treinar a exaustão mental do dia oficial.`
      });
    }

    const wrongAreasStr = wrongAreas && wrongAreas.length > 0 ? wrongAreas.join(', ') : 'Temas Gerais';
    const prompt = `Você é o Tutor de Estudos Inteligente da plataforma de estudos colaborativa UniColab para o ENADE.
O estudante está enfrentando dificuldades com as seguintes áreas de conhecimento ou disciplinas: [${wrongAreasStr}]. Total de questões concluídas: ${stats?.completedCount || 0}, desempenho geral de acerto: ${stats?.scorePercent || 50}%.

Gere uma trilha de estudos personalizada em formato Markdown direto e motivador.
Estrutura da resposta:
- Diagnóstico rápido (1 parágrafo motivacional)
- Plano de Ação dividido em 3 Passos Focados (exemplo: Passo 1, Passo 2, Passo 3) com sugestões práticas de estudo para as áreas ruins.
- 1 Dica Extra de controle de ansiedade / mentalidade de prova (baseado na persona Vládia que faz TCC e internato/estágio).
Máximo de 15 linhas no total.`;

    const responseObj = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ studyTrail: responseObj.text?.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VITE DEV SERVER OR STATIC SERVING IN PRODUCTION ---
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
