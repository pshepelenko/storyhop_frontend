import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AudioElement from '../../components/audio-element';
import Spinner from '../../components/spinner';
import Link from 'next/link';

const StoryPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [story, setStory] = useState<{
        storyId: string;
        userId: string;
        threadId: string;
        world: string;
        age: string;
        comments: string;
        lastQuestion: string;
        title: string;
        coverURL: string;
        audioURLs: string[];
    }>({
        storyId: '',
        userId: '',
        threadId: '',
        world: '',
        age: '',
        comments: '',
        lastQuestion: '',
        title: '',
        coverURL: '',
        audioURLs: [],
    });
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [customOption, setCustomOption] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchStory = async () => {
            if (id) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setStory(data);
                } catch (error) {
                    console.error('Error fetching story:', error);
                }
            }
        };

        fetchStory();
    }, [id]);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        setCustomOption('');
    };

    const handleCustomOptionClick = () => {
        setSelectedOption('custom');
    };

    const continueStory = async () => {
        if (!selectedOption) {
            setError('Пожалуйста, выберите вариант развития событий.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const userId = localStorage.getItem('userId');
            const choice = selectedOption === 'custom' ? customOption : selectedOption;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stories/continue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    channel: 'web-app',
                    storyId: id,
                    choice: choice,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setStory((prevStory) => ({
                ...prevStory,
                lastQuestion: data.text,
                audioURLs: [...prevStory.audioURLs, data.audioUrl],
            }));
            setSelectedOption(null);
            setCustomOption('');
        } catch (error) {
            console.error('Error continuing story:', error);
            setError('Ошибка при продолжении истории' + error);
        } finally {
            setLoading(false);
        }
    };

    if (!story) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-screen py-8 px-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <header className="flex w-full justify-between items-center">
                <Link href="/" className="flex text-blue-500 items-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.7069 4.23276C8.99256 3.93281 9.46729 3.92123 9.76724 4.2069C10.0672 4.49256 10.0788 4.9673 9.7931 5.26724L6 9.25H15.75C16.1642 9.25 16.5 9.58579 16.5 10C16.5 10.4142 16.1642 10.75 15.75 10.75H6L9.7931 14.7328C10.0788 15.0327 10.0672 15.5074 9.76724 15.7931C9.46729 16.0788 8.99256 16.0672 8.7069 15.7672L3.7069 10.5172C3.43103 10.2276 3.43103 9.77242 3.7069 9.48276L8.7069 4.23276Z" fill="#3B82F6"/>
                    </svg>
                    Назад
                </Link>
                <div className="text-md text-semibold text-center px-2">
                    {story.title}                   
                </div>
                <button className="flex text-blue-500 items-center border border-2 py-1 px-2 rounded-lg border-blue-500">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5165 4.17572C13.4278 3.27476 14.9088 3.27476 15.8201 4.17572C16.7266 5.07199 16.7266 6.52155 15.8201 7.41782L15.1334 8.09671C14.8389 8.38793 14.8361 8.8628 15.1274 9.15735C15.4186 9.45191 15.8935 9.45462 16.188 9.1634L16.8747 8.48451C18.3751 7.0011 18.3751 4.59244 16.8747 3.10904C15.379 1.63032 12.9576 1.63032 11.4619 3.10904L8.12529 6.40787C6.62489 7.89128 6.62489 10.2999 8.12529 11.7833C8.41985 12.0746 8.89471 12.0719 9.18594 11.7773C9.47716 11.4827 9.47445 11.0079 9.17989 10.7167C8.27336 9.82039 8.27336 8.37083 9.17989 7.47456L12.5165 4.17572Z" fill="#3B82F6"/>
                        <path d="M7.48346 15.8243C6.57217 16.7252 5.09119 16.7252 4.1799 15.8243C3.27337 14.928 3.27337 13.4784 4.1799 12.5822L4.86657 11.9033C5.16113 11.6121 5.16383 11.1372 4.87261 10.8426C4.58139 10.5481 4.10653 10.5454 3.81197 10.8366L3.1253 11.5155C1.6249 12.9989 1.6249 15.4076 3.1253 16.891C4.62096 18.3697 7.0424 18.3697 8.53806 16.891L11.8747 13.5921C13.3751 12.1087 13.3751 9.70006 11.8747 8.21666C11.5801 7.92544 11.1053 7.92814 10.814 8.2227C10.5228 8.51726 10.5255 8.99212 10.8201 9.28334C11.7266 10.1796 11.7266 11.6292 10.8201 12.5254L7.48346 15.8243Z" fill="#3B82F6"/>
                    </svg>
                    Поделиться
                </button>
            </header>
            <div className="bg-gray-100 h-full mt-8 flex flex-col justify-between">
                <main className="flex-grow flex flex-col gap-2 py-5 px-3 items-center sm:items-start">
                    {story.audioURLs.map((audioURL: string, index: number) => (
                        <AudioElement key={index} audioURL={audioURL} title={`Глава ${index + 1}`} />
                    ))}
                    {!loading && (
                        <>
                            <div className="bg-white w-full rounded-lg p-2 whitespace-pre-line">
                                {story.lastQuestion}
                            </div>
                            <button
                                className={`border border-gray-300 w-full rounded-lg p-2 ${selectedOption === 'Вариант 1' ? 'bg-gray-300 text-white' : 'bg-white'}`}
                                onClick={() => handleOptionClick('Вариант 1')}
                            >
                                Вариант 1
                            </button>
                            <button
                                className={`border border-gray-300 w-full rounded-lg p-2 ${selectedOption === 'Вариант 2' ? 'bg-gray-300 text-white' : 'bg-white'}`}
                                onClick={() => handleOptionClick('Вариант 2')}
                            >
                                Вариант 2
                            </button>
                            <button
                                className={`border border-gray-300 w-full rounded-lg p-2 ${selectedOption === 'Вариант 3' ? 'bg-gray-300 text-white' : 'bg-white'}`}
                                onClick={() => handleOptionClick('Вариант 3')}
                            >
                                Вариант 3
                            </button>
                            <button
                                className={`border border-gray-300 w-full rounded-lg p-2 ${selectedOption === 'custom' ? 'bg-gray-300 text-white' : 'bg-white'}`}
                                onClick={handleCustomOptionClick}
                            >
                                Свой вариант
                            </button>
                            {selectedOption === 'custom' && (
                                <textarea
                                    className="w-full p-4 rounded-lg border border-gray-200 mt-4"
                                    rows={3}
                                    value={customOption}
                                    onChange={(e) => setCustomOption(e.target.value)}
                                />
                            )}
                            {error && <div className="text-red-500 mb-4">{error}</div>}
                            <button onClick={continueStory} className="border border-blue-500 mt-4 bg-blue-500 w-full rounded-lg p-2 text-white">Продолжить историю</button>
                        </>
                    )}
                    {loading && (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Spinner />
                            <p className="mt-4 text-lg">Создаем продолжение истории. Подождите...</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default StoryPage;