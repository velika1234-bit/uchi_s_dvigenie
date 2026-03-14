import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, X, BookOpen, Calculator, Globe, Layers, Image as ImageIcon, MousePointer2, LogIn, LogOut, User as UserIcon, Pencil, RefreshCw, Navigation } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { Scenario, GameType, ScenarioItem, InteractionType } from '../types';
import { useScenarios } from '../hooks/useScenarios';
import { INTERACTION_TEMPLATES } from '../constants';

interface TeacherDashboardProps {
  onClose: () => void;
}

const PRESET_BACKGROUNDS = [
  { id: 'forest', url: 'https://picsum.photos/seed/forest/1920/1080?blur=2', label: 'Гора' },
  { id: 'space', url: 'https://picsum.photos/seed/space/1920/1080?blur=2', label: 'Космос' },
  { id: 'ocean', url: 'https://picsum.photos/seed/ocean/1920/1080?blur=2', label: 'Океан' },
  { id: 'desert', url: 'https://picsum.photos/seed/desert/1920/1080?blur=2', label: 'Пустиня' },
  { id: 'mountain', url: 'https://picsum.photos/seed/mountain/1920/1080?blur=2', label: 'Планина' },
  { id: 'city', url: 'https://picsum.photos/seed/city/1920/1080?blur=2', label: 'Град' },
];

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onClose }) => {
  const { scenarios, addScenario, deleteScenario, loading } = useScenarios();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newScenario, setNewScenario] = useState<Partial<Scenario>>({
    title: '',
    gameType: 'math',
    interactionType: 'jump_confirm',
    backgroundImage: PRESET_BACKGROUNDS[0].url,
    items: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleEdit = (scenario: Scenario) => {
    setNewScenario(scenario);
    setEditingId(scenario.id);
    setIsAdding(true);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAddItem = () => {
    const item: ScenarioItem = {
      id: Date.now().toString(),
      question: '',
      questionImage: '',
      answer: '',
      options: ['', ''],
      optionImages: ['', '']
    };
    setNewScenario(prev => ({ ...prev, items: [...(prev.items || []), item] }));
  };

  const handleSave = async () => {
    if (!user) {
      alert("Моля, влезте в профила си, за да запазвате сценарии.");
      return;
    }

    if (newScenario.title && newScenario.items?.length) {
      setIsSaving(true);
      try {
        if (editingId) {
          // Update existing
          await addScenario({
            ...newScenario,
            id: editingId
          } as Scenario);
        } else {
          // Create new
          await addScenario({
            title: newScenario.title,
            gameType: newScenario.gameType as GameType,
            interactionType: newScenario.interactionType as InteractionType,
            backgroundImage: newScenario.backgroundImage,
            items: newScenario.items as ScenarioItem[],
            isCustom: true
          });
        }
        setIsAdding(false);
        setEditingId(null);
        setNewScenario({ title: '', gameType: 'active_choice', interactionType: 'jump_confirm', items: [] });
      } catch (error) {
        alert("Грешка при запис. Проверете връзката си.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-[#141414] w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-[16px_16px_0px_0px_rgba(0,255,0,1)]"
      >
        <div className="p-6 border-b-4 border-[#141414] flex justify-between items-center bg-[#141414] text-white">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Работилница за идеи</h2>
            <span className="bg-[#00FF00] text-black px-3 py-1 text-xs font-black uppercase italic">Teacher Mode</span>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-3 bg-white/10 px-4 py-2 border border-white/20">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase opacity-50">Влязъл като</span>
                  <span className="text-xs font-bold">{user.displayName}</span>
                </div>
                {user.photoURL && <img src={user.photoURL} className="w-8 h-8 rounded-full border border-[#00FF00]" />}
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:text-[#00FF00] transition-colors"
                  title="Изход"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-[#00FF00] text-black px-4 py-2 font-black uppercase italic text-xs border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none transition-all"
              >
                <LogIn className="w-4 h-4" />
                Влез с Google
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-[#00FF00] hover:text-black transition-colors">
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-[#F5F5F5]">
          {!isAdding ? (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic">Твоите сценарии</h3>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-[#00FF00] border-2 border-[#141414] px-6 py-2 font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Нов сценарий
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarios.map(s => (
                  <div key={s.id} className="bg-white border-4 border-[#141414] p-6 flex flex-col justify-between group hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {s.gameType === 'active_choice' && <MousePointer2 className="w-5 h-5" />}
                          {s.gameType === 'quick_reaction' && <RefreshCw className="w-5 h-5" />}
                          {s.gameType === 'directional' && <Navigation className="w-5 h-5" />}
                          {s.gameType === 'catcher' && <Layers className="w-5 h-5" />}
                          <span className="text-xs font-black uppercase italic opacity-50">{s.gameType}</span>
                        </div>
                        <span className="text-xl">{INTERACTION_TEMPLATES.find(t => t.type === s.interactionType)?.icon}</span>
                      </div>
                      <h4 className="text-xl font-black uppercase italic mb-2">{s.title}</h4>
                      <p className="text-sm font-bold opacity-60 mb-4">{s.items.length} задачи • {INTERACTION_TEMPLATES.find(t => t.type === s.interactionType)?.label}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-[#141414]/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase italic opacity-40">{s.isCustom ? 'Персонализиран' : 'Системен'}</span>
                        {s.isCustom && <span className="text-[8px] font-bold opacity-30">ID: {s.id.slice(0, 8)}...</span>}
                      </div>
                      {s.isCustom && user && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(s)}
                            className="p-2 text-blue-500 hover:bg-blue-50 border-2 border-transparent hover:border-blue-500 transition-all"
                            title="Редактирай"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteScenario(s.id)}
                            className="p-2 text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500 transition-all"
                            title="Изтрий"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
              {/* Left Column: Config */}
              <div className="lg:col-span-1 space-y-10">
                <section className="space-y-6">
                  <h4 className="text-2xl font-black uppercase italic border-b-4 border-[#141414] pb-2">1. Настройки</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase italic">Заглавие</label>
                      <input 
                        type="text" 
                        value={newScenario.title}
                        onChange={e => setNewScenario(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border-4 border-[#141414] p-4 font-black focus:outline-none focus:bg-[#00FF00]/10"
                        placeholder="напр. Приключения с дроби"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase italic">Тип игра</label>
                      <select 
                        value={newScenario.gameType}
                        onChange={e => setNewScenario(prev => ({ ...prev, gameType: e.target.value as GameType }))}
                        className="w-full border-4 border-[#141414] p-4 font-black focus:outline-none"
                      >
                        <option value="active_choice">Активен избор (Наклон + Скок)</option>
                        <option value="quick_reaction">Бърза реакция (Скок/Клек)</option>
                        <option value="directional">Посоки (Посочване)</option>
                        <option value="catcher">Ловец (Сортиране)</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-2xl font-black uppercase italic border-b-4 border-[#141414] pb-2">2. Движение</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {INTERACTION_TEMPLATES.map(template => (
                      <button
                        key={template.type}
                        onClick={() => setNewScenario(prev => ({ ...prev, interactionType: template.type }))}
                        className={`p-3 border-4 transition-all flex flex-col items-center text-center gap-1 ${
                          newScenario.interactionType === template.type 
                          ? 'border-[#00FF00] bg-[#00FF00]/10 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]' 
                          : 'border-[#141414] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-2xl">{template.icon}</span>
                        <span className="text-[8px] font-black uppercase italic leading-tight">{template.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-[#141414] text-white p-4 text-[10px] font-bold italic border-l-4 border-[#00FF00]">
                    {INTERACTION_TEMPLATES.find(t => t.type === newScenario.interactionType)?.description}
                  </div>
                </section>

                <section className="space-y-6">
                  <h4 className="text-2xl font-black uppercase italic border-b-4 border-[#141414] pb-2">3. Фон</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_BACKGROUNDS.map(bg => (
                      <button
                        key={bg.id}
                        onClick={() => setNewScenario(prev => ({ ...prev, backgroundImage: bg.url }))}
                        className={`relative aspect-video border-2 overflow-hidden transition-all ${
                          newScenario.backgroundImage === bg.url ? 'border-[#00FF00] ring-2 ring-[#00FF00]' : 'border-[#141414]'
                        }`}
                      >
                        <img src={bg.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-[8px] text-white font-black uppercase">{bg.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={newScenario.backgroundImage}
                    onChange={e => setNewScenario(prev => ({ ...prev, backgroundImage: e.target.value }))}
                    className="w-full border-2 border-[#141414] p-2 text-[10px] font-bold focus:outline-none"
                    placeholder="Или постави собствен URL..."
                  />
                </section>
              </div>

              {/* Right Column: Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center border-b-4 border-[#141414] pb-2">
                  <h4 className="text-2xl font-black uppercase italic">4. Задачи</h4>
                  <button 
                    onClick={handleAddItem}
                    className="bg-[#141414] text-white px-6 py-2 text-sm font-black uppercase italic hover:bg-[#00FF00] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,255,0,1)]"
                  >
                    + Добави задача
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  {newScenario.items?.map((item, idx) => (
                    <div key={item.id} className="bg-white border-4 border-[#141414] p-6 space-y-6 relative shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                      <button 
                        onClick={() => setNewScenario(prev => ({ ...prev, items: prev.items?.filter(i => i.id !== item.id) }))}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase italic">Въпрос / Обект</label>
                          <input 
                            placeholder="напр. 5 + 5 или 'Къща'"
                            value={item.question}
                            onChange={e => {
                              const items = [...(newScenario.items || [])];
                              items[idx].question = e.target.value;
                              setNewScenario(prev => ({ ...prev, items }));
                            }}
                            className="w-full border-2 border-[#141414] p-3 font-bold"
                          />
                          <div className="flex gap-2">
                            <ImageIcon className="w-4 h-4 opacity-40 shrink-0" />
                            <input 
                              placeholder="URL на изображение (опционално)"
                              value={item.questionImage}
                              onChange={e => {
                                const items = [...(newScenario.items || [])];
                                items[idx].questionImage = e.target.value;
                                setNewScenario(prev => ({ ...prev, items }));
                              }}
                              className="w-full border-b border-[#141414] p-1 text-[10px] italic focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase italic">Верен отговор / Категория</label>
                          <input 
                            placeholder="напр. 10 или 'Съществително'"
                            value={item.answer}
                            onChange={e => {
                              const items = [...(newScenario.items || [])];
                              items[idx].answer = e.target.value;
                              setNewScenario(prev => ({ ...prev, items }));
                            }}
                            className="w-full border-2 border-[#141414] p-3 font-bold bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase italic">Опции за избор</label>
                        <div className="grid grid-cols-2 gap-4">
                          {item.options.map((opt, optIdx) => (
                            <div key={optIdx} className="space-y-2 p-3 bg-gray-50 border-2 border-[#141414]/10">
                              <input 
                                placeholder={`Опция ${optIdx + 1}`}
                                value={opt}
                                onChange={e => {
                                  const items = [...(newScenario.items || [])];
                                  items[idx].options[optIdx] = e.target.value;
                                  setNewScenario(prev => ({ ...prev, items }));
                                }}
                                className="w-full border-b-2 border-[#141414] p-1 text-sm font-bold bg-transparent focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <ImageIcon className="w-3 h-3 opacity-40 shrink-0" />
                                <input 
                                  placeholder="URL на изображение"
                                  value={item.optionImages?.[optIdx]}
                                  onChange={e => {
                                    const items = [...(newScenario.items || [])];
                                    if (!items[idx].optionImages) items[idx].optionImages = [];
                                    items[idx].optionImages![optIdx] = e.target.value;
                                    setNewScenario(prev => ({ ...prev, items }));
                                  }}
                                  className="w-full border-none p-0 text-[8px] italic bg-transparent focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-6 pt-6">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !user}
                    className={`flex-1 py-6 text-2xl font-black uppercase italic transition-all shadow-[8px_8px_0px_0px_rgba(0,255,0,1)] hover:shadow-none ${
                      isSaving || !user ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#141414] text-white hover:bg-[#00FF00] hover:text-black'
                    }`}
                  >
                    {isSaving ? 'Записване...' : !user ? 'Влезте за запис' : 'Запази сценария'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsAdding(false);
                      setEditingId(null);
                      setNewScenario({ title: '', gameType: 'active_choice', interactionType: 'jump_confirm', items: [] });
                    }}
                    className="px-12 border-4 border-[#141414] font-black uppercase italic hover:bg-white transition-all"
                  >
                    Отказ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border: 2px solid #141414;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #141414;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00FF00;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;
