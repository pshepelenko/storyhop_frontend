import React, { useEffect, useState, useRef } from 'react';

interface OptionAudioElementProps {
    audioURL: string;
    text: string;
    isSelected?: boolean;   
}

const OptionAudioElement: React.FC<OptionAudioElementProps> = ({ audioURL, text, isSelected }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    useEffect(() => {
        const audio = audioRef.current;
        
        if (audio) {
            const updateProgress = () => {
                setProgress((audio.currentTime / audio.duration) * 100);
            };

           
            audio.addEventListener('timeupdate', updateProgress);
            
            return () => {
                audio.removeEventListener('timeupdate', updateProgress);
                
            };
        }
    }, []);

    const handlePlayAudio = () => {
        const contentAudio = audioRef.current;
        if (contentAudio) {
            contentAudio.play().catch((error) => {
                console.error('Error playing contentAudio:', error);
            });
            setIsPlaying(true);
        }
    };

    const handlePauseAudio = () => {
        const contentAudio = audioRef.current;
        
        if (contentAudio) {
            contentAudio.pause();
        }
        
        setIsPlaying(false);
    };

    return (
        <div className="w-full flex flex-col gap-8 items-center sm:items-start bg-gray-100">
            <audio ref={audioRef}>
                <source src={audioURL} type="audio/wav" />
                Your browser does not support the audio element.
            </audio>
            <button onClick={handlePlayAudio} key={text} className={`border border-gray-300 w-full rounded-lg p-2 ${isSelected ? 'bg-gray-300 text-black' : 'bg-white'}`}>
                 
                    <div className="flex items-center w-full">
                        {/* <svg
                            
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
                        </svg> */}
                        <div>🔊</div>
                        <div className="w-full text-start ml-2">
                            <p className="">{text}</p>                           
                        </div>
                    </div>
                
                
            </button>

                             
                                       
        </div>
    );
};

export default OptionAudioElement;