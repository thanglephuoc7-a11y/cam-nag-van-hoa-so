import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { questions as allQuestions } from '../data/questions';
import type { Question, QuizResult } from '../types';
import Modal from './Modal';
import { CheckIcon, XIcon, HelpCircleIcon, ClockIcon, TrophyIcon, PlayIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface QuizScreenProps {
  onQuizComplete: (result: QuizResult) => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ onQuizComplete }) => {
  const { t } = useLanguage();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<number | null>(null);

  const questions = useMemo(() => allQuestions.sort(() => 0.5 - Math.random()).slice(0, 20), []);
  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('finished');
    }
  }, [currentQuestionIndex, questions.length]);
  
  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }
    
    setTimeLeft(30);

    timerRef.current = window.setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
                if(timerRef.current) clearInterval(timerRef.current);
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);
    
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, gameState]);

  useEffect(() => {
      if (timeLeft === 0 && gameState === 'playing') {
          handleNext();
      }
  }, [timeLeft, gameState, handleNext]);

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setGameState('playing');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionIndex,
    });
  };

  const calculateResults = useCallback(() => {
    let totalScore = 0;
    const partScores: { [key: string]: { correct: number; total: number } } = {
      'Đạo đức': { correct: 0, total: 0 },
      'Pháp luật': { correct: 0, total: 0 },
      'Văn hóa số': { correct: 0, total: 0 },
    };

    questions.forEach((q) => {
      partScores[q.part].total++;
      if (answers[q.id] === q.correct_index) {
        partScores[q.part].correct++;
      }
    });
    
    const finalPartScores: { [key: string]: number } = {};
    let totalCorrect = 0;
    Object.keys(partScores).forEach(part => {
        totalCorrect += partScores[part].correct;
        finalPartScores[part] = partScores[part].total > 0 ? Math.round((partScores[part].correct / partScores[part].total) * 100) : 0;
    });

    totalScore = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

    return { totalScore, finalPartScores };
  }, [answers, questions]);

  const handleSubmit = () => {
    const { totalScore, finalPartScores } = calculateResults();
    const result: QuizResult = {
      timestamp: new Date().toISOString(),
      total_score: totalScore,
      part_scores: finalPartScores,
      answers: answers
    };
    onQuizComplete(result);
  };
  
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timeProgress = (timeLeft / 30) * 100;
  const { totalScore, finalPartScores } = (gameState === 'finished') ? calculateResults() : { totalScore: 0, finalPartScores: {} };
  
  const isTrueFalse = currentQuestion?.type === 'true_false';

  if (gameState === 'idle') {
    const infoItems = [
      {
        icon: <HelpCircleIcon className="w-8 h-8 text-blue-500" />,
        title: t('quiz_info_questions').replace('{count}', String(questions.length)),
        description: t('quiz_info_questions_desc'),
        color: 'bg-blue-100'
      },
      {
        icon: <ClockIcon className="w-8 h-8 text-red-500" />,
        title: t('quiz_info_timer'),
        description: t('quiz_info_timer_desc'),
        color: 'bg-red-100'
      },
      {
        icon: <TrophyIcon className="w-8 h-8 text-yellow-500" />,
        title: t('quiz_info_scoring'),
        description: t('quiz_info_scoring_desc'),
        color: 'bg-yellow-100'
      },
    ];
    
    return (
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-[#0B72B9] mb-4">{t('quiz_title')}</h2>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('quiz_start_heading')}</h3>
          <p className="text-gray-600 mb-8">{t('quiz_start_title')}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
            {infoItems.map(item => (
              <div key={item.title} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 border">
                 <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                    {item.icon}
                 </div>
                 <div>
                    <p className="font-bold text-gray-700">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                 </div>
              </div>
            ))}
          </div>

          <button onClick={handleStartQuiz} className="bg-green-500 text-white font-bold py-4 px-10 rounded-full shadow-lg hover:bg-green-600 transition-transform transform hover:scale-105 text-xl inline-flex items-center space-x-3">
            <PlayIcon className="w-6 h-6" />
            <span>{t('quiz_start_button')}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('quiz_title')}</h2>
      
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        {gameState === 'playing' && questions.length > 0 ? (
          <>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1 text-right">{t('quiz_question_progress').replace('{current}', String(currentQuestionIndex + 1)).replace('{total}', String(questions.length))}</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-[#0B72B9] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>

            <div className="mb-6">
                <div className="text-sm text-red-500 font-semibold mb-1 text-right">{t('quiz_time_left')} {timeLeft}s</div>
                <div className="w-full bg-red-100 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: `${timeProgress}%` }}></div>
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-center whitespace-pre-wrap">{currentQuestion.question}</h3>
            
            {isTrueFalse ? (
                <div className="flex justify-around items-center mt-8">
                    <button
                        onClick={() => handleAnswerSelect(0)}
                        className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 transition-all duration-200
                        ${answers[currentQuestion.id] === 0 
                            ? 'bg-green-500 border-green-700 text-white shadow-lg scale-105' 
                            : 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400'}`}
                    >
                        <CheckIcon className="w-12 h-12 mb-2" />
                        <span className="text-2xl font-bold">{t('quiz_true')}</span>
                    </button>
                    <button
                        onClick={() => handleAnswerSelect(1)}
                        className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-4 transition-all duration-200
                        ${answers[currentQuestion.id] === 1
                            ? 'bg-red-500 border-red-700 text-white shadow-lg scale-105'
                            : 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200 hover:border-red-400'}`}
                    >
                        <XIcon className="w-12 h-12 mb-2" />
                        <span className="text-2xl font-bold">{t('quiz_false')}</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        answers[currentQuestion.id] === option.id
                          ? 'bg-yellow-200 border-yellow-400 font-bold'
                          : 'bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:border-yellow-300'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
            )}

            <div className="mt-8 text-right">
              <button
                onClick={handleNext}
                disabled={answers[currentQuestion.id] === undefined}
                className="bg-[#0B72B9] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-[#085a94] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {currentQuestionIndex < questions.length - 1 ? t('quiz_next_button') : t('quiz_finish_button')}
              </button>
            </div>
          </>
        ) : (
          gameState === 'finished' && (
            <Modal title={t('quiz_results_title')} onClose={() => setGameState('idle')} onConfirm={handleSubmit} confirmText={t('quiz_results_confirm')}>
              <div className="text-center">
                  <p className="text-lg mb-2">{t('quiz_total_score')}</p>
                  <p className="text-5xl font-bold text-[#0B72B9] mb-6">{totalScore}/100</p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                      {Object.entries(finalPartScores).map(([part, score]) => (
                          <div key={part}>
                              <p className="font-semibold">{part}</p>
                              <p className="text-2xl font-bold">{score}</p>
                          </div>
                      ))}
                  </div>
                  <hr className="my-4"/>
                  <div className="text-left max-h-96 overflow-y-auto pr-2">
                      <h4 className="font-bold text-lg mb-2">{t('quiz_review_answers')}</h4>
                      {questions.map((q, index) => {
                          const userAnswerId = answers[q.id];
                          const wasCorrect = userAnswerId === q.correct_index;
                          const pointsPerQuestion = Math.round(100 / questions.length);
                          const pointsAwarded = wasCorrect ? pointsPerQuestion : 0;

                          return (
                              <div key={q.id} className="p-3 rounded-lg mb-3 border-b border-gray-200">
                                  <p className="font-semibold mb-3">{index + 1}. {q.question} 
                                  <span className={`ml-2 font-bold ${wasCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                      ({pointsAwarded}/{pointsPerQuestion} điểm)
                                  </span>
                                  </p>
                                  <div className="space-y-2">
                                  {q.options.map((option) => {
                                      const isCorrectAnswer = option.id === q.correct_index;
                                      const isUserSelection = option.id === userAnswerId;
                                      
                                      let optionClasses = 'w-full text-left p-3 rounded-lg border-2 flex items-center justify-between text-sm';

                                      if (isCorrectAnswer) {
                                          optionClasses += ' bg-green-100 border-green-300 text-green-800 font-bold';
                                      } else if (isUserSelection && !isCorrectAnswer) {
                                          optionClasses += ' bg-red-100 border-red-300 text-red-800 font-semibold';
                                      } else {
                                          optionClasses += ' bg-gray-50 border-gray-200 text-gray-700';
                                      }

                                      return (
                                          <div key={option.id} className={optionClasses}>
                                              <span>{option.text}</span>
                                              {isCorrectAnswer && <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />}
                                              {isUserSelection && !isCorrectAnswer && <XIcon className="w-5 h-5 text-red-600 flex-shrink-0" />}
                                          </div>
                                      );
                                  })}
                                  </div>
                                  <p className="text-sm mt-3 text-gray-700"><em>{t('quiz_explanation')} {q.explanation}</em></p>
                                  {q.source_law_ref && <p className="text-xs mt-1 text-gray-600"><strong>{t('quiz_reference')}</strong> {q.source_law_ref}</p>}
                              </div>
                          )
                      })}
                  </div>
              </div>
            </Modal>
          )
        )}
      </div>
    </div>
  );
};

export default QuizScreen;