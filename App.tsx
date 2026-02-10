
import React, { useState, useEffect, useCallback } from 'react';
import { FoodItem, FoodCategory, GameState } from './types';
import { generateFoodItems, generateFoodImage } from './services/geminiService';
import FoodCard from './components/FoodCard';
import FeedbackModal from './components/FeedbackModal';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentIndex: 0,
    foods: [],
    isGameOver: false,
    history: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentFeedback, setCurrentFeedback] = useState<{ isCorrect: boolean; food: FoodItem } | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const initGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const foods = await generateFoodItems();
      // Initially load only the first 2 images to start quickly
      const foodsWithImages = await Promise.all(
        foods.map(async (food, idx) => {
          if (idx < 2) {
             const imageUrl = await generateFoodImage(food.imagePrompt);
             return { ...food, imageUrl };
          }
          return food;
        })
      );
      
      setGameState({
        score: 0,
        currentIndex: 0,
        foods: foodsWithImages,
        isGameOver: false,
        history: []
      });

      // Lazy load the rest of the images
      foodsWithImages.forEach(async (food, idx) => {
        if (idx >= 2) {
          const imageUrl = await generateFoodImage(food.imagePrompt);
          setGameState(prev => ({
            ...prev,
            foods: prev.foods.map(f => f.id === food.id ? { ...f, imageUrl } : f)
          }));
        }
      });

    } catch (error) {
      console.error("Failed to load game content", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isGameStarted) {
      initGame();
    }
  }, [isGameStarted, initGame]);

  const handleChoice = (choice: FoodCategory) => {
    const currentFood = gameState.foods[gameState.currentIndex];
    const isCorrect = choice === currentFood.category;

    setCurrentFeedback({ isCorrect, food: currentFood });
    
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      history: [...prev.history, { food: currentFood, userChoice: choice, isCorrect }]
    }));
  };

  const nextTurn = () => {
    setCurrentFeedback(null);
    if (gameState.currentIndex + 1 >= gameState.foods.length) {
      setGameState(prev => ({ ...prev, isGameOver: true }));
    } else {
      setGameState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };

  const restartGame = () => {
    setGameState({
      score: 0,
      currentIndex: 0,
      foods: [],
      isGameOver: false,
      history: []
    });
    setIsGameStarted(true);
  };

  if (!isGameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col items-center justify-center p-4 text-white text-center">
        <div className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-lg">
          <div className="text-8xl mb-6">🍎🥦</div>
          <h1 className="text-5xl font-bold mb-4">Diabetes Food Hero</h1>
          <p className="text-xl mb-8 opacity-90">
            มาทดสอบความรู้กัน! คุณเลือกอาหารที่ "ดีต่อเบาหวาน" ได้ถูกต้องแค่ไหน?
          </p>
          <button
            onClick={() => setIsGameStarted(true)}
            className="px-12 py-5 bg-white text-blue-600 rounded-full text-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            เริ่มเล่นเลย!
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
        <div className="w-20 h-20 border-8 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <p className="text-2xl font-semibold text-blue-800 animate-pulse">
          กำลังเตรียมเมนูสุขภาพจาก AI...
        </p>
      </div>
    );
  }

  if (gameState.isGameOver) {
    const percentage = Math.round((gameState.score / gameState.foods.length) * 100);
    return (
      <div className="min-h-screen bg-green-50 p-6 flex flex-col items-center overflow-y-auto">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">จบการทดสอบ!</h1>
          <p className="text-gray-600 text-xl mb-6">คุณคือฮีโร่ด้านสุขภาพในระดับ...</p>
          
          <div className="relative inline-block mb-8">
            <svg className="w-48 h-48">
              <circle cx="96" cy="96" r="80" stroke="#f3f4f6" strokeWidth="16" fill="transparent" />
              <circle 
                cx="96" cy="96" r="80" stroke="#3b82f6" strokeWidth="16" fill="transparent" 
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={(2 * Math.PI * 80) * (1 - percentage / 100)}
                strokeLinecap="round"
                transform="rotate(-90 96 96)"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-blue-600">{gameState.score}/{gameState.foods.length}</span>
              <span className="text-gray-400 font-bold">{percentage}%</span>
            </div>
          </div>

          <div className="text-left space-y-4 mb-8">
             <h3 className="font-bold text-xl text-gray-700">ประวัติการเลือก:</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gameState.history.map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border flex items-center gap-3 ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="text-2xl">{item.isCorrect ? '✅' : '❌'}</span>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{item.food.name}</div>
                      <div className="text-xs text-gray-500 italic truncate w-40">{item.food.reason}</div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <button
            onClick={restartGame}
            className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-2xl shadow-lg transition-transform active:scale-95"
          >
            เล่นอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const currentFood = gameState.foods[gameState.currentIndex];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-between py-8 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>

      {/* Header Info */}
      <div className="w-full max-w-xl flex justify-between items-center mb-6 z-10">
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-green-100">
           <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">คะแนนปัจจุบัน</span>
           <div className="text-2xl font-bold text-green-600">{gameState.score} แต้ม</div>
        </div>
        <div className="bg-white/80 backdrop-blur px-6 py-2 rounded-full shadow-sm border border-blue-100">
           <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">อาหารชิ้นที่</span>
           <div className="text-2xl font-bold text-blue-600">{gameState.currentIndex + 1} / {gameState.foods.length}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xl bg-gray-200 h-3 rounded-full mb-8 overflow-hidden z-10">
        <div 
          className="bg-blue-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${((gameState.currentIndex + 1) / gameState.foods.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Game Card */}
      <div className="flex-1 flex items-center justify-center w-full z-10">
        <FoodCard food={currentFood} />
      </div>

      {/* Control Buttons */}
      <div className="w-full max-w-xl grid grid-cols-2 gap-6 mt-10 z-10">
        <button
          onClick={() => handleChoice(FoodCategory.RECOMMENDED)}
          className="group relative flex flex-col items-center justify-center p-8 bg-white hover:bg-green-50 border-b-8 border-green-600 rounded-3xl shadow-xl transition-all hover:-translate-y-2 active:translate-y-0"
        >
          <span className="text-5xl mb-2 group-hover:scale-125 transition-transform">🥗</span>
          <span className="text-xl font-black text-green-700">ควรรับประทาน</span>
        </button>

        <button
          onClick={() => handleChoice(FoodCategory.AVOID)}
          className="group relative flex flex-col items-center justify-center p-8 bg-white hover:bg-red-50 border-b-8 border-red-600 rounded-3xl shadow-xl transition-all hover:-translate-y-2 active:translate-y-0"
        >
          <span className="text-5xl mb-2 group-hover:scale-125 transition-transform">🚫</span>
          <span className="text-xl font-black text-red-700">ควรหลีกเลี่ยง</span>
        </button>
      </div>

      {/* Footer Text */}
      <p className="mt-8 text-gray-400 font-medium text-center z-10">
        เคล็ดลับ: อาหารที่มีกากใยสูงและน้ำตาลต่ำดีต่อผู้ป่วยเบาหวาน
      </p>

      {/* Feedback Overlay */}
      {currentFeedback && (
        <FeedbackModal 
          food={currentFeedback.food} 
          isCorrect={currentFeedback.isCorrect} 
          onNext={nextTurn} 
        />
      )}
    </div>
  );
};

export default App;
