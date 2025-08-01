export interface QuizTopic {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  questions_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TopicsResponse {
  topics: QuizTopic[];
  total_topics: number;
  total_questions: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

// Nuevas interfaces para la pregunta individual
export interface QuestionOption {
  id: number;
  text: string;
}

export interface QuestionLocales {
  en: {
    question: string;
    options: QuestionOption[];
    explanation: string;
  };
  es: {
    question: string;
    options: QuestionOption[];
    explanation: string;
  };
}

export interface QuestionData {
  id: string;
  topic_id: string;
  number: number;
  correct_answers: number[];
  locales: QuestionLocales;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationData {
  current: number;
  total: number;
  hasPrevious: boolean;
  hasNext: boolean;
  previousNumber: number;
  nextNumber: number;
}

export interface QuestionResponse {
  question: QuestionData;
  navigation: NavigationData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Debug: verificar que la variable de entorno se está cargando
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment variable NEXT_PUBLIC_API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

export async function getQuizTopics(): Promise<QuizTopic[]> {
  const response = await fetch(`${API_BASE_URL}/api/topics/with-questions-count`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz topics');
  }
  
  const rawResponse = await response.json();
  console.log('Raw API response:', rawResponse);
  console.log('Response type:', typeof rawResponse);
  console.log('Response keys:', Object.keys(rawResponse));
  
  const apiResponse: ApiResponse<TopicsResponse> = rawResponse;
  
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to fetch quiz topics');
  }
  
  console.log('API data:', apiResponse.data);
  console.log('Topics from data:', apiResponse.data.topics);
  console.log('Topics is array:', Array.isArray(apiResponse.data.topics));
  
  return apiResponse.data.topics;
}

export async function getQuizQuestions(topicId: string): Promise<QuizQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/questions/${topicId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz questions');
  }
  return response.json();
}

// Nueva función para obtener pregunta individual con navegación
export async function getQuestionByNumber(topicId: string, questionNumber: number): Promise<QuestionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/questions/topic/${topicId}/navigate/${questionNumber}`);
  if (!response.ok) {
    throw new Error('Failed to fetch question');
  }
  
  const rawResponse = await response.json();
  const apiResponse: ApiResponse<QuestionResponse> = rawResponse;
  
  if (!apiResponse.success) {
    throw new Error(apiResponse.message || 'Failed to fetch question');
  }
  
  return apiResponse.data;
}

// Función para obtener todas las preguntas de un tema
export async function getAllQuestionsForTopic(topicId: string): Promise<QuestionData[]> {
  const questions: QuestionData[] = [];
  let currentQuestion = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await getQuestionByNumber(topicId, currentQuestion);
      questions.push(response.question);
      
      if (response.navigation.hasNext) {
        currentQuestion = response.navigation.nextNumber;
      } else {
        hasMore = false;
      }
    } catch {
      hasMore = false;
    }
  }

  return questions;
}
