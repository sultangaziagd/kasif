
import React, { useState, useEffect } from 'react';
import { FaBolt, FaTimes, FaTrophy, FaRobot, FaUser } from 'react-icons/fa';

interface DuelGameProps {
  onClose: () => void;
  onComplete: (score: number) => void;
}

export default function DuelGame({ onClose, onComplete }: DuelGameProps) {
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);

  const WIN_SCORE = 100;
  const CORRECT_POINTS = 20;

  const questions = [
    { q: "Kuran-ı Kerim'in kalbi hangi suredir?", opts: ["Yasin", "Fatiha", "Bakara", "Mülk"], a: 0 },
    { q: "Hangi namazın sünneti farzından sonra kılınır?", opts: ["Sabah", "Öğle", "İkindi", "Akşam"], a: 3 },
    { q: "Peygamberimiz (s.a.v) nerede doğmuştur?", opts: ["Medine", "Mekke", "Taif", "Kudüs"], a: 1 },
    { q: "Zekat kimlere verilmez?", opts: ["Fakirlere", "Borçlulara", "Anne-Babaya", "Yolda kalmışa"], a: 2 },
    { q: "Abdestin farzı kaçtır?", opts: ["32", "54", "4", "12"], a: 2 },
    { q: "Kudüs'ü fetheden komutan kimdir?", opts: ["Fatih Sultan Mehmet", "Selahaddin Eyyubi", "Yavuz Sultan Selim", "Kanuni"], a: 1 },
    { q: "Kuran-ı Kerim hangi ayda indirilmeye başlandı?", opts: ["Recep", "Şaban", "Ramazan", "Muharrem"], a: 2 },
    { q: "İslam'ın şartı kaçtır?", opts: ["5", "6", "7", "4"], a: 0 },
  ];

  // Bot Logic
  useEffect(() => {
    if (gameOver) return;

    const botInterval = setInterval(() => {
      // Bot has 30% chance to score every 2 seconds
      if (Math.random() > 0.6) {
        setBotScore(prev => {
          const newScore = prev + 15; // Bot gets 15 pts (slightly slower than player)
          if (newScore >= WIN_SCORE) {
            setWinner('bot');
            setGameOver(true);
            return WIN_SCORE;
          }
          return newScore;
        });
      }
    }, 2000);

    return () => clearInterval(botInterval);
  }, [gameOver]);

  const handleAnswer = (idx: number) => {
    if (gameOver) return;

    if (idx === questions[qIndex].a) {
      const newScore = playerScore + CORRECT_POINTS;
      if (newScore >= WIN_SCORE) {
        setPlayerScore(WIN_SCORE);
        setWinner('player');
        setGameOver(true);
      } else {
        setPlayerScore(newScore);
        // Next question looping
        setQIndex((prev) => (prev + 1) % questions.length);
      }
    } else {
      // Wrong answer penalty? Or just shake?
      // For now, no penalty, just next question
      setQIndex((prev) => (prev + 1) % questions.length);
    }
  };

  if (gameOver) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-100 animate-fade-in-up flex flex-col items-center justify-center h-full">
        {winner === 'player' ? (
          <>
            <FaTrophy className="text-6xl text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-slate-800 mb-2">MÜKEMMEL!</h2>
            <p className="text-gray-600 mb-6 font-medium">Sanal Hafız'ı yendin ve ödülü kaptın!</p>
            <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-black text-xl mb-6">
              +75 GP KAZANDIN
            </div>
            <button onClick={() => onComplete(75)} className="bg-emerald-600 text-white w-full py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition">
              Ödülü Al ve Çık
            </button>
          </>
        ) : (
          <>
            <FaRobot className="text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-black text-slate-800 mb-2">KAYBETTİN...</h2>
            <p className="text-gray-600 mb-6">Sanal Hafız senden daha hızlıydı. Tekrar dene!</p>
            <button onClick={onClose} className="bg-slate-800 text-white w-full py-4 rounded-xl font-bold hover:bg-slate-700 transition">
              Kapat
            </button>
          </>
        )}
      </div>
    );
  }

  const currentQ = questions[qIndex];

  return (
    <div className="bg-slate-50 rounded-2xl p-4 shadow-lg border border-gray-200 h-full flex flex-col relative overflow-hidden">
      {/* Header Bars */}
      <div className="flex justify-between items-end mb-6 gap-4">
        <div className="flex-1">
           <div className="flex justify-between text-xs font-bold mb-1 text-indigo-600">
              <span className="flex items-center gap-1"><FaUser /> SEN</span>
              <span>{playerScore}%</span>
           </div>
           <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300"
                style={{ width: `${(playerScore / WIN_SCORE) * 100}%` }}
              ></div>
           </div>
        </div>

        <div className="text-2xl font-black text-slate-300 italic">VS</div>

        <div className="flex-1">
           <div className="flex justify-between text-xs font-bold mb-1 text-rose-600">
              <span className="flex items-center gap-1"><FaRobot /> SANAL HAFIZ</span>
              <span>{botScore}%</span>
           </div>
           <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all duration-500"
                style={{ width: `${(botScore / WIN_SCORE) * 100}%` }}
              ></div>
           </div>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><FaTimes /></button>

      {/* Question Area */}
      <div className="flex-1 flex flex-col justify-center">
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4 text-center">
            <h3 className="text-lg font-black text-slate-800">{currentQ.q}</h3>
         </div>
         
         <div className="grid grid-cols-1 gap-3">
           {currentQ.opts.map((opt, i) => (
             <button 
               key={i} 
               onClick={() => handleAnswer(i)}
               className="w-full text-left p-4 rounded-xl bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition font-bold text-slate-600 active:scale-95"
             >
               {opt}
             </button>
           ))}
         </div>
      </div>
    </div>
  );
}
