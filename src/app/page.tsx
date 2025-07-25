'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getQuizTopics, QuizTopic } from '@/services/quizApi';

export default function Home() {
  const [topics, setTopics] = useState<QuizTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopics() {
      try {
        console.log('Fetching topics from API...');
        const fetchedTopics = await getQuizTopics();
        console.log('Topics fetched successfully:', fetchedTopics);
        console.log('Topics type:', typeof fetchedTopics);
        console.log('Topics length:', fetchedTopics?.length);
        console.log('Topics is array:', Array.isArray(fetchedTopics));
        setTopics(fetchedTopics);
      } catch (err) {
        console.error('Error fetching topics:', err);
        setError(`Failed to load quiz topics: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setLoading(false);
    }

    loadTopics();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Quiz App</h1>

      {loading && <p>Loading topics...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics && topics.length > 0 ? (
          topics.map((topic) => (
            <div key={topic.id} className="mb-8">
              <Card className="w-full max-w-md border border-gray-200 rounded-xl bg-white shadow p-6">
                {topic.image_url && (
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                      <img
                        src={topic.image_url}
                        alt={topic.name}
                        className="w-14 h-14 object-contain"
                        style={{ width: '56px', height: '56px', objectFit: 'contain' }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="mb-2">
                  <span className="block text-2xl font-bold text-gray-900 text-left">
                    {topic.name}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-gray-500 text-base text-left">
                    {topic.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mb-4">
                  {topic.questions_count !== undefined && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {topic.questions_count} pregunta{topic.questions_count !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="flex justify-start">
                  <Link
                    href={`/quiz/${topic.id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors duration-200 text-base"
                  >
                    Comenzar Quiz
                  </Link>
                </div>
              </Card>
            </div>
          ))
        ) : (
          !loading && !error && <p className="text-gray-500">No hay temas disponibles</p>
        )}
      </div>
    </main>
  );
}
