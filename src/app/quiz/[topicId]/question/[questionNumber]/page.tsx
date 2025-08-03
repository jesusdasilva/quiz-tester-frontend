'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuestionByNumber, QuestionResponse, QuestionOption } from '@/services/quizApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Languages, BarChart3 } from 'lucide-react';
import { useQuizState } from '@/hooks/useQuizState';
import QuizSummary from '@/components/QuizSummary';
import QuizProgress from '@/components/QuizProgress';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.topicId as string;
  const questionNumber = parseInt(params.questionNumber as string) || 1;
  
  const [questionData, setQuestionData] = useState<QuestionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [showSummary, setShowSummary] = useState(false);
  const [statsUpdateTrigger, setStatsUpdateTrigger] = useState(0);

  // Hook para manejar el estado del quiz
  const {
    recordAnswer,
    updateTotalQuestions,
    getQuizStats,
    getQuestionAnswer,
    resetQuiz,
    isInitialized
  } = useQuizState(topicId);

  const loadQuestion = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedAnswers([]);
      setShowResults(false);
      
      const data = await getQuestionByNumber(topicId, questionNumber);
      setQuestionData(data);
      
      // Actualizar el total de preguntas
      updateTotalQuestions(data.navigation.total);
      
      // Cargar respuesta previa si existe
      const previousAnswer = getQuestionAnswer(questionNumber);
      if (previousAnswer) {
        setSelectedAnswers(previousAnswer.selectedAnswers);
        setShowResults(true);
      }
    } catch {
      setError('Error al cargar la pregunta. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [topicId, questionNumber, updateTotalQuestions, getQuestionAnswer]);

  useEffect(() => {
    if (topicId && questionNumber) {
      loadQuestion();
    }
  }, [topicId, questionNumber, loadQuestion]);

  // Forzar re-render cuando se actualicen las estadísticas
  useEffect(() => {
    // Este efecto se ejecuta cuando cambia statsUpdateTrigger
  }, [statsUpdateTrigger]);

  const handleAnswerSelect = (optionId: number) => {
    if (showResults || !questionData) return; // No permitir cambios después de revisar
    
    const isMultipleChoice = questionData.question.correct_answers?.length > 1;
    
    if (isMultipleChoice) {
      // Selección múltiple
      setSelectedAnswers(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Selección simple
      setSelectedAnswers([optionId]);
    }
  };

  const handleReviewAnswer = () => {
    if (selectedAnswers.length === 0) {
      alert('Por favor selecciona al menos una respuesta antes de revisar.');
      return;
    }
    
    if (!questionData) return;
    
    // Registrar la respuesta del usuario
    recordAnswer(
      questionNumber,
      selectedAnswers,
      questionData.question.correct_answers || []
    );
    
    // Forzar actualización de estadísticas
    setStatsUpdateTrigger(prev => prev + 1);
    setShowResults(true);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!questionData) return;
    
    const targetNumber = direction === 'prev' 
      ? questionData.navigation.previousNumber 
      : questionData.navigation.nextNumber;
    
    router.push(`/quiz/${topicId}/question/${targetNumber}`);
  };

  const handleShowSummary = () => {
    setShowSummary(true);
  };

  const handleRestartQuiz = () => {
    resetQuiz();
    setShowSummary(false);
    router.push(`/quiz/${topicId}/question/1`);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'es' ? 'en' : 'es');
  };

  const isAnswerCorrect = (optionId: number) => {
    return questionData?.question.correct_answers?.includes(optionId) || false;
  };

  const isAnswerSelected = (optionId: number) => {
    return selectedAnswers.includes(optionId);
  };

  const getAnswerStyle = (optionId: number) => {
    if (!showResults) {
      return isAnswerSelected(optionId) 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-gray-200 hover:border-gray-300';
    }

    if (isAnswerCorrect(optionId)) {
      return 'border-green-500 bg-green-50';
    } else if (isAnswerSelected(optionId) && !isAnswerCorrect(optionId)) {
      return 'border-red-500 bg-red-50';
    }
    
    return 'border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pregunta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadQuestion}>Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No se encontró la pregunta</p>
      </div>
    );
  }

  const currentLocale = questionData.question.locales[language];
  const isMultipleChoice = questionData.question.correct_answers?.length > 1;
  const isLastQuestion = !questionData.navigation.hasNext;
  const stats = getQuizStats();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-4xl">
        {/* Header con navegación y cambio de idioma */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/quiz/${topicId}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Quiz</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* <div className="text-sm text-gray-600">
              Pregunta {questionData.navigation.current} de {questionData.navigation.total}
            </div> */}
            <Button
              variant="outline"
              onClick={toggleLanguage}
              className="flex items-center space-x-2"
            >
              <Languages className="h-4 w-4" />
              <span>{language === 'es' ? 'EN' : 'ES'}</span>
            </Button>
          </div>
        </div>

        {/* Componente de progreso */}
        {isInitialized && (
          <QuizProgress
            currentQuestion={questionData.navigation.current}
            totalQuestions={questionData.navigation.total}
            correctAnswers={stats.correctAnswers}
            incorrectAnswers={stats.incorrectAnswers}
            answeredQuestions={stats.answeredQuestions}
          />
        )}

        {/* Tarjeta principal de la pregunta */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {currentLocale.question}
            </CardTitle>
            <div className="text-sm text-gray-500">
              {isMultipleChoice ? 'Selección múltiple' : 'Selección única'}
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Opciones de respuesta */}
            <div className="space-y-3 mb-6">
              {currentLocale.options.map((option: QuestionOption) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(option.id)}
                  disabled={showResults}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                    getAnswerStyle(option.id)
                  } ${showResults ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{option.text}</span>
                    {showResults && (
                      <div className="ml-3">
                        {isAnswerCorrect(option.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isAnswerSelected(option.id) && !isAnswerCorrect(option.id) ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Botón de revisar respuesta */}
            {!showResults && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleReviewAnswer}
                  disabled={selectedAnswers.length === 0}
                  className="px-8 py-2"
                >
                  Revisar Respuesta
                </Button>
              </div>
            )}

            {/* Explicación */}
            {showResults && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Explicación:</h4>
                <p className="text-blue-700">{currentLocale.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegación */}
        {showResults && (
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleNavigation('prev')}
              disabled={!questionData.navigation.hasPrevious}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </Button>
            
            {isLastQuestion ? (
              <Button
                onClick={handleShowSummary}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Ver Resumen</span>
              </Button>
            ) : (
              <Button
                onClick={() => handleNavigation('next')}
                disabled={!questionData.navigation.hasNext}
                className="flex items-center space-x-2"
              >
                <span>Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de resumen */}
      {showSummary && (
        <QuizSummary
          topicId={topicId}
          totalQuestions={stats.totalQuestions}
          correctAnswers={stats.correctAnswers}
          incorrectAnswers={stats.incorrectAnswers}
          onRestart={handleRestartQuiz}
        />
      )}
    </main>
  );
} 