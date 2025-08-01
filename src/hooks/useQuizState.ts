import { useState, useEffect, useCallback } from 'react';

interface UserAnswer {
  questionNumber: number;
  selectedAnswers: number[]; // Ahora son IDs de opciones, no posiciones
  isCorrect: boolean;
  answered: boolean;
}

interface QuizState {
  userAnswers: UserAnswer[];
  totalQuestions: number;
}

export function useQuizState(topicId: string) {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Clave única para localStorage basada en el topicId
  const storageKey = `quiz_state_${topicId}`;

  // Verificar que estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar estado desde localStorage al inicializar
  useEffect(() => {
    if (!isClient) return;

    // Limpiar estado anterior al cambiar de tema
    setUserAnswers([]);
    setTotalQuestions(0);
    setIsInitialized(false);
    
    try {
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        const parsedState: QuizState = JSON.parse(savedState);
        setUserAnswers(parsedState.userAnswers || []);
        setTotalQuestions(parsedState.totalQuestions || 0);
      } else {
        // Si no hay estado guardado, limpiar todo
        setUserAnswers([]);
        setTotalQuestions(0);
      }
    } catch (error) {
      console.error('Error loading quiz state from localStorage:', error);
      setUserAnswers([]);
      setTotalQuestions(0);
    } finally {
      setIsInitialized(true);
    }
  }, [topicId, storageKey, isClient]);

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    if (!isClient || !isInitialized) return;

    try {
      const stateToSave: QuizState = {
        userAnswers,
        totalQuestions
      };
      
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Error saving quiz state to localStorage:', error);
    }
  }, [userAnswers, totalQuestions, storageKey, isClient, isInitialized]);

  // Registrar una respuesta del usuario
  const recordAnswer = useCallback((questionNumber: number, selectedAnswers: number[], correctAnswers: number[]) => {
    const isCorrect = selectedAnswers.length === correctAnswers.length &&
      selectedAnswers.every(answer => correctAnswers.includes(answer));

    setUserAnswers(prev => {
      const existing = prev.find(answer => answer.questionNumber === questionNumber);
      const newAnswers = existing 
        ? prev.map(answer => 
            answer.questionNumber === questionNumber 
              ? { ...answer, selectedAnswers, isCorrect, answered: true }
              : answer
          )
        : [...prev, { questionNumber, selectedAnswers, isCorrect, answered: true }];
      
      return newAnswers;
    });
  }, []);

  // Actualizar el total de preguntas
  const updateTotalQuestions = useCallback((total: number) => {
    setTotalQuestions(total);
  }, []);

  // Obtener estadísticas del quiz
  const getQuizStats = useCallback(() => {
    const answeredQuestions = userAnswers.filter(answer => answer.answered);
    const correctAnswers = answeredQuestions.filter(answer => answer.isCorrect).length;
    const incorrectAnswers = answeredQuestions.filter(answer => !answer.isCorrect).length;
    const unanswered = totalQuestions - answeredQuestions.length;

    const stats = {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered,
      answeredQuestions: answeredQuestions.length,
      percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    };

    return stats;
  }, [userAnswers, totalQuestions]);

  // Verificar si una pregunta específica fue respondida
  const isQuestionAnswered = useCallback((questionNumber: number) => {
    return userAnswers.some(answer => answer.questionNumber === questionNumber && answer.answered);
  }, [userAnswers]);

  // Obtener la respuesta de una pregunta específica
  const getQuestionAnswer = useCallback((questionNumber: number) => {
    return userAnswers.find(answer => answer.questionNumber === questionNumber);
  }, [userAnswers]);

  // Reiniciar el quiz
  const resetQuiz = useCallback(() => {
    setUserAnswers([]);
    setTotalQuestions(0);
    // Limpiar localStorage
    if (isClient) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
  }, [isClient, storageKey]);

  // Limpiar estado de otros temas
  const clearOtherTopics = useCallback(() => {
    if (!isClient) return;
    
    try {
      // Obtener todas las claves de localStorage
      const keys = Object.keys(localStorage);
      const quizKeys = keys.filter(key => key.startsWith('quiz_state_') && key !== storageKey);
      
      // Eliminar estados de otros temas
      quizKeys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing other topics:', error);
    }
  }, [isClient, storageKey]);

  return {
    userAnswers,
    totalQuestions,
    recordAnswer,
    updateTotalQuestions,
    getQuizStats,
    isQuestionAnswered,
    getQuestionAnswer,
    resetQuiz,
    clearOtherTopics,
    isInitialized
  };
} 