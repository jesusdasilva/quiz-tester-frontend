'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Home, RotateCcw, Trophy, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuizSummaryProps {
  topicId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  onRestart: () => void;
}

export default function QuizSummary({ 
  totalQuestions, 
  correctAnswers, 
  incorrectAnswers, 
  onRestart 
}: QuizSummaryProps) {
  const router = useRouter();
  
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const unanswered = totalQuestions - correctAnswers - incorrectAnswers;

  const getPerformanceMessage = () => {
    if (percentage >= 90) return "¡Excelente! Dominas este tema completamente.";
    if (percentage >= 80) return "¡Muy bien! Tienes un buen conocimiento del tema.";
    if (percentage >= 70) return "¡Bien hecho! Tienes una base sólida.";
    if (percentage >= 60) return "¡Aprobado! Pero hay espacio para mejorar.";
    return "Necesitas repasar más este tema. ¡No te rindas!";
  };

  const getPerformanceColor = () => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold">¡Quiz Completado!</CardTitle>
          <p className="text-gray-600 mt-2">Has terminado todas las preguntas</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Puntuación principal */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getPerformanceColor()} mb-2`}>
              {percentage}%
            </div>
            <p className={`text-lg font-semibold ${getPerformanceColor()}`}>
              {getPerformanceMessage()}
            </p>
          </div>

          {/* Estadísticas detalladas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-green-700">Correctas</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-red-700">Incorrectas</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <BarChart3 className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{totalQuestions}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>

          {/* Información adicional */}
          {unanswered > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                <strong>Nota:</strong> {unanswered} pregunta{unanswered !== 1 ? 's' : ''} sin responder
              </p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onRestart}
              className="flex-1 flex items-center justify-center space-x-2 py-3"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Iniciar de Nuevo</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center space-x-2 py-3"
            >
              <Home className="h-4 w-4" />
              <span>Ir al Inicio</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 