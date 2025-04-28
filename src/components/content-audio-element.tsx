import React, { useEffect, useState, useRef } from 'react';

interface ContentAudioElementProps {
    contentAudioURL: string;
    optionsIntroAudioURL: string;
    title: string;
}

const ContentAudioElement: React.FC<ContentAudioElementProps> = ({ contentAudioURL, optionsIntroAudioURL, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const contentAudioRef = useRef<HTMLAudioElement>(null);
    const optionsIntroAudioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const contentAudio = contentAudioRef.current;
        const optionsIntroAudio = optionsIntroAudioRef.current;

        if (contentAudio) {
            const updateProgress = () => {
                setProgress((contentAudio.currentTime / contentAudio.duration) * 100);
            };

            const handleContentAudioEnded = () => {
                if (optionsIntroAudio) {
                    optionsIntroAudio.play().catch((error) => {
                        console.error('Error playing optionsIntroAudio:', error);
                    });
                }
            };

            contentAudio.addEventListener('timeupdate', updateProgress);
            contentAudio.addEventListener('ended', handleContentAudioEnded);

            return () => {
                contentAudio.removeEventListener('timeupdate', updateProgress);
                contentAudio.removeEventListener('ended', handleContentAudioEnded);
            };
        }
    }, []);

    const handlePlayAudio = () => {
        const contentAudio = contentAudioRef.current;
        if (contentAudio) {
            contentAudio.play().catch((error) => {
                console.error('Error playing contentAudio:', error);
            });
            setIsPlaying(true);
        }
    };

    const handlePauseAudio = () => {
        const contentAudio = contentAudioRef.current;
        const optionsIntroAudio = optionsIntroAudioRef.current;

        if (contentAudio) {
            contentAudio.pause();
        }
        if (optionsIntroAudio) {
            optionsIntroAudio.pause();
        }
        setIsPlaying(false);
    };

    return (
        <div className="w-full flex flex-col gap-8 items-center sm:items-start bg-gray-100">
            <audio ref={contentAudioRef}>
                <source src={contentAudioURL} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <audio ref={optionsIntroAudioRef}>
                <source src={optionsIntroAudioURL} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <button className="w-full bg-white text-lg py-2 px-4 mt-4 rounded-lg">
                {!isPlaying && (
                    <div className="flex items-center w-full">
                        <svg
                            onClick={handlePlayAudio}
                            width="30"
                            height="30"
                            viewBox="0 0 20 20"
                            className="mr-2 cursor-pointer"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_5469_1653)">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20ZM14.7332 9.55417L7.79909 5.69379C7.71814 5.64872 7.62635 5.625 7.53291 5.625C7.23859 5.625 7 5.85538 7 6.13958V13.8603C7 13.9506 7.02457 14.0392 7.07124 14.1174C7.21824 14.3636 7.54411 14.4481 7.79909 14.3061L14.7332 10.4457C14.8144 10.4005 14.8818 10.3354 14.9287 10.257C15.0757 10.0108 14.9882 9.69612 14.7332 9.55417Z"
                                    fill="#3B82F6"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_5469_1653">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <div className="w-full text-start">
                            <p className="">{title}</p>
                            <div className="bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}
                {isPlaying && (
                    <div className="flex items-center w-full">
                        <svg
                            onClick={handlePauseAudio}
                            width="30"
                            height="30"
                            viewBox="0 0 20 20"
                            className="mr-2 cursor-pointer"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g clipPath="url(#clip0_5469_1652)">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM6 7.5C6 7.03406 6 6.80109 6.07612 6.61732C6.17761 6.37229 6.37229 6.17761 6.61732 6.07612C6.80109 6 7.03406 6 7.5 6C7.96594 6 8.19891 6 8.38268 6.07612C8.62771 6.17761 8.82239 6.37229 8.92388 6.61732C9 6.80109 9 7.03406 9 7.5V12.5C9 12.9659 9 13.1989 8.92388 13.3827C8.82239 13.6277 8.62771 13.8224 8.38268 13.9239C8.19891 14 7.96594 14 7.5 14C7.03406 14 6.80109 14 6.61732 13.9239C6.37229 13.8224 6.17761 13.6277 6.07612 13.3827C6 13.1989 6 12.9659 6 12.5V7.5ZM11.0761 6.61732C11 6.80109 11 7.03406 11 7.5V12.5C11 12.9659 11 13.1989 11.0761 13.3827C11.1776 13.6277 11.3723 13.8224 11.6173 13.9239C11.8011 14 12.0341 14 12.5 14C12.9659 14 13.1989 14 13.3827 13.9239C13.6277 13.8224 13.8224 13.6277 13.9239 13.3827C14 13.1989 14 12.9659 14 12.5V7.5C14 7.03406 14 6.80109 13.9239 6.61732C13.8224 6.37229 13.6277 6.17761 13.3827 6.07612C13.19891 6 12.9659 6 12.5 6C12.0341 6 11.8011 6 11.6173 6.07612C11.3723 6.17761 11.1776 6.37229 11.0761 6.61732Z"
                                    fill="#3B82F6"
                                />
                            </g>
                            <defs>
                                <clipPath id="clip0_5469_1652">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <div className="w-full text-start">
                            <p className="">{title}</p>
                            <div className="bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-blue-500" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ContentAudioElement;