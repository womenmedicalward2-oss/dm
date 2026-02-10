
import React from 'react';
import { FoodItem, FoodCategory } from '../types';

interface FeedbackModalProps {
  food: FoodItem;
  isCorrect: boolean;
  onNext: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ food, isCorrect, onNext }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-bounce-subtle`}>
        <div className={`p-6 text-white text-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="text-6xl mb-2">{isCorrect ? '✅' : '❌'}</div>
          <h2 className="text-3xl font-bold">{isCorrect ? 'ถูกต้อง!' : 'ยังไม่ถูกนะ'}</h2>
        </div>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
             <img src={food.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow" alt="" />
             <div>
                <h3 className="font-bold text-xl text-gray-800">{food.name}</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                  food.category === FoodCategory.RECOMMENDED ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {food.category === FoodCategory.RECOMMENDED ? 'ควรรับประทาน' : 'ควรหลีกเลี่ยง'}
                </span>
             </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-2xl mb-6">
            <h4 className="font-bold text-gray-700 mb-1">เหตุผล:</h4>
            <p className="text-gray-600 leading-relaxed italic">"{food.reason}"</p>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl shadow-lg transition-colors active:scale-95"
          >
            ข้อต่อไป
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
