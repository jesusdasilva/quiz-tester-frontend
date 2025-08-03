'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizTopics, QuizTopic } from '@/services/quizApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play } from 'lucide-react';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<QuizTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startQuestion, setStartQuestion] = useState<number>(1);

  useEffect(() => {
    if (topicId) {
      async function loadTopic() {
        try {
          const topics = await getQuizTopics();
          const currentTopic = topics.find(t => t.id === topicId);
          if (currentTopic) {
            setTopic(currentTopic);
          } else {
            setError('Tema no encontrado');
          }
        } catch {
          setError('Error al cargar el tema. Por favor intenta de nuevo.');
        }
        setLoading(false);
      }

      loadTopic();
    }
  }, [topicId]);

  const handleStartFromCustom = () => {
    if (startQuestion >= 1 && startQuestion <= (topic?.questions_count || 1)) {
      startNewQuiz();
    }
  };

  const startNewQuiz = () => {
    // Limpiar el estado del quiz anterior y otros temas
    const storageKey = `quiz_state_${topicId}`;
    try {
      // Limpiar estado del tema actual
      localStorage.removeItem(storageKey);
      
      // Limpiar estados de otros temas para evitar conflictos
      const keys = Object.keys(localStorage);
      const otherQuizKeys = keys.filter(key => key.startsWith('quiz_state_') && key !== storageKey);
      otherQuizKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing quiz state:', error);
    }
    
    router.push(`/quiz/${topicId}/question/${startQuestion}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Tema no encontrado</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        {/* Header con botón de volver */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Button>
        </div>

        {/* Tarjeta principal del tema */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {topic.name}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6 text-lg">
              {topic.description}
            </p>
            
            {topic.questions_count && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-semibold">
                  Este quiz contiene {topic.questions_count} pregunta{topic.questions_count !== 1 ? 's' : ''}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 font-medium">Comenzar desde la pregunta:</span>
                <input
                  type="number"
                  min="1"
                  max={topic?.questions_count || 1}
                  value={startQuestion}
                  onChange={(e) => setStartQuestion(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  placeholder="1"
                />
              </div>
              
              <Button 
                onClick={handleStartFromCustom}
                size="lg"
                disabled={startQuestion < 1 || startQuestion > (topic?.questions_count || 1)}
                className="w-full py-3 text-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Comenzar Quiz</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


    </main>
  );
}
