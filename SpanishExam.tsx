import React, { useState, useEffect } from 'react';
import { Book, GraduationCap, ClipboardCheck, Sparkles, RotateCcw, ChevronRight, CheckCircle2, XCircle, Star, PenTool } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types & Data ---

interface Question {
  id: number;
  question: string;
  translation: string;
  options: string[];
  answer: string;
  explanation: string;
}

const EXAM_QUESTIONS: Question[] = [
  // HABLAR section
  {
    id: 1,
    question: "Yo ___ español con mis amigos.",
    translation: "Ես իսպաներեն եմ խոսում ընկերներիս հետ:",
    options: ["hablo", "habla", "hablas"],
    answer: "hablo",
    explanation: "Yo form of 'hablar' ends in -o."
  },
  {
    id: 2,
    question: "¿Tú ___ mucho en clase?",
    translation: "Դու շատ ես խոսո՞ւմ դասի ժամանակ:",
    options: ["habla", "hablas", "hablan"],
    answer: "hablas",
    explanation: "Tú form of 'hablar' ends in -as."
  },
  {
    id: 3,
    question: "Nosotros ___ por teléfono.",
    translation: "Մենք խոսում ենք հեռախոսով:",
    options: ["hablamos", "hablan", "habláis"],
    answer: "hablamos",
    explanation: "Nosotros form of 'hablar' ends in -amos."
  },
  // COMER section
  {
    id: 4,
    question: "Yo ___ una pizza muy rica.",
    translation: "Ես շատ համեղ պիցցա եմ ուտում:",
    options: ["como", "come", "comes"],
    answer: "como",
    explanation: "Yo form of 'comer' ends in -o."
  },
  {
    id: 5,
    question: "¿Qué ___ tú hoy?",
    translation: "Ի՞նչ ես ուտում դու այսօր:",
    options: ["comes", "come", "como"],
    answer: "comes",
    explanation: "Tú form of 'comer' ends in -es."
  },
  {
    id: 6,
    question: "Ellos ___ en el restaurante.",
    translation: "Նրանք ուտում են ռեստորանում:",
    options: ["comen", "comemos", "come"],
    answer: "comen",
    explanation: "Ellos form of 'comer' ends in -en."
  },
  // VIVIR section
  {
    id: 7,
    question: "Yo ___ en una casa grande.",
    translation: "Ես ապրում եմ մեծ տանը:",
    options: ["vivo", "vive", "vives"],
    answer: "vivo",
    explanation: "Yo form of 'vivir' ends in -o."
  },
  {
    id: 8,
    question: "¿Usted ___ en Madrid?",
    translation: "Դուք ապրո՞ւմ եք Մադրիդում:",
    options: ["vive", "vives", "vivo"],
    answer: "vive",
    explanation: "Usted form of 'vivir' ends in -e."
  },
  {
    id: 9,
    question: "Nosotros ___ en Armenia.",
    translation: "Մենք ապրում ենք Հայաստանում:",
    options: ["vivimos", "vivís", "viven"],
    answer: "vivimos",
    explanation: "Nosotros form of 'vivir' ends in -imos."
  },
  {
    id: 10,
    question: "Mis padres ___ en el centro.",
    translation: "Ծնողներս ապրում են կենտրոնում:",
    options: ["viven", "vive", "vivimos"],
    answer: "viven",
    explanation: "Ellos form of 'vivir' ends in -en."
  }
];

// --- Components ---

const ProgressBar = ({ current, total }: { current: number, total: number }) => (
  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      className="h-full bg-sky-500"
    />
  </div>
);

export default function SpanishExam() {
  const [gameState, setGameState] = useState<'intro' | 'test' | 'diary'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ id: number, correct: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = (option: string) => {
    const isCorrect = option === EXAM_QUESTIONS[currentIdx].answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
      setAnswers(prev => [...prev, { id: EXAM_QUESTIONS[currentIdx].id, correct: isCorrect }]);
      setFeedback(null);
      if (currentIdx + 1 < EXAM_QUESTIONS.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setGameState('diary');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }, 1000);
  };

  const getGrade = () => {
    const correctCount = answers.filter(a => a.correct).length;
    const percentage = (correctCount / EXAM_QUESTIONS.length) * 100;
    
    if (percentage >= 90) return { score: 5, label: "Գերազանց", color: "text-emerald-400" };
    if (percentage >= 75) return { score: 4, label: "Լավ", color: "text-sky-400" };
    if (percentage >= 50) return { score: 3, label: "Բավարար", color: "text-yellow-400" };
    return { score: 2, label: "Անբավարար", color: "text-rose-400" };
  };

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
        <GraduationCap size={120} className="text-sky-500 mb-8" />
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-4">
          Control <span className="text-sky-500">Español</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.4em] mb-12">Ստուգողական: Hablar, Comer, Vivir</p>
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 max-w-md mb-12 space-y-4">
           <div className="flex items-center gap-3 text-sm text-slate-400">
              <ClipboardCheck className="text-sky-500" />
              <span>10 Հարց</span>
           </div>
           <div className="flex items-center gap-3 text-sm text-slate-400">
              <Star className="text-yellow-500" />
              <span>Վավերացում Օրագրում</span>
           </div>
        </div>
        <button 
          onClick={() => setGameState('test')}
          className="px-16 py-6 bg-sky-600 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-sky-900/20"
        >
          Սկսել Թեստը
        </button>
      </div>
    );
  }

  if (gameState === 'diary') {
    const grade = getGrade();
    const correctCount = answers.filter(a => a.correct).length;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full"
        >
          {/* Diary Card */}
          <div className="bg-[#fdfcf0] text-slate-900 p-8 md:p-12 rounded-xl shadow-2xl relative overflow-hidden border-b-8 border-slate-300">
             {/* Lines */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }} />
             
             <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                <div className="flex items-center gap-3 text-slate-400 uppercase font-black text-xs tracking-widest mb-4">
                   <Book size={20} /> Օրագիր / Diario Scholastico
                </div>
                
                <h2 className="text-4xl font-black italic tracking-tighter border-b-4 border-slate-900 pb-2">Իսպաներենի Արդյունքներ</h2>
                
                <div className="space-y-2">
                   <p className="text-slate-500 font-bold uppercase text-[10px]">Գնահատական</p>
                   <div className={`text-9xl font-black italic ${grade.color === 'text-rose-400' ? 'text-rose-600' : grade.color === 'text-emerald-400' ? 'text-emerald-600' : 'text-sky-600'}`}>
                      {grade.score}
                   </div>
                   <p className="text-xl font-black uppercase italic tracking-widest">{grade.label}</p>
                </div>

                <div className="w-full flex justify-between items-end border-t border-slate-300 pt-8 mt-8 italic font-serif">
                   <div className="text-left">
                      <p className="text-[10px] text-slate-400 font-sans uppercase font-black not-italic mb-1">Արդյունք</p>
                      <p className="text-xl">{correctCount} / {EXAM_QUESTIONS.length} Ճիշտ</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-sans uppercase font-black not-italic mb-1">Ստորագրություն</p>
                      <p className="font-cursive text-2xl" style={{ fontFamily: 'Dancing Script, cursive' }}>Maestro Español</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-12 flex justify-center gap-4">
             <button 
               onClick={() => window.location.reload()}
               className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 rounded-full font-black text-sm uppercase tracking-widest hover:border-sky-500 transition-all text-white"
             >
               <RotateCcw size={18} /> Նորից Փորձել
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = EXAM_QUESTIONS[currentIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-12">
        
        {/* Header Information */}
        <div className="space-y-4">
           <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
              <div>Հարց {currentIdx + 1} / {EXAM_QUESTIONS.length}</div>
              <div className="text-sky-500 flex items-center gap-2 underline underline-offset-4">
                 <PenTool size={12} /> Ստուգողական թերթիկ
              </div>
           </div>
           <ProgressBar current={currentIdx + 1} total={EXAM_QUESTIONS.length} />
        </div>

        {/* Exam Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
          >
             <div className="space-y-6">
                <div className="space-y-2">
                   <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight text-white">
                      {currentQuestion.question.split('___')[0]}
                      <span className="text-sky-500 underline decoration-sky-500/30 underline-offset-8 decoration-4 mx-2">
                         ___
                      </span>
                      {currentQuestion.question.split('___')[1]}
                   </h2>
                   <p className="text-slate-500 font-bold italic border-l-2 border-slate-800 pl-4 py-1">({currentQuestion.translation})</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
                   {currentQuestion.options.map((opt) => (
                     <button
                       key={opt}
                       onClick={() => handleAnswer(opt)}
                       disabled={!!feedback}
                       className={`group relative p-6 rounded-2xl font-black text-2xl uppercase tracking-tighter border-2 transition-all flex items-center justify-between ${
                         feedback === 'correct' && opt === currentQuestion.answer ? 'bg-emerald-500 border-emerald-400 text-white' :
                         feedback === 'wrong' && opt !== currentQuestion.answer ? 'opacity-30 border-slate-800' :
                         feedback === 'wrong' && opt === currentQuestion.answer ? 'bg-rose-500 border-rose-400 text-white' :
                         'bg-slate-950 border-slate-800 hover:border-sky-500 hover:scale-[1.02]'
                       }`}
                     >
                       <span>{opt}</span>
                       <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1" />
                     </button>
                   ))}
                </div>
             </div>

             {/* Feedback Overlay */}
             <AnimatePresence>
               {feedback && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20 ${feedback === 'correct' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}
                 >
                    <div className="bg-slate-950 p-8 rounded-full border border-slate-800 shadow-2xl">
                       {feedback === 'correct' ? <CheckCircle2 size={64} className="text-emerald-500" /> : <XCircle size={64} className="text-rose-500" />}
                    </div>
                    <p className={`mt-6 text-2xl font-black uppercase italic tracking-tighter ${feedback === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                       {feedback === 'correct' ? 'Ճիշտ է!' : 'Սխալ է!'}
                    </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Tip Section */}
        <div className="flex gap-4 p-6 bg-sky-500/5 rounded-3xl border border-sky-500/10">
           <div className="p-3 bg-sky-500/20 rounded-xl text-sky-400 h-fit">
              <Sparkles size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-500 mb-1">Հուշում</p>
              <p className="text-xs text-slate-400 font-bold leading-relaxed italic uppercase">
                 Հիշիր՝ «ir» բայը ցույց է տալիս ուղղություն (Voy a...), իսկ «gustar»-ի ձևը կախված է նրանից, թե ինչն է ձեզ դուր գալիս (singular vs plural)։
              </p>
           </div>
        </div>

      </div>
    </div>
  );
}
