import { GameType, Scenario, InteractionType } from './types';

export const INTERACTION_TEMPLATES: { type: InteractionType; label: string; description: string; icon: string }[] = [
  { 
    type: 'jump_confirm', 
    label: 'Скок за избор', 
    description: 'Играчът скача, за да избере активния отговор.', 
    icon: '🚀' 
  },
  { 
    type: 'squat_confirm', 
    label: 'Клек за потвърждение', 
    description: 'Клякане за избор на отговор или действие.', 
    icon: '🧘' 
  },
  { 
    type: 'hand_swipe', 
    label: 'Замахване с ръка', 
    description: 'Движение на ръцете наляво/надясно за сортиране.', 
    icon: '👋' 
  },
  { 
    type: 't_pose', 
    label: 'Т-поза', 
    description: 'Разперени ръце за баланс или специално действие.', 
    icon: '🙌' 
  },
  { 
    type: 'balance', 
    label: 'Баланс на един крак', 
    description: 'Задържане на равновесие за време.', 
    icon: '⚖️' 
  },
  { 
    type: 'lean_select', 
    label: 'Наклон на тялото', 
    description: 'Накланяне наляво или надясно за навигация.', 
    icon: '↔️' 
  },
];

export const GAMES = [
  {
    id: 'active_choice' as GameType,
    title: 'Активен избор',
    description: 'Избери отговор чрез накланяне и потвърди със скок или клек!',
    icon: 'MousePointer2',
    color: 'bg-blue-500',
  },
  {
    id: 'quick_reaction' as GameType,
    title: 'Бърза реакция',
    description: 'Свържи конкретно действие (скок/клек) с правилния отговор!',
    icon: 'Zap',
    color: 'bg-emerald-500',
  },
  {
    id: 'directional' as GameType,
    title: 'Посоки',
    description: 'Посочи вярната посока с ръце!',
    icon: 'Navigation',
    color: 'bg-amber-500',
  },
  {
    id: 'catcher' as GameType,
    title: 'Ловец',
    description: 'Хвани и сортирай падащите обекти в правилната категория!',
    icon: 'Layers',
    color: 'bg-purple-500',
  },
];

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'math-basic',
    title: 'Математическо предизвикателство',
    gameType: 'active_choice',
    interactionType: 'jump_confirm',
    backgroundImage: 'https://picsum.photos/seed/math/1920/1080?blur=2',
    items: [
      { id: '1', question: '5 + 3', answer: '8', options: ['8', '10'] },
      { id: '2', question: '12 + 4', answer: '16', options: ['14', '16'] },
    ]
  },
  {
    id: 'sorting-grammar',
    title: 'Езиков ловец',
    gameType: 'catcher',
    interactionType: 'hand_swipe',
    backgroundImage: 'https://picsum.photos/seed/forest/1920/1080?blur=2',
    items: [
      { id: 's1', question: 'Книга', answer: 'Съществително', options: ['Съществително', 'Прилагателно'] },
      { id: 's2', question: 'Красив', answer: 'Прилагателно', options: ['Съществително', 'Прилагателно'] },
      { id: 's3', question: 'Бягам', answer: 'Глагол', options: ['Глагол', 'Съществително'] },
    ]
  },
  {
    id: 'team-ocean',
    title: 'Еко патрул (Отборна)',
    gameType: 'catcher',
    interactionType: 'hand_swipe',
    backgroundImage: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&q=80&w=1920',
    items: [
      { id: 'o1', question: 'Пластмасова бутилка', answer: 'Отпадък', options: ['Отпадък', 'Риба'], questionImage: 'https://cdn-icons-png.flaticon.com/512/3159/3159614.png' },
      { id: 'o2', question: 'Делфин', answer: 'Риба', options: ['Отпадък', 'Риба'], questionImage: 'https://cdn-icons-png.flaticon.com/512/2395/2395796.png' },
      { id: 'o3', question: 'Найлонова торбичка', answer: 'Отпадък', options: ['Отпадък', 'Риба'], questionImage: 'https://cdn-icons-png.flaticon.com/512/2666/2666631.png' },
      { id: 'o4', question: 'Костенурка', answer: 'Риба', options: ['Отпадък', 'Риба'], questionImage: 'https://cdn-icons-png.flaticon.com/512/2395/2395807.png' },
    ]
  }
];

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 4,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};
