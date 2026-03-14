import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POSE_LANDMARKS } from '../constants';
import { Star, MapPin, Navigation, Users } from 'lucide-react';
import { Scenario } from '../types';

interface DirectionalGameProps {
  poses: any[];
  scenario?: Scenario;
  onExit: () => void;
  onFinish: (score: number, scoreP2?: number) => void;
  mode: 'single' | 'duel' | 'team';
}

const DirectionalGame: React.FC<DirectionalGameProps> = ({ poses, scenario, onExit, onFinish, mode }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [pointingP1, setPointingP1] = useState<'west' | 'east' | null>(null);
  const [pointingP2, setPointingP2] = useState<'west' | 'east' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [holdTimeP1, setHoldTimeP1] = useState(0);
  const [holdTimeP2, setHoldTimeP2] = useState(0);

  const items = scenario?.items || [
    { id: '1', question: 'Къде се намира Париж?', answer: 'west', options: ['west', 'east'] },
    { id: '2', question: 'Къде се намира Истанбул?', answer: 'east', options: ['west', 'east'] },
  ];
  const isFinished = qIdx >= items.length;
  const question = items[qIdx % items.length];

  useEffect(() => {
    if (isFinished) {
      onFinish(score, scoreP2);
    }
  }, [isFinished, score, scoreP2, onFinish]);

  useEffect(() => {
    if (!poses || poses.length === 0 || isFinished) return;

    poses.forEach((landmarks, idx) => {
      const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const lWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
      const rWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

      if (!lShoulder || !rShoulder || !lWrist || !rWrist) return;

      const leftArmExtended = lWrist.x > lShoulder.x + 0.2;
      const rightArmExtended = rWrist.x < rShoulder.x - 0.2;

      let currentPointing: 'west' | 'east' | null = null;
      if (leftArmExtended) currentPointing = 'west';
      else if (rightArmExtended) currentPointing = 'east';

      if (idx === 0) {
        if (pointingP1 !== currentPointing) setPointingP1(currentPointing);
      } else if (idx === 1) {
        if (mode === 'single') {
          if (!pointingP1 && pointingP1 !== currentPointing) setPointingP1(currentPointing);
        } else {
          if (pointingP2 !== currentPointing) setPointingP2(currentPointing);
        }
      }
    });
  }, [poses, mode, pointingP1]);

  useEffect(() => {
    if (pointingP1 && pointingP1 === question.answer && !feedback) {
      setHoldTimeP1(prev => Math.min(prev + 25, 100));
    } else {
      setHoldTimeP1(0);
    }

    if (pointingP2 && pointingP2 === question.answer && !feedback) {
      setHoldTimeP2(prev => Math.min(prev + 25, 100));
    } else {
      setHoldTimeP2(0);
    }
  }, [pointingP1, pointingP2, question, feedback]);

  useEffect(() => {
    const handleWin = (player: 1 | 2) => {
      setFeedback('correct');
      if (player === 1) setScore(s => s + 10);
      else setScoreP2(s => s + 10);
      setTimeout(() => {
        setQIdx(i => i + 1);
        setFeedback(null);
        setHoldTimeP1(0);
        setHoldTimeP2(0);
      }, 1500);
    };

    if (holdTimeP1 >= 100 && !feedback) handleWin(1);
    if (holdTimeP2 >= 100 && !feedback) handleWin(2);
  }, [holdTimeP1, holdTimeP2, feedback]);

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

      <div className="text-center space-y-12 max-w-2xl relative z-10">
        <div className="flex justify-center">
          {question.questionImage ? (
            <motion.img 
              src={question.questionImage} 
              className="w-48 h-48 object-contain border-4 border-[#141414] bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            />
          ) : (
            <div className="w-24 h-24 bg-[#00FF00] border-4 border-[#141414] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <MapPin className="w-12 h-12" />
            </div>
          )}
        </div>
        
        <motion.h2 
          key={question.question}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-7xl font-black uppercase italic tracking-tighter leading-none"
        >
          {question.question}
        </motion.h2>

        <div className="flex justify-between items-center w-full mt-12 px-8 gap-12">
          <div className={`flex-1 flex flex-col items-center gap-4 p-8 border-4 border-[#141414] transition-all ${(pointingP1 === 'west' || pointingP2 === 'west') ? 'bg-[#00FF00] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]' : 'bg-white shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]'}`}>
            <span className="text-5xl font-black italic uppercase">{question.options[0]}</span>
            <div className="w-full h-4 bg-gray-200 border-2 border-[#141414] relative overflow-hidden">
              {pointingP1 === 'west' && <motion.div animate={{ width: `${holdTimeP1}%` }} className="h-full bg-[#141414]" />}
              {pointingP2 === 'west' && <motion.div animate={{ width: `${holdTimeP2}%` }} className="h-full bg-blue-600 absolute top-0" />}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Navigation className="w-16 h-16 animate-bounce text-[#141414]" />
            <span className="text-xs font-black uppercase opacity-50 mt-2">Посочи</span>
          </div>

          <div className={`flex-1 flex flex-col items-center gap-4 p-8 border-4 border-[#141414] transition-all ${(pointingP1 === 'east' || pointingP2 === 'east') ? 'bg-[#00FF00] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]' : 'bg-white shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]'}`}>
            <span className="text-5xl font-black italic uppercase">{question.options[1]}</span>
            <div className="w-full h-4 bg-gray-200 border-2 border-[#141414] relative overflow-hidden">
              {pointingP1 === 'east' && <motion.div animate={{ width: `${holdTimeP1}%` }} className="h-full bg-[#141414]" />}
              {pointingP2 === 'east' && <motion.div animate={{ width: `${holdTimeP2}%` }} className="h-full bg-blue-600 absolute top-0" />}
            </div>
          </div>
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
              <h2 className="text-6xl font-black uppercase italic tracking-tighter">Точно така!</h2>
              <p className="font-black uppercase opacity-60 italic">Следващ въпрос...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectionalGame;
