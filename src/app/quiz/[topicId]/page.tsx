'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getQuizQuestions, QuizQuestion } from '@/services/quizApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuizPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (topicId) {
      async function loadQuestions() {
        try {
          const fetchedQuestions = await getQuizQuestions(topicId);
          setQuestions(fetchedQuestions);
        } catch (err) {
          setError('Failed to load quiz questions. Please try again later.');
        }
        setLoading(false);
      }

      loadQuestions();
    }
  }, [topicId]);

  if (loading) {
    return <p>Loading questions...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  const currentQuestion = questions[0];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      {currentQuestion && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              {currentQuestion.options.map((option, index) => (
                <Button key={index} variant="outline">{option}</Button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Next Question</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
