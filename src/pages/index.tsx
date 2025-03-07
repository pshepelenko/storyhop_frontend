import React, { useEffect, useState } from 'react';
import Header from "../components/header";
import Logo from "../components/logo";
import StoriesListUnit from "../components/stories-list-unit";
import Link from 'next/link';

export default function Home() {
  interface Story {
    storyId: string;
    title: string;
    coverURL: string;
  }

  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/users/58873b02-8f46-4fd8-af7e-01e300c5f13e`, {
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
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen max-w-lg sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <Header />
        <Logo />
        <Link href="/new" className="bg-blue-500 hover:bg-blue-700 text-lg text-white py-4 px-4 mt-4 rounded-full"> 
          + Начать историю
        </Link>
        <div className="bg-gray-100 w-full">
          <div>
            <h1 className="text-lg w-full text-center text-bold mt-4">Твои истории</h1>          
          </div>
          {stories.map((story) => (
            <StoriesListUnit key={story.storyId} story={story} />
          ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
