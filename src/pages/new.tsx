import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4
import Spinner from '@/components/spinner';
import Link from 'next/link';

const NewStoryPage = () => {
    const [authorAge, setAuthorAge] = useState<string | null>(null);
    const [world, setWorld] = useState<string | null>(null);
    const [comments, setComments] = useState<string>('Дополнительных комментариев нет');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleCreateStory = async () => {
        if (!authorAge || !world) {
            setError('Пожалуйста, выберите возраст автора и мир.');
            return;
        }

        setLoading(true);
        const requestId = uuidv4(); // Generate a unique requestId
        try {
            let userId = localStorage.getItem('userId');
            if (!userId || userId === 'undefined') {
                userId = 'default';
            }

           

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://storyhop.eu-north-1.elasticbeanstalk.com/',
                },
                body: JSON.stringify({
                    channelUserId: userId,
                    theme: world,
                    channel: 'web-app',
                    age: authorAge,
                    comments: comments,
                    requestId: requestId, // Include the requestId in the request body
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('storyData', JSON.stringify(data));
            localStorage.setItem('initialStoryFlag', 'true');
            setError(null);
            router.push(`/stories/${data.storyId}`);
        } catch (error) {
            console.error('Error creating story:', error);
            setError(`Ошибка при создании истории. С идентификатором ${requestId} и ошибкой ${error}` );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen py-8 px-4 sm:p-20 bg-white text-black font-[family-name:var(--font-geist-sans)]">
            <header className="flex w-full items-center">
                <Link href="/" className="flex text-blue-500 items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.7069 4.23276C8.99256 3.93281 9.46729 3.92123 9.76724 4.2069C10.0672 4.49256 10.0788 4.9673 9.7931 5.26724L6 9.25H15.75C16.1642 9.25 16.5 9.58579 16.5 10C16.5 10.4142 16.1642 10.75 15.75 10.75H6L9.7931 14.7328C10.0788 15.0327 10.0672 15.5074 9.76724 15.7931C9.46729 16.0788 8.99256 16.0672 8.7069 15.7672L3.7069 10.5172C3.43103 10.2276 3.43103 9.77242 3.7069 9.48276L8.7069 4.23276Z" fill="#3B82F6" />
                    </svg>
                </Link>
                <h1 className="text-md w-full text-center px-2 text-lg mr-1">Создание новой истории</h1>
            </header>
            <div className="bg-gray-100 h-full mt-8 flex flex-col justify-between">
                <div className="flex flex-col min-h-screen py-8 px-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-lg">Начинаем историю. Подождите...</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <div className="bg-white p-4 rounded-lg mb-4 font-semibold">Подскажите, сколько лет будущему автору?</div>
                                <div className="flex gap-4">
                                    <button
                                        className={`py-2 w-1/3 px-4 rounded-lg ${authorAge === '<7' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setAuthorAge('<7')}
                                    >
                                        {'<7'}
                                    </button>
                                    <button
                                        className={`py-2 w-1/3 px-4 rounded-lg ${authorAge === '7-11' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setAuthorAge('7-11')}
                                    >
                                        7-11
                                    </button>
                                    <button
                                        className={`py-2 w-1/3 px-4 rounded-lg ${authorAge === '11+' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setAuthorAge('11+')}
                                    >
                                        11+
                                    </button>
                                </div>
                            </div>
                            <div className="mb-8">
                                <div className="bg-white p-4 rounded-lg mb-4 font-semibold">Выберите мир, где происходит действие.</div>
                                <div className="flex flex-col gap-4">
                                    <button
                                        className={`py-2 px-4 rounded-lg ${world === 'Фэнтезийный мир, полный магии, мифических существ и древних секретов.' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setWorld('Фэнтезийный мир, полный магии, мифических существ и древних секретов.')}
                                    >
                                        🔮🐉📜 Мир, полный магии, мифических существ и древних секретов.
                                    </button>
                                    <button
                                        className={`py-2 px-4 rounded-lg ${world === 'Футуристический мир с передовыми технологиями, инопланетянами, космическими путешествиями и цивилизациями ИИ' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setWorld('Футуристический мир с передовыми технологиями, инопланетянами, космическими путешествиями и цивилизациями ИИ')}
                                    >
                                        🚀👽🤖 Мир будущего с передовыми технологиями, инопланетянами, космическими путешествиями и цивилизациями ИИ
                                    </button>
                                    <button
                                        className={`py-2 px-4 rounded-lg ${world === 'Пиратский мир, полный потерянных сокровищ, кораблей-призраков и морских чудовищ' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-200'}`}
                                        onClick={() => setWorld('Пиратский мир, полный потерянных сокровищ, кораблей-призраков и морских чудовищ')}
                                    >
                                        🏴‍☠️💰⚓ Пиратский мир, полный потерянных сокровищ, кораблей-призраков и морских чудовищ
                                    </button>
                                </div>
                            </div>
                            <div className="mb-2">
                                <div className="bg-white p-4 rounded-lg mb-4 font-semibold">Дополнительные комментарии</div>
                                <textarea
                                    className="w-full p-4 rounded-lg border border-gray-200"
                                    rows={3}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>
                            {error && <div className="text-red-500 mb-4">{error}</div>}
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white py-4 px-4 mt-4 rounded-lg"
                                onClick={handleCreateStory}
                            >
                                Создать
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewStoryPage;