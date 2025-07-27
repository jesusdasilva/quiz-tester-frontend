'use client';

import { BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  answeredQuestions: number;
}

export default function QuizProgress({
  currentQuestion,
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  answeredQuestions
}: QuizProgressProps) {
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Progreso del Quiz</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BarChart3 className="h-4 w-4" />
          <span>{answeredQuestions} de {totalQuestions} respondidas</span>
        </div>
      </div>
      
      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Estadísticas rápidas */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>{correctAnswers} correctas</span>
        </div>
        <div className="flex items-center space-x-1 text-red-600">
          <XCircle className="h-3 w-3" />
          <span>{incorrectAnswers} incorrectas</span>
        </div>
        <div className="text-gray-500">
          Pregunta {currentQuestion} de {totalQuestions}
        </div>
      </div>
    </div>
  );
} 