import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { POSE_LANDMARKS } from '../constants';
import { Star, ArrowLeftRight, Trophy } from 'lucide-react';
import { Scenario } from '../types';

interface CatcherGameProps {
  poses: any[];
  scenario: Scenario;
  onExit: () => void;
  onFinish: (score: number, scoreP2?: number) => void;
  mode: 'single' | 'duel' | 'team';
}

interface FallingItem {
  id: string;
  text: string;
  image?: string;
  answer: string;
  x: number;
  y: number;
  speed: number;
}

const CatcherGame: React.FC<CatcherGameProps> = ({ poses, scenario, onExit, onFinish, mode }) => {
  const [items, setItems] = useState<FallingItem[]>([]);
  const [score, setScore] = useState(0);
  const [scoreP2, setScoreP2] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds game
  const [isFinished, setIsFinished] = useState(false);
  const lastSpawnTime = useRef(0);

  useEffect(() => {
    if (scenario.items.length > 0) {
      const cats = Array.from(new Set(scenario.items.flatMap(i => i.options)));
      setCategories(cats.slice(0, 2)); // Support 2 categories for now
    }
  }, [scenario]);

  useEffect(() => {
    if (timeLeft <= 0 && !isFinished) {
      setIsFinished(true);
      onFinish(score, scoreP2);
    }
  }, [timeLeft, isFinished, score, scoreP2, onFinish]);

  const spawnItem = useCallback(() => {
    if (isFinished) return;
    const randomItem = scenario.items[Math.floor(Math.random() * scenario.items.length)];
    const newItem: FallingItem = {
      id: Math.random().toString(),
      text: randomItem.question,
      image: randomItem.questionImage,
      answer: randomItem.answer,
      x: 0.2 + Math.random() * 0.6,
      y: -0.1,
      speed: 0.005 + Math.random() * 0.005
    };
    setItems(prev => [...prev, newItem]);
  }, [scenario, isFinished]);

  useEffect(() => {
    if (isFinished) return;
    const gameLoop = setInterval(() => {
      const now = Date.now();
      if (now - lastSpawnTime.current > 2500) {
        spawnItem();
        lastSpawnTime.current = now;
      }

      setItems(prev => prev.map(item => ({ ...item, y: item.y + item.speed })).filter(item => item.y < 1.1));
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(timer);
    };
  }, [spawnItem, isFinished]);

  useEffect(() => {
    if (!poses || poses.length === 0 || isFinished) return;

    poses.forEach((landmarks, playerIdx) => {
      const lWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
      const rWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];

      if (!lWrist || !rWrist) return;

      // Check collision with items
      setItems(prev => {
        const remaining = [...prev];
        let hitIdx = -1;
        let playerWhoHit = -1;

        for (let i = 0; i < remaining.length; i++) {
          const item = remaining[i];
          // Simple distance check
          const distL = Math.sqrt(Math.pow(lWrist.x - item.x, 2) + Math.pow(lWrist.y - item.y, 2));
          const distR = Math.sqrt(Math.pow(rWrist.x - item.x, 2) + Math.pow(rWrist.y - item.y, 2));

          if (distL < 0.1 || distR < 0.1) {
            hitIdx = i;
            playerWhoHit = playerIdx;
            break;
          }
        }

        if (hitIdx !== -1) {
          const hitItem = remaining[hitIdx];
          // Logic: Push left or right?
          const isLeft = (lWrist.x + rWrist.x) / 2 > 0.5; // Mirrored
          const selectedCategory = isLeft ? categories[0] : categories[1];
          
          if (selectedCategory === hitItem.answer) {
            if (mode === 'single') {
              setScore(s => s + 10);
            } else {
              if (playerWhoHit === 0) setScore(s => s + 10);
              else if (playerWhoHit === 1) setScoreP2(s => s + 10);
            }
          }
          remaining.splice(hitIdx, 1);
        }
        return remaining;
      });
    });
  }, [poses, categories]);

  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Background Image */}
      {scenario?.backgroundImage && (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${scenario.backgroundImage})` }}
        />
      )}

      {/* Scores & Timer */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 z-20">
        <div className="bg-[#141414] text-white px-6 py-2 border-2 border-black font-black italic uppercase shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]">
          {mode === 'team' ? `Отбор: ${score + scoreP2}` : `P1: ${score}`}
        </div>
        <div className="bg-white text-[#141414] px-8 py-2 border-4 border-[#141414] font-black text-2xl italic uppercase shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
          {timeLeft}s
        </div>
        {mode === 'duel' && (
          <div className="bg-[#141414] text-white px-6 py-2 border-2 border-black font-black italic uppercase shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]">
            P2: {scoreP2}
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="absolute inset-y-0 left-0 w-1/4 border-r-4 border-dashed border-[#141414]/20 flex items-center justify-center pointer-events-none z-10 bg-white/5">
        <div className="rotate-[-90deg] text-5xl font-black uppercase italic opacity-40 whitespace-nowrap">
          {categories[0]}
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/4 border-l-4 border-dashed border-[#141414]/20 flex items-center justify-center pointer-events-none z-10 bg-white/5">
        <div className="rotate-[90deg] text-5xl font-black uppercase italic opacity-40 whitespace-nowrap">
          {categories[1]}
        </div>
      </div>

      {/* Falling Items */}
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1, x: `${item.x * 100}%`, y: `${item.y * 100}%` }}
            exit={{ scale: 0 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] z-10 flex flex-col items-center gap-2"
          >
            {item.image && (
              <img src={item.image} className="w-16 h-16 object-contain" />
            )}
            <span className="text-2xl font-black uppercase italic">{item.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-20">
        <div className="flex items-center gap-4 bg-[#141414] text-white px-6 py-2 border-2 border-[#00FF00] font-black uppercase italic">
          <ArrowLeftRight className="w-5 h-5" />
          Избутай обекта към правилната страна!
        </div>
      </div>
    </div>
  );
};

export default CatcherGame;
