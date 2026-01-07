import React, { useState } from 'react';
import { FaTimes, FaTrophy } from 'react-icons/fa';

interface QuizGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

export default function QuizGame({ onClose, onComplete }: QuizGameProps) {
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = [
    { q: "Kuran-ı Kerim kaç cüzdür?", opts: ["10", "20", "30", "40"], a: 2 },
    { q: "İlk insan ve ilk peygamber kimdir?", opts: ["Hz. Nuh", "Hz. Adem", "Hz. Musa", "Hz. İsa"], a: 1 },
    { q: "Günde kaç vakit farz namaz vardır?", opts: ["3", "4", "5", "6"], a: 2 },
  ];

  const handleAnswer = (idx: number) => {
    if (idx === questions[qIndex].a) {
      setScore(s => s + 50);
    }
    if (qIndex + 1 < questions.length) {
      setQIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 animate-fade-in-up">
        <FaTrophy className="text-6xl text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Tebrikler!</h2>
        <p className="text-gray-600 mb-6">Toplam Puan: <span className="font-bold text-emerald-600 text-xl">{score} GP</span></p>
        <button onClick={() => onComplete(score)} className="bg-emerald-600 text-white w-full py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Ödülü Al & Çık</button>
      </div>
    );
  }

  const currentQ = questions[qIndex];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full flex flex-col justify-between">
       <div>
         <div className="flex justify-between items-center mb-6">
           <span className="text-xs font-bold text-gray-400">SORU {qIndex + 1}/{questions.length}</span>
           <button onClick={onClose} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
         </div>
         <h3 className="text-xl font-bold text-gray-800 mb-8">{currentQ.q}</h3>
         <div className="space-y-3">
           {currentQ.opts.map((opt, i) => (
             <button 
               key={i} 
               onClick={() => handleAnswer(i)}
               className="w-full text-left p-4 rounded-xl border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-gray-600"
             >
               {opt}
             </button>
           ))}
         </div>
       </div>
    </div>
  );
}