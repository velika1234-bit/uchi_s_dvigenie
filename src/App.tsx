/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, BookOpen, Globe, Trophy, Play, RefreshCw, ChevronLeft, Camera, Settings, Users, User, Layers, PlusCircle, MousePointer2, Navigation } from 'lucide-react';
import { GAMES } from './constants';
import { GameType, Scenario } from './types';
import ActiveChoiceGame from './components/ActiveChoiceGame';
import QuickReactionGame from './components/QuickReactionGame';
import DirectionalGame from './components/DirectionalGame';
import CatcherGame from './components/CatcherGame';
import PoseDetector from './components/PoseDetector';
import TeacherDashboard from './components/TeacherDashboard';
import GameOver from './components/GameOver';
import { useScenarios } from './hooks/useScenarios';

export default function App() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [gameMode, setGameMode] = useState<'single' | 'duel' | 'team'>('single');
  const [poses, setPoses] = useState<any[]>([]);
  const [showTeacherPanel, setShowTeacherPanel] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const [gameState, setGameState] = useState<{ status: 'idle' | 'playing' | 'finished'; score: number; scoreP2: number }>({
    status: 'idle',
    score: 0,
    scoreP2: 0
  });
  const { scenarios } = useScenarios();

  const handlePoseUpdate = useCallback((results: any) => {
    if (results.landmarks) {
      setPoses(results.landmarks);
    }
  }, []);

  const handleGameFinish = (s1: number, s2?: number) => {
    setGameState({
      status: 'finished',
      score: s1,
      scoreP2: s2 || 0
    });
  };

  const resetGame = () => {
    setSessionKey(prev => prev + 1);
    setGameState({ status: 'playing', score: 0, scoreP2: 0 });
  };

  const goToMenu = () => {
    setActiveGame(null);
    setSelectedScenario(null);
    setGameState({ status: 'idle', score: 0, scoreP2: 0 });
  };

  const startGame = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSessionKey(prev => prev + 1);
    setGameState({ status: 'playing', score: 0, scoreP2: 0 });
  };

  const filteredScenarios = scenarios.filter(s => s.gameType === activeGame);

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#141414] font-sans selection:bg-[#00FF00] selection:text-black">
      {/* Header */}
      <header className="border-b-4 border-[#141414] p-6 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="bg-[#00FF00] p-2 border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <Trophy className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Учи с движение</h1>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setShowTeacherPanel(true)}
            className="px-4 py-2 bg-white border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
          >
            <PlusCircle className="w-4 h-4" />
            Учителски панел
          </button>
          
          {activeGame && (
            <button 
              onClick={() => { setActiveGame(null); setSelectedScenario(null); }}
              className="px-4 py-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-colors flex items-center gap-2 font-black uppercase text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Меню
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {!activeGame ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-12"
            >
              <div className="sm:col-span-2 lg:col-span-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <h2 className="text-7xl font-black uppercase leading-none mb-4 italic">
                    Учи се чрез <br/><span className="text-[#00FF00] stroke-black stroke-1">движение</span>
                  </h2>
                  <p className="text-xl font-medium opacity-70 max-w-2xl">
                    Избери игра и се забавлявай сам или с приятел!
                  </p>
                </div>
                
                <div className="flex bg-white border-4 border-[#141414] p-1 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                  <button 
                    onClick={() => setGameMode('single')}
                    className={`px-6 py-3 flex items-center gap-2 font-black uppercase italic transition-colors ${gameMode === 'single' ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'}`}
                  >
                    <User className="w-5 h-5" /> 1 Играч
                  </button>
                  <button 
                    onClick={() => setGameMode('duel')}
                    className={`px-6 py-3 flex items-center gap-2 font-black uppercase italic transition-colors ${gameMode === 'duel' ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Users className="w-5 h-5" /> Дуел
                  </button>
                  <button 
                    onClick={() => setGameMode('team')}
                    className={`px-6 py-3 flex items-center gap-2 font-black uppercase italic transition-colors ${gameMode === 'team' ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Users className="w-5 h-5 text-[#00FF00]" /> Отбор
                  </button>
                </div>
              </div>

              {GAMES.map((game) => (
                <motion.button
                  key={game.id}
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveGame(game.id)}
                  className="group relative bg-white border-4 border-[#141414] p-8 text-left shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <div className={`w-16 h-16 ${game.color} border-2 border-[#141414] flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                    {game.id === 'active_choice' && <MousePointer2 className="w-8 h-8 text-white" />}
                    {game.id === 'quick_reaction' && <RefreshCw className="w-8 h-8 text-white" />}
                    {game.id === 'directional' && <Navigation className="w-8 h-8 text-white" />}
                    {game.id === 'catcher' && <Layers className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-2xl font-black uppercase mb-2 italic">{game.title}</h3>
                  <p className="font-medium opacity-60 mb-6">{game.description}</p>
                  <div className="flex items-center gap-2 font-bold uppercase text-sm group-hover:text-[#00FF00] transition-colors">
                    <Play className="w-4 h-4 fill-current" />
                    Избери сценарий
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : !selectedScenario ? (
            <motion.div 
              key="scenarios"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="pt-12 space-y-8"
            >
              <h2 className="text-4xl font-black uppercase italic">Избери сценарий за {GAMES.find(g => g.id === activeGame)?.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScenarios.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => startGame(s)}
                    className="bg-white border-4 border-[#141414] p-6 text-left shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:bg-[#00FF00] transition-all"
                  >
                    <h3 className="text-xl font-black uppercase italic mb-2">{s.title}</h3>
                    <p className="text-sm font-bold opacity-60">{s.items.length} задачи</p>
                  </button>
                ))}
                {filteredScenarios.length === 0 && (
                  <div className="col-span-full p-12 border-4 border-dashed border-[#141414]/20 text-center">
                    <p className="font-black uppercase italic opacity-40">Няма намерени сценарии. Създай нов от Учителския панел!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] min-h-[600px] relative overflow-hidden">
                  {activeGame === 'active_choice' && <ActiveChoiceGame key={sessionKey} poses={poses} scenario={selectedScenario} onExit={goToMenu} onFinish={handleGameFinish} mode={gameMode} />}
                  {activeGame === 'catcher' && <CatcherGame key={sessionKey} poses={poses} scenario={selectedScenario} onExit={goToMenu} onFinish={handleGameFinish} mode={gameMode} />}
                  {activeGame === 'quick_reaction' && <QuickReactionGame key={sessionKey} poses={poses} scenario={selectedScenario} onExit={goToMenu} onFinish={handleGameFinish} mode={gameMode} />}
                  {activeGame === 'directional' && <DirectionalGame key={sessionKey} poses={poses} scenario={selectedScenario} onExit={goToMenu} onFinish={handleGameFinish} mode={gameMode} />}
                  
                  {gameState.status === 'finished' && (
                    <GameOver 
                      score={gameState.score} 
                      scoreP2={gameState.scoreP2} 
                      mode={gameMode} 
                      onRestart={resetGame} 
                      onMenu={goToMenu} 
                    />
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#141414] border-4 border-[#141414] p-4 shadow-[12px_12px_0px_0px_rgba(0,255,0,0.3)] aspect-video relative overflow-hidden">
                  <PoseDetector onPoseUpdate={handlePoseUpdate} />
                  <div className="absolute top-4 left-4 bg-[#00FF00] px-2 py-1 text-[10px] font-bold uppercase border border-black">
                    {gameMode === 'duel' ? 'Duel Tracking Active' : 'Single Tracking Active'}
                  </div>
                </div>

                <div className="bg-white border-4 border-[#141414] p-6 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
                  <h4 className="font-black uppercase italic mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Инструкции за {gameMode === 'duel' ? 'Дуел' : 'Игра'}
                  </h4>
                  <ul className="space-y-3 text-sm font-medium">
                    <li className="flex gap-3">
                      <span className="bg-[#00FF00] w-6 h-6 flex items-center justify-center border border-black text-[10px] shrink-0">01</span>
                      {gameMode === 'duel' ? 'Застанете двамата един до друг.' : 'Застани сам в центъра.'}
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-[#00FF00] w-6 h-6 flex items-center justify-center border border-black text-[10px] shrink-0">02</span>
                      AI ще разпознае и двамата играчи автоматично.
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {showTeacherPanel && <TeacherDashboard onClose={() => setShowTeacherPanel(false)} />}

      <footer className="fixed bottom-0 w-full bg-[#141414] text-white py-2 overflow-hidden border-t-4 border-[#141414]">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 font-black uppercase italic text-sm tracking-widest">
              Учи с движение • Образование чрез движение • AI Pose Detection • Математика • Български • География • Сортиране •
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
