
export enum FoodCategory {
  RECOMMENDED = 'RECOMMENDED', // ควรทาน
  AVOID = 'AVOID', // ควรหลีกเลี่ยง
}

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  reason: string;
}

export interface GameState {
  score: number;
  currentIndex: number;
  foods: FoodItem[];
  isGameOver: boolean;
  history: {
    food: FoodItem;
    userChoice: FoodCategory;
    isCorrect: boolean;
  }[];
}
