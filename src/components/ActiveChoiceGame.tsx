import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POSE_LANDMARKS } from '../constants';
import { Trophy, Star, AlertCircle, Users, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Scenario } from '../types';

interface ActiveChoiceGameProps {
  poses: any[];
  scenario?: Scenario;
  onExit: () => void;
  onFinish: (score: number, scoreP2?: number) => void;
  mode: 'single' | 'duel' | 'team';
}

const ActiveChoiceGame: React.FC<ActiveChoiceGameProps> = ({ poses, scenario, onExit, onFinish, mode }) => {
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [selection, setSelection] = useState<'left' | 'right' | null>(null);
  const [selectionP2, setSelectionP2] = useState<'left' | 'right' | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressP2, setProgressP2] = useState(0);

  const items = scenario?.items || [
    { id: '1', question: '5 + 3', answer: '8', options: ['8', '10'] }
  ];
  const isFinished = qIdx >= items.length;
  const question = items[qIdx % items.length];
  const interaction = scenario?.interactionType || 'jump_confirm';

  useEffect(() => {
    if (isFinished) {
      onFinish(score, scoreP2);
    }
  }, [isFinished, score, scoreP2, onFinish]);

  useEffect(() => {
    if (!poses || poses.length === 0 || isFinished) return;

    poses.forEach((landmarks, idx) => {
      const nose = landmarks[POSE_LANDMARKS.NOSE];
      const lShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
      const rShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];
      const lWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
      const rWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
      const lHip = landmarks[POSE_LANDMARKS.LEFT_HIP];
      const rHip = landmarks[POSE_LANDMARKS.RIGHT_HIP];
      const lKnee = landmarks[POSE_LANDMARKS.LEFT_KNEE];
      const rKnee = landmarks[POSE_LANDMARKS.RIGHT_KNEE];

      if (!nose || !lShoulder || !rShoulder) return;

      const shoulderCenter = (lShoulder.x + rShoulder.x) / 2;
      let currentSel: 'left' | 'right' | null = null;
      
      // Lean selection
      if (nose.x > shoulderCenter + 0.05) currentSel = 'left';
      else if (nose.x < shoulderCenter - 0.05) currentSel = 'right';

      // Action detection
      let actionDetected = false;
      if (interaction === 'jump_confirm') {
        // Hands up
        actionDetected = lWrist && rWrist && lWrist.y < lShoulder.y && rWrist.y < rShoulder.y;
      } else if (interaction === 'squat_confirm') {
        // Squat detection
        if (lHip && lKnee && rHip && rKnee) {
          const hipY = (lHip.y + rHip.y) / 2;
          const kneeY = (lKnee.y + rKnee.y) / 2;
          actionDetected = hipY > kneeY - 0.1;
        }
      } else if (interaction === 't_pose') {
        // T-Pose
        if (lWrist && rWrist && lShoulder && rShoulder) {
          const lArmStraight = Math.abs(lWrist.y - lShoulder.y) < 0.15;
          const rArmStraight = Math.abs(rWrist.y - rShoulder.y) < 0.15;
          const armsWide = Math.abs(lWrist.x - rWrist.x) > 0.6;
          actionDetected = lArmStraight && rArmStraight && armsWide;
        }
      } else if (interaction === 'balance') {
        // One knee up
        if (lKnee && rKnee && lHip && rHip) {
          const kneeDiff = Math.abs(lKnee.y - rKnee.y);
          actionDetected = kneeDiff > 0.15;
        }
      } else if (interaction === 'hand_swipe') {
        // Hand swipe (wrist above shoulder and moving)
        if (lWrist && rWrist && lShoulder && rShoulder) {
          actionDetected = (lWrist.y < lShoulder.y) || (rWrist.y < rShoulder.y);
        }
      } else if (interaction === 'lean_select') {
        // Holding the lean for a while
        actionDetected = !!currentSel;
      }

      if (idx === 0) {
        if (selection !== currentSel) setSelection(currentSel);
        if (!feedback) {
          if (actionDetected && currentSel) setProgress(p => Math.min(p + 25, 100));
          else setProgress(p => Math.max(p - 15, 0));
        }
      } else if (idx === 1) {
        if (mode === 'single') {
          if (!selection && selection !== currentSel) setSelection(currentSel);
          if (!feedback) {
            if (actionDetected && currentSel) setProgress(p => Math.min(p + 25, 100));
          }
        } else {
          if (selectionP2 !== currentSel) setSelectionP2(currentSel);
          if (!feedback) {
            if (actionDetected && currentSel) setProgressP2(p => Math.min(p + 25, 100));
            else setProgressP2(p => Math.max(p - 15, 0));
          }
        }
      }
    });
  }, [poses, mode, interaction, selection]);

  useEffect(() => {
    const checkAnswer = (sel: 'left' | 'right', player: 1 | 2) => {
      const val = sel === 'left' ? question.options[0] : question.options[1];
      if (val === question.answer) {
        setFeedback('correct');
        if (player === 1) setScore(s => s + 10);
        else setScoreP2(s => s + 10);
        setTimeout(() => {
          setQIdx(i => i + 1);
          setFeedback(null);
          setProgress(0);
          setProgressP2(0);
        }, 1500);
      } else {
        setFeedback('wrong');
        setTimeout(() => setFeedback(null), 1000);
      }
    };

    if (progress >= 100 && selection && !feedback) checkAnswer(selection, 1);
    if (progressP2 >= 100 && selectionP2 && !feedback) checkAnswer(selectionP2, 2);
  }, [progress, progressP2, selection, selectionP2, question, feedback]);

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

      {/* Question */}
      <div className="relative z-10 flex flex-col items-center mb-12">
        {question.questionImage && (
          <motion.img 
            src={question.questionImage} 
            className="w-48 h-48 object-contain border-4 border-[#141414] bg-white mb-4 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          />
        )}
        <motion.div 
          key={question.question}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl font-black uppercase italic tracking-tighter text-center px-4"
        >
          {question.question}
        </motion.div>
      </div>

      {/* Options */}
      <div className="flex gap-16 w-full px-12 relative z-10">
        {question.options.map((opt, idx) => {
          const isLeft = idx === 0;
          const isSelectedP1 = (isLeft && selection === 'left') || (!isLeft && selection === 'right');
          const isSelectedP2 = (isLeft && selectionP2 === 'left') || (!isLeft && selectionP2 === 'right');
          const optImage = question.optionImages?.[idx];
          
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-4">
              <motion.div
                animate={{ 
                  scale: (isSelectedP1 || isSelectedP2) ? 1.05 : 1,
                  backgroundColor: (isSelectedP1 || isSelectedP2) ? '#00FF00' : '#FFFFFF',
                  y: (isSelectedP1 || isSelectedP2) ? -10 : 0
                }}
                className="w-full min-h-[200px] border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col items-center justify-center p-6"
              >
                {optImage && (
                  <img src={optImage} className="w-24 h-24 object-contain mb-4" />
                )}
                <span className="text-5xl font-black italic">{opt}</span>
              </motion.div>
              
              {/* Progress Bar */}
              <div className="w-full h-6 bg-gray-200 border-4 border-[#141414] overflow-hidden flex relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                  {interaction === 'jump_confirm' && <ArrowBigUp className="w-4 h-4" />}
                  {interaction === 'squat_confirm' && <ArrowBigDown className="w-4 h-4" />}
                </div>
                {isSelectedP1 && (
                  <motion.div animate={{ width: `${progress}%` }} className="h-full bg-[#141414]" />
                )}
                {isSelectedP2 && (
                  <motion.div animate={{ width: `${progressP2}%` }} className="h-full bg-blue-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className={`absolute inset-0 flex items-center justify-center z-50 ${feedback === 'correct' ? 'bg-[#00FF00]/20' : 'bg-red-500/20'}`}
          >
            <div className="bg-white border-4 border-[#141414] p-12 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col items-center gap-4">
              <h2 className="text-6xl font-black uppercase italic tracking-tighter">
                {feedback === 'correct' ? 'БРАВО!' : 'ОПИТАЙ ПАК!'}
              </h2>
              <div className="text-8xl">
                {feedback === 'correct' ? '🌟' : '❌'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveChoiceGame;
