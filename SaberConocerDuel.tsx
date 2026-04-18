import React, { useState, useEffect } from 'react';
import { Swords, Trophy, RotateCcw, CheckCircle2, XCircle, Info, User, Zap, BookOpen, ChevronRight, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types & Data ---

type Player = 'Gor' | 'Gayane';

interface ConjugationTask {
  verb: 'saber' | 'conocer';
  pronoun: string;
  answer: string;
  options: string[];
}

interface UsageTask {
  sentence: string;
  options: string[];
  answer: string;
  translation: string;
  reason: string;
}

const CONJUGATIONS: ConjugationTask[] = [
  { verb: 'saber', pronoun: 'Yo', answer: 'sé', options: ['sé', 'sabes', 'sabe'] },
  { verb: 'saber', pronoun: 'Tú', answer: 'sabes', options: ['sé', 'sabes', 'sabe'] },
  { verb: 'saber', pronoun: 'Él/Ella', answer: 'sabe', options: ['sabes', 'sabe', 'saben'] },
  { verb: 'saber', pronoun: 'Nosotros', answer: 'sabemos', options: ['sabemos', 'saben', 'sabe'] },
  { verb: 'saber', pronoun: 'Ustedes', answer: 'saben', options: ['sabemos', 'saben', 'sabe'] },
  { verb: 'saber', pronoun: 'Ellos', answer: 'saben', options: ['sabemos', 'saben', 'sabe'] },
  { verb: 'conocer', pronoun: 'Yo', answer: 'conozco', options: ['conozco', 'conoces', 'conoce'] },
  { verb: 'conocer', pronoun: 'Tú', answer: 'conoces', options: ['conozco', 'conoces', 'conoce'] },
  { verb: 'conocer', pronoun: 'Él/Ella', answer: 'conoce', options: ['conozco', 'conoces', 'conoce'] },
  { verb: 'conocer', pronoun: 'Nosotros', answer: 'conocemos', options: ['conocemos', 'conocen', 'conoce'] },
  { verb: 'conocer', pronoun: 'Ustedes', answer: 'conocen', options: ['conocemos', 'conocen', 'conoce'] },
];

const USAGE_TASKS: UsageTask[] = [
  { 
    sentence: "Yo ___ hablar español.", 
    options: ["sé", "conozco"], 
    answer: "sé", 
    translation: "Ես գիտեմ (կարող եմ) իսպաներեն խոսել:",
    reason: "Saber is used for skills." 
  },
  { 
    sentence: "¿Tú ___ a mi hermano?", 
    options: ["sabes", "conoces"], 
    answer: "conoces", 
    translation: "Դու ճանաչո՞ւմ ես իմ եղբորը:",
    reason: "Conocer is used for people." 
  },
  { 
    sentence: "Nosotros ___ Madrid muy bien.", 
    options: ["sabemos", "conocemos"], 
    answer: "conocemos", 
    translation: "Մենք Մադրիդը շատ լավ գիտենք (ծանոթ ենք):",
    reason: "Conocer is used for places." 
  },
  { 
    sentence: "Ellos ___ que mañana hay clase.", 
    options: ["saben", "conocen"], 
    answer: "saben", 
    translation: "Նրանք գիտեն, որ վաղը դաս կա:",
    reason: "Saber is used for facts." 
  },
  { 
    sentence: "¿___ usted dónde está el cine?", 
    options: ["Sabe", "Conoce"], 
    answer: "Sabe", 
    translation: "Գիտե՞ք, թե որտեղ է կինոթատրոնը:",
    reason: "Saber is used for information." 
  },
  { 
    sentence: "Yo no ___ este libro.", 
    options: ["sé", "conozco"], 
    answer: "conozco", 
    translation: "Ես չեմ ճանաչում (ծանոթ չեմ) այս գրքին:",
    reason: "Conocer is used for things/works." 
  },
  { 
    sentence: "Él ___ cocinar muy rico.", 
    options: ["sabe", "conoce"], 
    answer: "sabe", 
    translation: "Նա գիտի (կարողանում է) շատ համեղ եփել:",
    reason: "Saber + infinitive = to know how to do something." 
  },
  { 
    sentence: "¿___ tú el número de Gor?", 
    options: ["Sabes", "Conoces"], 
    answer: "Sabes", 
    translation: "Դու գիտե՞ս Գոռի համարը:",
    reason: "Saber is used for specific data." 
  },
  { 
    sentence: "Ellas ___ a Gayane.", 
    options: ["saben", "conocen"], 
    answer: "conocen", 
    translation: "Նրանք ճանաչում են Գայանեին:",
    reason: "Conocer is used for meeting/knowing people." 
  },
  { 
    sentence: "Nosotros ___ la verdad.", 
    options: ["sabemos", "conocemos"], 
    answer: "sabemos", 
    translation: "Մենք գիտենք ճշմարտությունը:",
    reason: "Saber is used for facts." 
  },
];

// --- Sub-components ---

const PlayerCard = ({ name, score, active, color }: { name: string, score: number, active: boolean, color: string }) => (
  <motion.div 
    animate={{ scale: active ? 1.05 : 1, opacity: active ? 1 : 0.6 }}
    className={`p-6 rounded-[2rem] border-2 transition-all shadow-xl bg-slate-900 ${active ? `border-${color}-500 shadow-${color}-500/20` : 'border-slate-800'}`}
  >
    <div className="flex items-center gap-4">
       <div className={`p-4 rounded-2xl bg-${color}-500/20 text-${color}-400`}>
          <User size={32} />
       </div>
       <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 italic mb-1">{name}</h3>
          <div className="text-4xl font-black italic tracking-tighter text-white">{score} <span className="text-xs uppercase text-slate-600 not-italic">pts</span></div>
       </div>
    </div>
    {active && (
      <motion.div 
        layoutId="active-indicator"
        className={`h-1 w-full bg-${color}-500 mt-4 rounded-full`}
      />
    )}
  </motion.div>
);

// --- Main App ---

export default function SaberConocerDuel() {
  const [gameState, setGameState] = useState<'start' | 'conjugation' | 'usage' | 'won'>('start');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Gor');
  const [scores, setScores] = useState({ Gor: 0, Gayane: 0 });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', msg: string } | null>(null);
  const [userInput, setUserInput] = useState('');

  // Conjugation Logic
  const handleConjugation = (option: string) => {
    const task = CONJUGATIONS[currentIdx];
    if (option.trim().toLowerCase() === task.answer.toLowerCase()) {
      correctAction(10);
    } else {
      wrongAction(`Սխալ է: Ճիշտ ձևն է՝ "${task.answer}"`);
    }
  };

  // Usage Logic
  const handleUsage = (option: string) => {
    const task = USAGE_TASKS[currentIdx];
    if (option === task.answer) {
      correctAction(15);
    } else {
      wrongAction(`Սխալ է: ${task.reason}`);
    }
  };

  const correctAction = (points: number) => {
    setFeedback({ type: 'correct', msg: 'Ճիշտ է! 🎉' });
    setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + points }));
    setTimeout(nextTask, 1200);
  };

  const wrongAction = (msg: string) => {
    setFeedback({ type: 'wrong', msg });
    setTimeout(nextTask, 2500);
  };

  const nextTask = () => {
    setFeedback(null);
    setUserInput('');
    
    const maxIdx = gameState === 'conjugation' ? CONJUGATIONS.length : USAGE_TASKS.length;
    
    if (currentIdx + 1 < maxIdx) {
      setCurrentIdx(i => i + 1);
      setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
    } else {
      if (gameState === 'conjugation') {
        setGameState('usage');
        setCurrentIdx(0);
      } else {
        setGameState('won');
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      }
    }
  };

  const restart = () => {
    setScores({ Gor: 0, Gayane: 0 });
    setCurrentIdx(0);
    setGameState('start');
    setCurrentPlayer('Gor');
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center font-sans overflow-hidden relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent animate-pulse" />
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl space-y-12"
        >
          <div className="relative inline-block">
             <BookOpen size={120} className="text-sky-500 animate-bounce mb-4" />
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
               className="absolute -inset-8 border border-sky-500/20 rounded-full border-dashed"
             />
          </div>
          <div className="space-y-4">
             <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
               Saber <span className="text-sky-500">&</span> Conocer
             </h1>
             <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm">Գոռ և Գայանե: Մեծ Մրցույթ</p>
          </div>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Իմացեք տարբերությունը այս երկու կարևոր բայերի միջև: Մրցեք միմյանց հետ և տիրացեք Քերականության Գրքին:
          </p>
          <button 
            onClick={() => setGameState('conjugation')}
            className="group relative px-16 py-8 bg-sky-600 rounded-[2.5rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-sky-600/30"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10 font-black text-3xl uppercase tracking-widest flex items-center gap-3">
              Սկսել <ChevronRight />
            </span>
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'won') {
    const winner = scores.Gor > scores.Gayane ? 'Գոռը' : scores.Gayane > scores.Gor ? 'Գայանեն' : 'Ոչ-ոքի';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12">
        <Trophy size={160} className="text-yellow-400 animate-pulse" />
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
            {winner} <span className="text-sky-500">Հաղթեց!</span>
          </h1>
          <div className="flex gap-8 justify-center items-center py-8">
             <div className="text-center">
                <p className="text-xs uppercase font-black text-slate-500 tracking-widest mb-2">Գոռ</p>
                <p className="text-4xl font-black italic">{scores.Gor}</p>
             </div>
             <div className="h-12 w-px bg-slate-800" />
             <div className="text-center">
                <p className="text-xs uppercase font-black text-slate-500 tracking-widest mb-2">Գայանե</p>
                <p className="text-4xl font-black italic">{scores.Gayane}</p>
             </div>
          </div>
        </div>
        <button 
          onClick={restart}
          className="flex items-center gap-4 px-12 py-6 bg-slate-900 border-2 border-slate-800 rounded-full font-black text-2xl uppercase tracking-widest hover:border-sky-500 transition-all"
        >
          <RotateCcw /> Նորից խաղալ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center">
       <div className="max-w-4xl w-full space-y-8">
          
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <PlayerCard name="Գոռ" score={scores.Gor} active={currentPlayer === 'Gor'} color="sky" />
             <PlayerCard name="Գայանե" score={scores.Gayane} active={currentPlayer === 'Gayane'} color="orange" />
          </div>

          {/* Phase Indicator */}
          <div className="flex items-center justify-center gap-4">
             <div className={`px-6 py-2 rounded-full border-2 transition-all font-black uppercase text-xs tracking-widest ${gameState === 'conjugation' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                1. Սպրյաժենիե
             </div>
             <ChevronRight className="text-slate-800" />
             <div className={`px-6 py-2 rounded-full border-2 transition-all font-black uppercase text-xs tracking-widest ${gameState === 'usage' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                2. Կիրառություն
             </div>
          </div>

          {/* Task Card */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${gameState}-${currentIdx}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 md:p-16 text-center space-y-12 shadow-2xl relative overflow-hidden backdrop-blur-sm"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
               
               {gameState === 'conjugation' ? (
                 <div className="space-y-12">
                    <div className="space-y-4">
                       <div className="inline-block px-4 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-black uppercase tracking-widest text-[10px]">VERBO: {CONJUGATIONS[currentIdx].verb.toUpperCase()}</div>
                       <h2 className="text-7xl font-black italic tracking-tighter italic font-sans flex items-center justify-center gap-6">
                         <span className="text-slate-600 not-italic uppercase text-4xl">{CONJUGATIONS[currentIdx].pronoun}</span>
                         <span className="text-white">___?</span>
                       </h2>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                       {CONJUGATIONS[currentIdx].options.map(opt => (
                         <button 
                           key={opt}
                           onClick={() => handleConjugation(opt)}
                           className="px-8 py-4 bg-slate-950 border-4 border-slate-800 rounded-2xl font-black text-2xl uppercase tracking-tighter hover:border-sky-500 hover:scale-105 active:scale-95 transition-all"
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                 </div>
               ) : (
                 <div className="space-y-12">
                    <div className="space-y-6">
                       <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-tight">
                        {USAGE_TASKS[currentIdx].sentence.split('___')[0]}
                        <span className="text-sky-500 underline decoration-4 underline-offset-8 decoration-sky-500/30">___</span>
                        {USAGE_TASKS[currentIdx].sentence.split('___')[1]}
                       </h2>
                       <p className="text-xl font-bold italic text-slate-500">({USAGE_TASKS[currentIdx].translation})</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                       {USAGE_TASKS[currentIdx].options.map(opt => (
                         <button 
                           key={opt}
                           onClick={() => handleUsage(opt)}
                           className="px-12 py-6 bg-slate-950 border-4 border-slate-800 rounded-3xl font-black text-3xl uppercase tracking-tighter hover:border-sky-500 hover:scale-105 active:scale-95 transition-all"
                         >
                           {opt}
                         </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Feedback */}
               <AnimatePresence>
                 {feedback && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className={`absolute inset-0 flex flex-col items-center justify-center p-12 backdrop-blur-xl z-20 ${feedback.type === 'correct' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
                   >
                      {feedback.type === 'correct' ? <CheckCircle2 size={100} className="text-emerald-500 mb-6" /> : <XCircle size={100} className="text-rose-500 mb-6" />}
                      <div className={`text-4xl font-black uppercase italic tracking-tighter ${feedback.type === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {feedback.msg}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Grammar Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] space-y-4">
                <div className="flex items-center gap-3 text-sky-400 font-black uppercase tracking-widest text-xs">
                   <BookOpen size={16} /> SABER
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase italic">Օգտագործվում է փաստերի, տեղեկության կամ հմտությունների (կարողությունների) համար:</p>
             </div>
             <div className="p-8 bg-slate-900 border border-slate-800 rounded-[3rem] space-y-4">
                <div className="flex items-center gap-3 text-orange-400 font-black uppercase tracking-widest text-xs">
                   <Hash size={16} /> CONOCER
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase italic">Օգտագործվում է մարդկանց, վայրերի կամ ինչ-որ բանի հետ ծանոթ լինելու համար:</p>
             </div>
          </div>

       </div>
    </div>
  );
}
