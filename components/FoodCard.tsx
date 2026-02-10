
import React from 'react';
import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  loading?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({ food, loading }) => {
  if (loading) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
        <div className="w-full aspect-square bg-gray-200"></div>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105 border-4 border-white">
      <div className="relative aspect-square">
        {food.imageUrl ? (
          <img 
            src={food.imageUrl} 
            alt={food.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-50 flex items-center justify-center">
             <span className="text-blue-200 text-6xl">🍲</span>
          </div>
        )}
      </div>
      <div className="p-6 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{food.name}</h2>
        <p className="text-gray-600 text-lg leading-relaxed">{food.description}</p>
      </div>
    </div>
  );
};

export default FoodCard;
