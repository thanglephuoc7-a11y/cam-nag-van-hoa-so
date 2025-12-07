import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { gameQuestions } from '../data/gameQuestions';
import type { GameQuestion } from '../types';
import Modal from './Modal';
import { GiftIcon, UsersIcon, HeartIcon, GavelIcon, RefreshCwIcon, VolumeUpIcon, VolumeOffIcon, SettingsIcon, ClockIcon, PlayIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

type Topic = 'Tất cả' | 'Văn hóa số' | 'Đạo đức số' | 'Pháp luật số';
type AnswerResult = { isCorrect: boolean; explanation: string };
type GameState = 'idle' | 'playing' | 'finished';

const GameScreen: React.FC = () => {
    const { t } = useLanguage();
    const [gameState, setGameState] = useState<GameState>('idle');
    const [scores, setScores] = useState({ 1: 0, 2: 0 });
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
    const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
    const [selectedBoxPoints, setSelectedBoxPoints] = useState<number>(0);
    const [selectedTopic, setSelectedTopic] = useState<Topic>('Tất cả');
    const [message, setMessage] = useState<string | null>(null);
    const [winner, setWinner] = useState<1 | 2 | 'draw' | null>(null);
    const [turnInProgress, setTurnInProgress] = useState(false);
    const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
    const [turnCount, setTurnCount] = useState(1);
    const [timer, setTimer] = useState<number | null>(null);
    
    // Audio State
    const [isSoundOn, setIsSoundOn] = useState(true);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [sfxVolume, setSfxVolume] = useState(0.5);
    const [musicVolume, setMusicVolume] = useState(0.2);

    const audioCtx = useRef<AudioContext | null>(null);
    const musicNodes = useRef<{ oscillator: OscillatorNode, gainNode: GainNode } | null>(null);
    const timerRef = useRef<number | null>(null);

    const playSound = useCallback((type: 'correct' | 'incorrect' | 'loseTurn' | 'win') => {
        if (!isSoundOn || sfxVolume === 0) return;

        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtx.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const playNote = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            gainNode.gain.setValueAtTime(sfxVolume * 0.2, ctx.currentTime);
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, startTime);
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };
        
        const now = ctx.currentTime;
        switch (type) {
            case 'correct':
                playNote(523.25, now, 0.1); // C5
                playNote(783.99, now + 0.1, 0.15); // G5
                break;
            case 'incorrect':
                playNote(164.81, now, 0.2, 'sawtooth'); // E3
                break;
            case 'loseTurn':
                playNote(261.63, now, 0.1); // C4
                playNote(220.00, now + 0.1, 0.15); // A3
                break;
            case 'win':
                playNote(523.25, now, 0.1); // C5
                playNote(659.25, now + 0.15, 0.1); // E5
                playNote(783.99, now + 0.3, 0.1); // G5
                playNote(1046.50, now + 0.45, 0.2); // C6
                break;
        }
    }, [isSoundOn, sfxVolume]);

    // Effect for initializing and cleaning up music
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtx.current) {
                const Ctx = window.AudioContext || (window as any).webkitAudioContext;
                if (Ctx) {
                   audioCtx.current = new Ctx();
                }
            }
            const ctx = audioCtx.current;
            if (!ctx || musicNodes.current) return;

            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
            gainNode.gain.setValueAtTime(0, ctx.currentTime); // Start silent
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            musicNodes.current = { oscillator, gainNode };
            
            return () => {
                 if (musicNodes.current) {
                    musicNodes.current.oscillator.stop();
                    musicNodes.current.oscillator.disconnect();
                    musicNodes.current.gainNode.disconnect();
                    musicNodes.current = null;
                 }
            }
        };
        const cleanup = initAudio();
        
        return cleanup;
    }, []); // Runs only on mount and unmount


    // Effect for updating music volume
    useEffect(() => {
        if (musicNodes.current && audioCtx.current) {
            const { gainNode } = musicNodes.current;
            const targetVolume = isSoundOn ? musicVolume * 0.3 : 0; // Scale it down
            gainNode.gain.setTargetAtTime(targetVolume, audioCtx.current.currentTime, 0.1);
        }
    }, [musicVolume, isSoundOn]);


    const baseBoxes = useMemo(() => [
        { points: 10, color: 'bg-blue-400', hover: 'hover:bg-blue-500' },
        { points: 20, color: 'bg-green-400', hover: 'hover:bg-green-500' },
        { points: 30, color: 'bg-yellow-400', hover: 'hover:bg-yellow-500' },
        { points: 50, color: 'bg-purple-400', hover: 'hover:bg-purple-500' },
        { points: 0, color: 'bg-red-400', hover: 'hover:bg-red-500' }, // 0 points for "Mất lượt"
    ], []);

    const [boxes, setBoxes] = useState(() => [...baseBoxes].sort(() => 0.5 - Math.random()));

    const shuffleBoxes = useCallback(() => {
        setBoxes([...baseBoxes].sort(() => 0.5 - Math.random()));
    }, [baseBoxes]);

    const filteredQuestions = useMemo(() => {
        if (selectedTopic === 'Tất cả') {
            return gameQuestions;
        }
        return gameQuestions.filter(q => q.topic === selectedTopic);
    }, [selectedTopic]);

    const resetGame = useCallback(() => {
        setScores({ 1: 0, 2: 0 });
        setCurrentPlayer(1);
        setCurrentQuestion(null);
        setMessage(null);
        setWinner(null);
        setTurnInProgress(false);
        setAnswerResult(null);
        setTurnCount(1);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(null);
        shuffleBoxes();
        setGameState('idle');
    }, [shuffleBoxes]);
    
    const handleStartGame = () => {
        setScores({ 1: 0, 2: 0 });
        setCurrentPlayer(1);
        setCurrentQuestion(null);
        setMessage(null);
        setWinner(null);
        setTurnInProgress(false);
        setAnswerResult(null);
        setTurnCount(1);
        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(null);
        shuffleBoxes();
        setGameState('playing');
    };

    const proceedToNextTurn = useCallback(() => {
        setAnswerResult(null);
        setCurrentQuestion(null);
        setCurrentPlayer(p => (p === 1 ? 2 : 1));
        setTurnInProgress(false);
        setTurnCount(t => t + 1);
        shuffleBoxes();
    }, [shuffleBoxes]);

    const handleTimeout = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        playSound('loseTurn');
        setMessage(t('game_timeout_message'));
        setCurrentQuestion(null);
        setTimer(null);
        
        setTimeout(() => {
            setMessage(null);
            setCurrentPlayer(p => (p === 1 ? 2 : 1));
            setTurnInProgress(false);
            setTurnCount(t => t + 1);
            shuffleBoxes();
        }, 2000);
    }, [playSound, shuffleBoxes, t]);

    useEffect(() => {
        if (timer === 0) {
            handleTimeout();
        }
    }, [timer, handleTimeout]);

    useEffect(() => {
        if (currentQuestion && !answerResult) {
            setTimer(15);
            timerRef.current = window.setInterval(() => {
                setTimer((prev) => {
                    if (prev === null || prev <= 1) {
                        if(timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (!currentQuestion) {
            if (timerRef.current) clearInterval(timerRef.current);
            setTimer(null);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentQuestion, answerResult]);

    const handleBoxClick = (points: number) => {
        if (turnInProgress || winner || turnCount > 10) return;
        setTurnInProgress(true);

        if (points === 0) { // Mất lượt
            playSound('loseTurn');
            setMessage(t('game_lost_turn_message').replace('{player}', String(currentPlayer)));
            setTimeout(() => {
                setMessage(null);
                setCurrentPlayer(p => (p === 1 ? 2 : 1));
                setTurnInProgress(false);
                setTurnCount(t => t + 1);
                shuffleBoxes();
            }, 2000);
            return;
        }
        
        const possibleQuestions = filteredQuestions.filter(q => q.points === points);
        if (possibleQuestions.length > 0) {
            const question = possibleQuestions[Math.floor(Math.random() * possibleQuestions.length)];
            setCurrentQuestion(question);
            setSelectedBoxPoints(points);
        } else {
            setMessage(t('game_no_question_message').replace('{points}', String(points)));
            setTimeout(() => {
                setMessage(null);
                setCurrentPlayer(p => (p === 1 ? 2 : 1));
                setTurnInProgress(false);
                setTurnCount(t => t + 1);
            }, 2000);
        }
    };
    
    const handleAnswer = (answer: string) => {
        if (!currentQuestion) return;
        if (timerRef.current) clearInterval(timerRef.current);
        setTimer(null);

        const isCorrect = answer === currentQuestion.correct_answer;
        
        if (isCorrect) {
            playSound('correct');
            setScores(s => ({ ...s, [currentPlayer]: s[currentPlayer] + selectedBoxPoints }));
            setAnswerResult({
                isCorrect: true,
                explanation: currentQuestion.explanation,
            });
        } else {
            playSound('incorrect');
            setAnswerResult({
                isCorrect: false,
                explanation: currentQuestion.explanation,
            });
        }
    };

    useEffect(() => {
        if (turnCount > 10 && !winner) {
            let finalWinner: 1 | 2 | 'draw' | null = null;
            if (scores[1] > scores[2]) {
                finalWinner = 1;
            } else if (scores[2] > scores[1]) {
                finalWinner = 2;
            } else {
                finalWinner = 'draw';
            }
            setWinner(finalWinner);
            setGameState('finished');
            playSound('win');
        }
    }, [turnCount, scores, playSound, winner]);

    const topicMap: { [key in Topic]: string } = {
      'Tất cả': 'game_topic_all',
      'Văn hóa số': 'game_topic_culture',
      'Đạo đức số': 'game_topic_ethics',
      'Pháp luật số': 'game_topic_law',
    };

    const getTopicIcon = (topic: Topic) => {
        const props = { className: 'w-5 h-5 mr-2' };
        if (topic === 'Đạo đức số') return <HeartIcon {...props} />;
        if (topic === 'Pháp luật số') return <GavelIcon {...props} />;
        if (topic === 'Văn hóa số') return <UsersIcon {...props} />;
        return null;
    };

    const getWinnerTitle = () => {
        if (winner === 'draw') return t('game_draw_title');
        return t('game_winner_congrats').replace('{winner}', String(winner));
    };
    const getWinnerSubtitle = () => {
        if (winner === 'draw') return t('game_draw_subtitle');
        return t('game_winner_subtitle');
    };
    
    if (gameState === 'idle') {
        const infoItems = [
            {
                icon: <UsersIcon className="w-10 h-10 text-indigo-500" />,
                title: t('game_info_players'),
                description: t('game_info_players_desc'),
                color: 'bg-indigo-100'
            },
            {
                icon: <RefreshCwIcon className="w-10 h-10 text-green-500" />,
                title: t('game_info_turns'),
                description: t('game_info_turns_desc'),
                color: 'bg-green-100'
            },
            {
                icon: <ClockIcon className="w-10 h-10 text-red-500" />,
                title: t('game_info_timer'),
                description: t('game_info_timer_desc'),
                color: 'bg-red-100'
            },
            {
                icon: <GiftIcon className="w-10 h-10 text-yellow-500" />,
                title: t('game_info_goal'),
                description: t('game_info_goal_desc'),
                color: 'bg-yellow-100'
            },
        ];

        return (
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#0B72B9] mb-4">{t('game_title')}</h2>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('game_start_heading')}</h3>
              <p className="text-gray-600 mb-8">{t('game_start_title')}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {infoItems.map(item => (
                    <div key={item.title} className={`p-6 rounded-lg text-center flex flex-col items-center ${item.color}`}>
                        {item.icon}
                        <p className="font-bold text-lg mt-3 text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                ))}
              </div>

              <button onClick={handleStartGame} className="bg-green-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 text-xl inline-flex items-center space-x-3">
                <PlayIcon className="w-6 h-6" />
                <span>{t('game_start_button')}</span>
              </button>
            </div>
          </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-4">{t('game_title')}</h2>

            {/* Controls and Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-center">
                <div className="bg-white p-4 rounded-lg shadow-md order-2 md:order-1">
                    <h3 className="font-bold mb-2">{t('game_topic_select')}</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {(['Tất cả', 'Văn hóa số', 'Đạo đức số', 'Pháp luật số'] as Topic[]).map(topic => (
                            <button key={topic} onClick={() => setSelectedTopic(topic)} className={`px-3 py-1 text-sm rounded-full flex items-center transition-colors ${selectedTopic === topic ? 'bg-[#0B72B9] text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                {getTopicIcon(topic)} {t(topicMap[topic])}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md order-1 md:order-2">
                     <div className="flex justify-around items-center">
                        {([1, 2] as const).map(playerNum => (
                            <div key={playerNum} className={`p-3 rounded-lg transition-all duration-300 ${currentPlayer === playerNum && !winner ? 'bg-yellow-200 scale-110' : ''}`}>
                                <p className="text-lg font-semibold">{t('game_player')} {playerNum}</p>
                                <p className="text-4xl font-bold text-[#0B72B9]">{scores[playerNum]}</p>
                            </div>
                        ))}
                    </div>
                    <div className="text-center font-bold text-lg mt-2 text-gray-600">{t('game_turn_counter').replace('{current}', String(turnCount > 10 ? 10 : turnCount))}</div>
                </div>
                
                <div className="flex justify-center items-center space-x-4 bg-white p-4 rounded-lg shadow-md order-3">
                    <button onClick={resetGame} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" aria-label={t('game_play_again')}><RefreshCwIcon className="w-6 h-6"/></button>
                    <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" aria-label={t('game_settings')}><SettingsIcon className="w-6 h-6"/></button>
                    <button onClick={() => setIsSoundOn(!isSoundOn)} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors" aria-label={t('game_toggle_sound')}>
                        {isSoundOn ? <VolumeUpIcon className="w-6 h-6"/> : <VolumeOffIcon className="w-6 h-6"/>}
                    </button>
                </div>
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {boxes.map((box, index) => (
                    <div key={index} onClick={() => handleBoxClick(box.points)} className={`aspect-square rounded-lg shadow-lg flex flex-col justify-center items-center text-white font-bold cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 ${box.color} ${box.hover} ${turnInProgress || winner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <GiftIcon className="w-16 h-16"/>
                        <p className="text-xl mt-2">{t('game_box')} {index + 1}</p>
                    </div>
                ))}
            </div>

            {/* Question Modal */}
            {currentQuestion && (
                <Modal 
                    title={t('game_question_title').replace('{points}', String(selectedBoxPoints))} 
                    onClose={answerResult ? proceedToNextTurn : () => {}}
                    {...(answerResult && { onConfirm: proceedToNextTurn, confirmText: t('game_continue_button') })}
                >
                    <div className="text-left relative">
                         <div className="absolute top-0 right-0 bg-yellow-400 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                            {selectedBoxPoints} {t('game_points')}
                        </div>
                        {timer !== null && !answerResult && <p className="text-2xl font-bold text-center text-red-500 mb-4">{t('game_timer').replace('{seconds}', String(timer))}</p>}
                        <h3 className="text-xl font-semibold mb-6 text-center">{currentQuestion.question}</h3>
                        
                        {!answerResult ? (
                            <div className="space-y-3">
                                {currentQuestion.options.map(option => (
                                    <button key={option} onClick={() => handleAnswer(option)} className="w-full text-left p-4 rounded-lg border-2 bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:border-yellow-300 transition-all duration-200">
                                        {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {answerResult.isCorrect ? (
                                    <div className="p-4 rounded-lg text-center bg-green-100 text-green-800">
                                        <h4 className="font-bold text-lg">
                                            {`${t('game_correct_answer_header')} (+${selectedBoxPoints} ${t('game_points')})`}
                                        </h4>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-lg text-center bg-red-100 text-red-800">
                                        <h4 className="font-bold text-lg">
                                            {`${t('game_wrong_answer_header')} (+0 ${t('game_points')})`}
                                        </h4>
                                    </div>
                                )}

                                {!answerResult.isCorrect && (
                                    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg text-yellow-800">
                                        <p className="font-semibold">{t('game_correct_answer_is')}</p>
                                        <p>{currentQuestion.correct_answer}</p>
                                    </div>
                                )}
                                
                                <div className="p-4 bg-gray-100 rounded-lg">
                                    <p className="font-semibold">{t('quiz_explanation')}</p>
                                    <p>{answerResult.explanation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <Modal title={t('game_settings_title')} onClose={() => setShowSettingsModal(false)}>
                    <div className="p-4 space-y-6 text-left">
                        <div>
                            <label htmlFor="sfx-volume" className="block mb-2 font-semibold text-gray-700">{t('game_sfx_volume')}</label>
                            <input
                                id="sfx-volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={sfxVolume}
                                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B72B9]"
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">{(sfxVolume * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                            <label htmlFor="music-volume" className="block mb-2 font-semibold text-gray-700">{t('game_music_volume')}</label>
                            <input
                                id="music-volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B72B9]"
                            />
                             <div className="text-right text-sm text-gray-500 mt-1">{(musicVolume * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Message/Result Modal */}
            {(message && !winner) && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-2xl font-bold animate-pulse">
                        {message}
                    </div>
                </div>
            )}
            
            {/* Winner Modal */}
            {winner && (
                 <Modal title={t('game_over_title')} onClose={resetGame} onConfirm={resetGame} confirmText={t('game_play_again')}>
                     <div className="text-center p-8">
                        <h3 className="text-4xl font-bold text-yellow-500 mb-4">{getWinnerTitle()}</h3>
                        <p className="text-xl">{getWinnerSubtitle()}</p>
                        <p className="text-lg mt-4">{t('game_final_score')}</p>
                        <p>{t('game_player')} 1: <span className="font-bold">{scores[1]}</span> - {t('game_player')} 2: <span className="font-bold">{scores[2]}</span></p>
                     </div>
                 </Modal>
            )}
        </div>
    );
};

export default GameScreen;