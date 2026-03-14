export type GameType = 'active_choice' | 'quick_reaction' | 'directional' | 'catcher' | 'custom';

export type InteractionType = 
  | 'jump_confirm' 
  | 'squat_confirm' 
  | 'hand_swipe' 
  | 't_pose' 
  | 'balance' 
  | 'lean_select';

export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseData {
  landmarks: Point[];
  worldLandmarks?: Point[];
}

export interface ScenarioItem {
  id: string;
  question: string;
  questionImage?: string;
  answer: string;
  options: string[];
  optionImages?: string[];
  category?: string;
}

export interface Scenario {
  id: string;
  title: string;
  gameType: GameType;
  interactionType: InteractionType;
  backgroundImage?: string;
  items: ScenarioItem[];
  isCustom?: boolean;
}

export interface GameState {
  score: number;
  scoreP2?: number;
  level: number;
  status: 'idle' | 'playing' | 'finished';
  mode: 'single' | 'duel' | 'team';
}
