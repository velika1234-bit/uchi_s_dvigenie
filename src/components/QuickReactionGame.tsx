import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POSE_LANDMARKS } from '../constants';
import { Star, CheckCircle2, Users, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Scenario } from '../types';

interface QuickReactionGameProps {
  poses: any[];
  scenario?: Scenario;
  onExit: () => void;
  onFinish: (score: number, scoreP2?: number) => void;
  mode: 'single' | 'duel' | 'team';
}

const QuickReactionGame: React.FC<QuickReactionGameProps> = ({ poses, scenario, onExit, onFinish, mode }) => {
  const [wordIdx, setWordIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [baselineHipY, setBaselineHipY] = useState<number | null>(null);
  const [baselineHipYP2, setBaselineHipYP2] = useState<number | null>(null);
  const [actionP1, setActionP1] = useState<'jump' | 'squat' | 'idle'>('idle');
  const [actionP2, setActionP2] = useState<'jump' | 'squat' | 'idle'>('idle');
  
  const items = scenario?.items || [
    { id: '1', question: 'П_СЕН', answer: 'Е', options: ['Е', 'О'] },
    { id: '2', question: 'К_ЛО', answer: 'О', options: ['Е', 'О'] },
  ];
  const isFinished = wordIdx >= items.length;
  const word = items[wordIdx % items.length];

  useEffect(() => {
    if (isFinished) {
      onFinish(score, scoreP2);
    }
  }, [isFinished, score, scoreP2, onFinish]);

  useEffect(() => {
    if (!poses || poses.length === 0 || isFinished) return;

    poses.forEach((landmarks, idx) => {
      const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
      const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const lKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
      const rKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

      if (!lHip || !rHip || !lKnee || !rKnee) return;

      const hipY = (lHip.y + rHip.y) / 2;
      const kneeY = (lKnee.y + rKnee.y) / 2;

      if (idx === 0) {
        if (baselineHipY === null) setBaselineHipY(hipY);
        const hipKneeDist = kneeY - hipY;
        let newAction: 'jump' | 'squat' | 'idle' = 'idle';
        if (hipKneeDist < 0.15) newAction = 'squat';
        else if (baselineHipY && hipY < baselineHipY - 0.1) newAction = 'jump';
        
        if (actionP1 !== newAction) setActionP1(newAction);
      } else if (idx === 1) {
        if (mode === 'single') {
          if (baselineHipY === null) setBaselineHipY(hipY);
          const hipKneeDist = kneeY - hipY;
          let newAction: 'jump' | 'squat' | 'idle' = 'idle';
          if (hipKneeDist < 0.15) newAction = 'squat';
          else if (baselineHipY && hipY < baselineHipY - 0.1) newAction = 'jump';
          
          if (actionP1 === 'idle' && actionP1 !== newAction) setActionP1(newAction);
        } else {
          if (baselineHipYP2 === null) setBaselineHipYP2(hipY);
          const hipKneeDist = kneeY - hipY;
          let newAction: 'jump' | 'squat' | 'idle' = 'idle';
          if (hipKneeDist < 0.15) newAction = 'squat';
          else if (baselineHipYP2 && hipY < baselineHipYP2 - 0.1) newAction = 'jump';
          
          if (actionP2 !== newAction) setActionP2(newAction);
        }
      }
    });
  }, [poses, baselineHipY, baselineHipYP2, mode]);

  useEffect(() => {
    const checkAnswer = (action: 'jump' | 'squat', player: 1 | 2) => {
      const isCorrect = (action === 'jump' && word.answer === 'Е') || 
                        (action === 'squat' && word.answer === 'О');
      
      if (isCorrect && !feedback) {
        setFeedback('correct');
        if (player === 1) setScore(s => s + 10);
        else setScoreP2(s => s + 10);
        setTimeout(() => {
          setWordIdx(i => i + 1);
          setFeedback(null);
          setActionP1('idle');
          setActionP2('idle');
        }, 1500);
      }
    };

    if (actionP1 !== 'idle') checkAnswer(actionP1, 1);
    if (actionP2 !== 'idle') checkAnswer(actionP2, 2);
  }, [actionP1, actionP2, word, feedback]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Image */}
      {scenario?.backgroundImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${scenario.backgroundImage})` }}
        />
      )}

      {/* Scores */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-10">
        <div className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2 border-2 border-black font-black italic uppercase">
          <Star className="w-5 h-5 text-[#00FF00] fill-current" />
          {mode === 'team' ? `Отборен резултат: ${score + scoreP2}` : `P1: ${score}`}
        </div>
        {mode === 'duel' && (
          <div className="flex items-center gap-2 bg-[#141414] text-white px-4 py-2 border-2 border-black font-black italic uppercase">
            <Users className="w-5 h-5 text-[#00FF00]" />
            P2: {scoreP2}
          </div>
        )}
      </div>

      <div className="text-center space-y-8 relative z-10">
        <h2 className="text-2xl font-black uppercase italic opacity-50">Допълни думата:</h2>
        <motion.div 
          key={word.question}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-9xl font-black uppercase italic tracking-[0.2em] border-b-8 border-[#141414] pb-4"
        >
          {word.question.replace('_', feedback === 'correct' ? word.answer : '_')}
        </motion.div>
      </div>

      <div className="mt-24 flex gap-12 relative z-10">
        <div className={`flex flex-col items-center gap-4 p-8 border-4 border-[#141414] transition-all ${(actionP1 === 'jump' || actionP2 === 'jump') ? 'bg-[#00FF00] -translate-y-4 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]' : 'bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]'}`}>
          <span className="text-6xl font-black italic">{word.options[0]}</span>
          <span className="font-bold uppercase text-sm flex items-center gap-2">
            <ArrowBigUp className="w-5 h-5" /> ПОДСКОЧИ
          </span>
        </div>
        <div className={`flex flex-col items-center gap-4 p-8 border-4 border-[#141414] transition-all ${(actionP1 === 'squat' || actionP2 === 'squat') ? 'bg-[#00FF00] translate-y-4 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]' : 'bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]'}`}>
          <span className="text-6xl font-black italic">{word.options[1]}</span>
          <span className="font-bold uppercase text-sm flex items-center gap-2">
            <ArrowBigDown className="w-5 h-5" /> КЛЕКНИ
          </span>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-50 bg-[#00FF00]/20"
          >
            <div className="bg-white border-4 border-[#141414] p-12 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col items-center gap-4">
              <CheckCircle2 className="w-24 h-24 text-[#00FF00]" />
              <h2 className="text-6xl font-black uppercase italic tracking-tighter">Правилно!</h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 flex gap-8 z-10">
        <button 
          onClick={() => { setBaselineHipY(null); setBaselineHipYP2(null); }}
          className="px-6 py-3 bg-[#141414] text-white text-sm font-black uppercase italic border-2 border-black hover:bg-[#00FF00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Калибрирай позицията
        </button>
      </div>
    </div>
  );
};

export default QuickReactionGame;
