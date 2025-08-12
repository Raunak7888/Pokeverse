"use client";

import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import Star from './star'; // Assuming Star component exists and works as expected
import { QuizAnalysis } from '@/utils/types';

const Analysis = () => {
    const [quizAnalysis, setQuizAnalysis] = useState<QuizAnalysis>();

    useEffect(() => {
        try {
            const analysis = localStorage.getItem("analysis");
            setQuizAnalysis(analysis ? JSON.parse(analysis) : null);
        } catch (err) {
            console.error("Failed to parse analysis data:", err);
        }
    }, []);

    const formatTime = (ms: number) => {
        // Ensure ms is a number before calling toFixed
        return (typeof ms === 'number' ? (ms / 1000).toFixed(2) : '0.00') + ' Sec';
    };

    // --- Derived state calculations (move inside the render or after quizAnalysis check) ---
    // These should only be calculated if quizAnalysis is not null
    const accuracyPercentage = quizAnalysis ? (quizAnalysis.accuracy / 100) * (273 - 87) + 87 : 0;
    const unfilledColor = '#606060'; // Slightly lighter than the card background
    const accuracyColor = quizAnalysis
        ? quizAnalysis.accuracy < 33
            ? '#ee4035'
            : quizAnalysis.accuracy < 66
                ? '#ffee48'
                : '#2CC30A'
        : unfilledColor; // Default color if quizAnalysis is null

    // Conditional rendering based on quizAnalysis
    if (!quizAnalysis) {
        return (
            <div className="flex justify-center items-center h-full w-full text-white bg-[#181818]">
                <p>Loading quiz analysis or no data found...</p>
            </div>
        );
    }

    // If quizAnalysis is not null, proceed with rendering the analysis
    return (
        <div className="flex justify-center items-center h-full w-full text-white bg-[#181818]"> {/* Subtly darker background */}
            <div className="bg-[#282828] h-[90%] w-[90%] rounded-4xl p-7 grid grid-cols-[2fr_8fr] grid-rows-[2fr_4fr] gap-4
                         transform transition-all duration-300 ease-in-out hover:scale-[1.005] hover:shadow-xl hover:shadow-[#282828]/30 cursor-default">

                {/* Accuracy/Star Rating Card */}
                <div className="flex bg-[#383838] rounded-3xl flex-col items-center
                            transform transition-all duration-300 ease-in-out
                            hover:scale-105 hover:shadow-lg hover:shadow-[#2CC30A]/50 cursor-pointer">
                    <div className="relative rotate-180 w-52 h-32 overflow-hidden">
                        <div
                            className="w-52 h-52 rounded-full absolute bottom-5 left-0 flex items-center justify-center
                                       transition-transform duration-1000 ease-in-out"
                            style={{
                                background: `conic-gradient(${accuracyColor} 0deg ${accuracyPercentage}deg, ${unfilledColor} ${accuracyPercentage}deg 360deg)`
                            }}
                        >
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#383838] w-36 h-20 rounded-b-full flex flex-col items-center justify-center shadow-inner
                                         transform transition-all duration-300 ease-in-out ">
                            <div
                                className="font-bold text-[10px] rotate-180 font-[Krona_One] tracking-widest"
                                style={{ color: accuracyColor }}
                            >
                                Accuracy
                            </div>

                            <div
                                className="font-bold text-xl rotate-180 font-[Aclonica]"
                                style={{ color: accuracyColor }}
                            >
                                {quizAnalysis.accuracy}%
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#484848] w-full max-w-xs rounded-b-2xl px-6 py-3 flex justify-center space-x-2
                                     transform transition-all duration-300 ease-in-out hover:bg-[#585858]">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} fill={i * 20 < quizAnalysis.accuracy} height={40} width={40} />
                        ))}
                    </div>
                </div>

                {/* Question Statistics Grid */}
                <div className="bg-[#383838] rounded-3xl p-5 grid grid-rows-2 gap-3">
                    <div className='bg-[#484848] rounded-t-2xl p-2 grid grid-cols-4 gap-3'>
                        {/* Total Questions Card */}
                        <div className='bg-[#585858] rounded-tl-2xl pt-1 pl-3 pr-3 border-b-2 border-lime-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl text-center font-[Aclonica] text-cyan-400'>{quizAnalysis.totalQuestions || 0}</div>
                            <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Total Question</div>
                        </div>
                        {/* Correct Questions Card */}
                        <div className='bg-[#585858] pt-1 pl-3 pr-3 border-b-2 border-green-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl text-center font-[Aclonica] text-green-400'>{quizAnalysis.correctAnswers || 0}</div>
                            <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Correct Question</div>
                        </div>
                        {/* Wrong Questions Card */}
                        <div className='bg-[#585858] pt-1 pl-3 pr-3 border-b-2 border-red-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl text-center font-[Aclonica] text-red-400'>{quizAnalysis.wrongAnswers || 0}</div>
                            <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Wrong Question</div>
                        </div>
                        {/* Unanswered Questions Card */}
                        <div className='bg-[#585858] rounded-tr-2xl pt-1 pl-3 pr-3 border-b-2 border-orange-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl text-center font-[Aclonica] text-orange-400'>
                                {Math.max(0, (quizAnalysis.totalQuestions || 0) - ((quizAnalysis.correctAnswers || 0) + (quizAnalysis.wrongAnswers || 0)))}
                            </div>
                            <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Unanswered Question</div>
                        </div>
                    </div>
                    <div className='grid grid-cols-[2fr_1fr] gap-3'>
                        <div className='bg-[#484848] rounded-bl-2xl p-2 w-full h-full grid grid-cols-2 gap-3'>
                            {/* Speed Rating Card */}
                            <div className='bg-[#585858] rounded-bl-2xl pt-1 pl-3 pr-3 border-b-2 border-blue-500
                                           transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                                <div className='font-bold text-xl text-center font-[Aclonica] text-blue-400'>{quizAnalysis.answerSpeedRating || 'N/A'}</div>
                                <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Speed Rating</div>
                            </div>
                            {/* Performance Rating Card */}
                            <div className='bg-[#585858] pt-1 pl-3 pr-3 border-b-2 border-purple-500
                                           transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                                <div className='font-bold text-xl text-center font-[Aclonica] text-purple-400'>{quizAnalysis.performanceRating || 'N/A'}</div>
                                <div className='w-full text-xs font-[Krona_One] text-center tracking-widest text-gray-400'>Performance Rating</div>
                            </div>
                        </div>
                        <div className='bg-[#484848] rounded-br-2xl p-2 w-full h-full'>
                            {/* Quiz Played Date Card */}
                            <div className='bg-[#585858] rounded-br-2xl w-full h-full pt-1 pl-3 pr-3 pb-1 border-b-2 border-yellow-600
                                           transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                                <div className='font-bold text-xl text-center font-[Aclonica] text-yellow-400'>
                                    {quizAnalysis.createdAt ? new Date(quizAnalysis.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                </div>
                                <div className='w-full text-xs font-[Krona_One] tracking-widest text-center text-gray-400'>
                                    Quiz Played Date
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Duration Statistics Panel */}
                <div className="bg-[#383838] rounded-3xl p-2">
                    <div className='bg-[#484848] rounded-3xl p-2 grid grid-rows-4 gap-2'>
                        {/* Total Duration Card */}
                        <div className='bg-[#585858] pt-3 pl-3 pr-3 rounded-t-2xl border-b-2 border-teal-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl font-[Aclonica] text-teal-400'>{formatTime(quizAnalysis.totalDuration || 0)}</div>
                            <div className='w-full text-xs font-[Krona_One] tracking-widest text-end text-gray-400'>Total Duration</div>
                        </div>
                        {/* Average Time Per Question Card */}
                        <div className='bg-[#585858] pt-3 pl-3 pr-3 border-b-2 border-amber-500
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl font-[Aclonica] text-amber-400'>{formatTime(quizAnalysis.averageTimePerQuestion || 0)}</div>
                            <div className='w-full text-xs font-[Krona_One] tracking-widest text-end text-gray-400'>Average Time Per Question</div>
                        </div>
                        {/* Fastest Time Card */}
                        <div className='bg-[#585858] pt-3 pl-3 pr-3 border-b-2 border-lime-600
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl font-[Aclonica] text-lime-400'>{formatTime(quizAnalysis.fastestAnswerTime || 0)}</div>
                            <div className='w-full text-xs font-[Krona_One] tracking-widest text-end text-gray-400'>Fastest Time</div>
                        </div>
                        {/* Slowest Time Card */}
                        <div className='bg-[#585858] pt-3 pl-3 pr-3 rounded-b-2xl border-b-2 border-red-600
                                       transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                            <div className='font-bold text-xl font-[Aclonica] text-red-400'>{formatTime(quizAnalysis.slowestAnswerTime || 0)}</div>
                            <div className='w-full text-xs font-[Krona_One] tracking-widest text-end text-gray-400'>Slowest Time</div>
                        </div>
                    </div>
                </div>

                {/* Question Analysis Scrollable Panel */}
                <div className="bg-[#383838] rounded-3xl p-4 h-86 grid grid-rows-[1fr_6fr]">
                    <div className='font-bold text-xl text-center pb-3 font-[Krona_One] text-cyan-400'>Question Analysis</div>
                    <div className='bg-[#282828] h-full w-full p-3 rounded-b-2xl overflow-y-scroll custom-scrollbar'>
                        {quizAnalysis.questionAnalysis && quizAnalysis.questionAnalysis.length > 0 ? (
                            quizAnalysis.questionAnalysis.map((q, index) => (
                                <div key={q.questionId} className={`bg-[#484848] rounded-3xl mb-3 p-3 w-full
                                         transform transition-all duration-300 ease-in-out hover:scale-[1.01] cursor-pointer
                                         ${q.correct ? 'hover:shadow-lg hover:shadow-[#2CC30A]/50' : 'hover:shadow-lg hover:shadow-[#ee4035]/50'}`}>
                                    <div className='pb-3'>
                                        <span className='font-bold text-lg font-[Outfit] text-yellow-300'>Ques {index + 1}. </span><span className='font-bold text-lg font-[Outfit] text-white'>{q.question}</span>
                                    </div>
                                    <div>
                                        <span className='font-bold text-sm font-[Outfit] text-yellow-300'>Ans {index + 1}. </span>
                                        <span className=' font-bold text-sm font-[Outfit] text-white'>
                                            <span className='bg-[#585858] ml-2 rounded-2xl p-1 pl-3 pr-0 group relative'>
                                                Your Answer: <span className={`rounded-2xl ml-2 p-1 pl-2
                                                                ${q.correct ? 'bg-green-600 shadow-md shadow-green-600/40' : 'bg-red-600 shadow-md shadow-red-600/40'}
                                                                inline-block transform transition-all duration-300 ease-in-out
                                                                group-hover:scale-105 group-hover:shadow-lg
                                                                `}>{q.selectedAnswer || 'N/A'}</span>
                                            </span>
                                            {q.selectedAnswer !== q.correctAnswer && (
                                                <span className='bg-[#585858] ml-2 rounded-2xl p-1 pl-3 pr-2 inline-block transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-[#686868] cursor-pointer'>
                                                    Correct Answer: <span className="text-green-300">{q.correctAnswer || 'N/A'}</span>
                                                </span>
                                            )}
                                        </span>
                                        <div className="inline-flex items-center justify-center w-full">
                                            <hr className="w-80 h-[3px] mt-5 relative left-14 border-0 bg-gray-600" />
                                            <span className="px-3 font-medium mt-7 mb-2 text-xs text-gray-400 -translate-x-1/2 bg-[#484848] relative right-24 dark:text-white font-[Krona_One] ">Time Taken</span>
                                        </div>
                                        <div className='flex items-center mb-1 justify-center flex-row'>
                                            <Timer className="text-cyan-300" />
                                            <div className='font-bold ml-1 mt-1 text-lg font-[Outfit] text-cyan-300'>{formatTime(q.timeTaken || 0)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400">No question analysis available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;