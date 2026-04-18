import React, { useState, useEffect, useMemo } from 'react';
import { Flag, RotateCcw, CheckCircle2, XCircle, User, Trophy, ChevronRight, Timer, Map as MapIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

// --- Types & Questions ---

type Player = 'Gor' | 'Gayane';

interface Question {
  id: number;
  text: string;
  translation: string;
  options: string[];
  answer: string;
  reason: string;
}

const QUESTIONS: Question[] = [
  { id: 1, text: "¿_____ cuesta este coche?", translation: "Ինչքա՞ն արժե այս մեքենան:", options: ["Cuánto", "Cuándo", "Cuánta"], answer: "Cuánto", reason: "Precio (money) uses 'Cuánto'." },
  { id: 2, text: "¿_____ es tu cumpleaños?", translation: "Ե՞րբ է քո ծննդյան օրը:", options: ["Cuánto", "Cuándo", "Cuántos"], answer: "Cuándo", reason: "Time/Date uses 'Cuándo'." },
  { id: 3, text: "¿_____ personas hay en la fiesta?", translation: "Քանի՞ հոգի կա խնջույքին:", options: ["Cuántos", "Cuántas", "Cuándo"], answer: "Cuántas", reason: "'Personas' is feminine plural." },
  { id: 4, text: "¿_____ libros tienes?", translation: "Քանի՞ գիրք ունես:", options: ["Cuántos", "Cuántas", "Cuánto"], answer: "Cuántos", reason: "'Libros' is masculine plural." },
  { id: 5, text: "¿_____ tiempo tenemos?", translation: "Ինչքա՞ն ժամանակ ունենք:", options: ["Cuándo", "Cuánto", "Cuánta"], answer: "Cuánto", reason: "'Tiempo' is masculine singular." },
  { id: 6, text: "¿_____ vienes a mi casa?", translation: "Ե՞րբ ես գալիս իմ տուն:", options: ["Cuándo", "Cuánto", "Cuántos"], answer: "Cuándo", reason: "Asking for a moment in time." },
  { id: 7, text: "¿_____ leche quieres?", translation: "Ինչքա՞ն կաթ ես ուզում:", options: ["Cuánto", "Cuánta", "Cuántas"], answer: "Cuánta", reason: "'Leche' is feminine singular." },
  { id: 8, text: "No sé _____ termina la película.", translation: "Չգիտեմ, թե երբ է ավարտվում ֆիլմը:", options: ["cuándo", "cuánto", "cuántos"], answer: "cuándo", reason: "Refers to time." },
  { id: 9, text: "¿_____ dinero necesitas?", translation: "Ինչքա՞ն գումար է քեզ պետք:", options: ["Cuánto", "Cuánta", "Cuándo"], answer: "Cuánto", reason: "'Dinero' is masculine singular." },
  { id: 10, text: "¿_____ veces has ido a España?", translation: "Քանի՞ անգամ ես եղել Իսպանիայում:", options: ["Cuántos", "Cuántas", "Cuándo"], answer: "Cuántas", reason: "'Veces' is feminine plural." },
  { id: 11, text: "¿_____ llegas al aeropuerto?", translation: "Ե՞րբ ես հասնում օդանավակայան:", options: ["Cuándo", "Cuánto", "Cuánta"], answer: "Cuándo", reason: "Asking for arrival time." },
  { id: 12, text: "¿_____ agua bebes al día?", translation: "Ինչքա՞ն ջուր ես խմում օրական:", options: ["Cuánto", "Cuánta", "Cuántos"], answer: "Cuánto", reason: "'Agua' is feminine but uses 'cuánto' for phonetic reasons in singular (like 'el agua'), though technically 'cuánta' is the gender. In common questions it is 'Cuánto'." },
  { id: 13, text: "¿_____ chicas hay en tu clase?", translation: "Քանի՞ աղջիկ կա քո դասարանում:", options: ["Cuántos", "Cuántas", "Cuánto"], answer: "Cuántas", reason: "Feminine plural." },
  { id: 14, text: "Llámame _____ puedas.", translation: "Զանգիր ինձ, երբ կարողանաս:", options: ["cuándo", "cuando", "cuánto"], answer: "cuando", reason: "Temporal conjunction (no accent here as it's not a question)." },
  { id: 15, text: "¿_____ pan quieres?", translation: "Ինչքա՞ն հաց ես ուզում:", options: ["Cuánto", "Cuánta", "Cuántos"], answer: "Cuánto", reason: "Masculine singular." }
];

const FINISH_LINE = 8; // Steps to win

// --- Components ---

const TrackStep = ({ index, playersAtStep }: { index: number, playersAtStep: Player[] }) => (
  <div 
    className="relative w-32 h-20 bg-slate-800 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-center transform-gpu shadow-2xl"
    style={{
      transform: `translateZ(${index * 40}px) translateY(${-index * 10}px)`,
      zIndex: index
    }}
  >
    <div className="absolute -top-4 left-2 text-[10px] font-black text-slate-600">STEP {index}</div>
    <div className="flex gap-2">
      <AnimatePresence>
        {playersAtStep.map(p => (
          <motion.div
            key={p}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0 }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${p === 'Gor' ? 'bg-sky-500' : 'bg-orange-500'}`}
          >
            <User size={14} className="text-white" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
    {index === FINISH_LINE && (
      <div className="absolute -right-4 -top-8 text-yellow-500">
        <Flag size={32} className="animate-bounce" />
      </div>
    )}
  </div>
);

export default function CuandoCuantoRace() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won'>('start');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Gor');
  const [positions, setPositions] = useState<Record<Player, number>>({ Gor: 0, Gayane: 0 });
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', msg: string } | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setShuffledQuestions([...QUESTIONS].sort(() => Math.random() - 0.5));
  }, [gameState]);

  const handleAnswer = (option: string) => {
    const question = shuffledQuestions[currentQuestionIdx];
    const isCorrect = option === question.answer;

    if (isCorrect) {
      setFeedback({ type: 'correct', msg: 'Ճիշտ է! 1 քայլ առաջ' });
      setPositions(prev => {
        const newPos = prev[currentPlayer] + 1;
        if (newPos >= FINISH_LINE) {
          setTimeout(() => setGameState('won'), 1000);
          confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
        }
        return { ...prev, [currentPlayer]: newPos };
      });
    } else {
      setFeedback({ type: 'wrong', msg: 'Սխալ է! 1 քայլ հետ' });
      setPositions(prev => ({
        ...prev,
        [currentPlayer]: Math.max(0, prev[currentPlayer] - 1)
      }));
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
      setCurrentQuestionIdx(i => (i + 1) % QUESTIONS.length);
    }, 2000);
  };

  if (gameState === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="relative">
             <MapIcon size={120} className="text-sky-500 animate-pulse mx-auto" />
             <Sparkles className="absolute -top-4 -right-4 text-yellow-400 animate-spin" />
          </div>
          <div className="space-y-4">
             <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                Race: <span className="text-sky-500">Cuando</span> & <span className="text-orange-500">Cuanto</span>
             </h1>
             <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-sm">Գոռ և Գայանե: Մեծ Մրցավազք</p>
          </div>
          <button 
            onClick={() => setGameState('playing')}
            className="group relative px-16 py-8 bg-sky-600 rounded-[2.5rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-sky-600/30 font-black text-3xl uppercase tracking-widest"
          >
            Սկսել Մրցավազքը
          </button>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'won') {
    const winner = positions.Gor >= FINISH_LINE ? 'Գոռը' : 'Գայանեն';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12">
        <Trophy size={160} className="text-yellow-400 animate-bounce" />
        <h1 className="text-7xl font-black uppercase italic tracking-tighter">
           {winner} <span className="text-sky-500">Հաղթեց!</span>
        </h1>
        <button 
          onClick={() => {
            setPositions({ Gor: 0, Gayane: 0 });
            setGameState('start');
          }}
          className="px-12 py-6 bg-slate-900 border-2 border-slate-800 rounded-full font-black text-xl uppercase tracking-widest hover:border-sky-500 transition-all"
        >
          <RotateCcw className="inline mr-2" /> Նորից խաղալ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col overflow-hidden">
      {/* 3D Race Track Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40" style={{ perspective: '1000px' }}>
         <div className="flex flex-col gap-4 transform-gpu rotate-x-[60deg]">
            {Array.from({ length: FINISH_LINE + 1 }).map((_, i) => (
              <TrackStep 
                key={i} 
                index={i} 
                playersAtStep={Object.entries(positions).filter(([_, pos]) => pos === i).map(([p]) => p as Player)} 
              />
            ))}
         </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-between py-12">
        
        {/* Header Status */}
        <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-slate-800 border-b-sky-500">
           <div className={`flex items-center gap-4 transition-all ${currentPlayer === 'Gor' ? 'scale-110' : 'opacity-40'}`}>
              <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                 <User size={24} />
              </div>
              <div className="text-left leading-none font-black italic uppercase italic">Գոռ</div>
           </div>
           
           <div className="flex flex-col items-center">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">Հերթը</div>
              <ChevronRight className={`text-sky-500 transition-all ${currentPlayer === 'Gayane' ? 'rotate-0' : 'rotate-180'}`} />
           </div>

           <div className={`flex items-center gap-4 transition-all ${currentPlayer === 'Gayane' ? 'scale-110' : 'opacity-40'}`}>
              <div className="text-right leading-none font-black italic uppercase italic">Գայանե</div>
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                 <User size={24} />
              </div>
           </div>
        </div>

        {/* Question Area */}
        <AnimatePresence mode="wait">
          {!feedback && shuffledQuestions[currentQuestionIdx] && (
            <motion.div 
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-slate-900/90 border border-slate-800 rounded-[3rem] p-8 md:p-16 text-center space-y-12 shadow-2xl relative"
            >
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-tight">
                     {shuffledQuestions[currentQuestionIdx].text}
                  </h2>
                  <p className="text-slate-500 font-bold italic">({shuffledQuestions[currentQuestionIdx].translation})</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {shuffledQuestions[currentQuestionIdx].options.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      className="px-6 py-4 bg-slate-950 border-4 border-slate-800 rounded-2xl font-black text-2xl uppercase tracking-tighter hover:border-sky-500 transition-all hover:scale-105 active:scale-95"
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </motion.div>
          )}

          {feedback && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`bg-slate-900/95 border-4 rounded-[3rem] p-12 text-center space-y-6 ${feedback.type === 'correct' ? 'border-emerald-500' : 'border-rose-500'}`}
            >
               {feedback.type === 'correct' ? <CheckCircle2 size={80} className="mx-auto text-emerald-500" /> : <XCircle size={80} className="mx-auto text-rose-500" />}
               <h3 className={`text-5xl font-black uppercase italic tracking-tighter ${feedback.type === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {feedback.msg}
               </h3>
               <p className="text-slate-400 font-bold">{shuffledQuestions[currentQuestionIdx].reason}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar Footer */}
        <div className="space-y-2">
           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              <div>START</div>
              <div>FINISH</div>
           </div>
           <div className="h-4 bg-slate-900 rounded-full border border-slate-800 relative overflow-hidden">
              {/* Gor Progress */}
              <motion.div 
                animate={{ width: `${(positions.Gor / FINISH_LINE) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-sky-500/30 border-r-2 border-sky-500"
              />
              {/* Gayane Progress */}
              <motion.div 
                animate={{ width: `${(positions.Gayane / FINISH_LINE) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-orange-500/30 border-r-2 border-orange-500"
              />
           </div>
        </div>

      </div>
    </div>
  );
}
