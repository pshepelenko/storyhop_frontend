import React, { useEffect, useState } from 'react';
import Logo from "../components/logo";
import StoriesListUnit from "../components/stories-list-unit";
import Link from 'next/link';
import Landing from '@/components/landing';

export default function Home() {
  interface Story {
    storyId: string;
    title: string;
    coverURL: string;
  }

  const UItext = {
    russian: {
      forParents: '📊🛠️ Для родителей',
      settings: '⚙️🌐💳 Настройки',
      startStory: '+ Начать историю',
      yourStories: 'Твои истории',
      noStories: 'Ты еще пока не создал ни одной истории. Попробуй начать новую.',
    },
    english: {
      forParents: '📊🛠️ For Parents',
      settings: '⚙️🌐💳 Settings',
      startStory: '+ Start a Story',
      yourStories: 'Your Stories',
      noStories: 'You have not created any stories yet. Try starting a new one.',
    },
  };

  const [stories, setStories] = useState<Story[]>([]);
  const [language, setLanguage] = useState<'russian' | 'english'>('english');

  useEffect(() => {
    // Set default language if not set
    let storyLanguage = localStorage.getItem('storyLanguage') as 'russian' | 'english' | null;
    if (!storyLanguage) {
      localStorage.setItem('storyLanguage', 'english');
      storyLanguage = 'english';
    }
    setLanguage(storyLanguage);

    const fetchStories = async () => {
      try {
        const userId = localStorage.getItem('userId') || 'default';
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStories(data);
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] bg-white text-black min-h-screen max-w-lg  font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center pt-10">
        <div className='w-full flex justify-between px-4 mb-8'>
          <Link href="/parent-space" className='border p-2 rounded-lg border-gray-300'>{UItext[language].forParents}</Link>
          <Link href="/settings" className='border p-2 rounded-lg border-gray-300'>{UItext[language].settings}</Link>
        </div>
        <Logo />
        <Link href="/new" className="bg-blue-500 hover:bg-blue-700 text-lg text-white py-4 px-4 rounded-full"> 
          {UItext[language].startStory}
        </Link>
        {stories.length === 0 && <Landing />}
        <div className="bg-gray-100 w-full">
          <div>
            <h1 className="text-lg w-full text-center text-bold mt-4">{UItext[language].yourStories}</h1>          
          </div>
          {stories.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              {UItext[language].noStories}
            </div>
          ) : (
            stories.map((story) => (
              <StoriesListUnit key={story.storyId} story={story} />
            ))
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
