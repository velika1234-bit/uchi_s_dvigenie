import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Home, Star, Users } from 'lucide-react';

interface GameOverProps {
  score: number;
  scoreP2?: number;
  mode: 'single' | 'duel' | 'team';
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, scoreP2 = 0, mode, onRestart, onMenu }) => {
  const getWinner = () => {
    if (mode === 'single') return 'Браво!';
    if (mode === 'team') return 'Страхотен отбор!';
    if (score > scoreP2) return 'Играч 1 печели!';
    if (scoreP2 > score) return 'Играч 2 печели!';
    return 'Равенство!';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 bg-[#00FF00]/10 backdrop-blur-sm flex items-center justify-center p-8"
    >
      <div className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-32 h-32 bg-[#00FF00] border-4 border-[#141414] flex items-center justify-center rotate-12 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <Trophy className="w-16 h-16" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-7xl font-black uppercase italic tracking-tighter leading-none">
            {getWinner()}
          </h2>
          <p className="text-xl font-black uppercase opacity-60 italic">Играта приключи</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#141414] text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,255,0,1)]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-[#00FF00] fill-current" />
              <span className="font-black uppercase italic">Играч 1</span>
            </div>
            <div className="text-5xl font-black">{score}</div>
          </div>

          {(mode === 'duel' || mode === 'team') && (
            <div className="bg-[#141414] text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,255,0,1)]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#00FF00]" />
                <span className="font-black uppercase italic">{mode === 'team' ? 'Отборен резултат' : 'Играч 2'}</span>
              </div>
              <div className="text-5xl font-black">{mode === 'team' ? score + scoreP2 : scoreP2}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button 
            onClick={onRestart}
            className="flex-1 bg-[#00FF00] text-[#141414] border-4 border-[#141414] py-4 font-black uppercase italic flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <RotateCcw className="w-6 h-6" />
            Отново
          </button>
          <button 
            onClick={onMenu}
            className="flex-1 bg-white text-[#141414] border-4 border-[#141414] py-4 font-black uppercase italic flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            <Home className="w-6 h-6" />
            Меню
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameOver;
