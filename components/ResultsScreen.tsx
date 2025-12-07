import React, { useMemo } from 'react';
import { scenarios } from '../data/scenarios';
import type { QuizResult, ScenarioHistoryItem } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import SeverityBadge from './SeverityBadge';

interface HistoryScreenProps {
  quizHistory: QuizResult[];
  scenarioHistory: ScenarioHistoryItem[];
}

const LineChart: React.FC<{ data: { score: number; date: string }[], title: string, t: (key: string) => string }> = ({ data, title, t }) => {
    const width = 500;
    const height = 300;
    const padding = 50;

    const points = data.map((point, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (point.score / 100) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold text-gray-700 mb-4 text-center">{title}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y Axis */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d1d5db" />
                {[0, 25, 50, 75, 100].map(val => (
                    <g key={val}>
                        <text x={padding - 10} y={height - padding - (val / 100) * (height - 2 * padding)} textAnchor="end" dominantBaseline="middle" fill="#6b7280" fontSize="12">{val}</text>
                        <line x1={padding} y1={height - padding - (val / 100) * (height - 2 * padding)} x2={width - padding} y2={height - padding - (val / 100) * (height - 2 * padding)} stroke="#e5e7eb" strokeDasharray="2,2"/>
                    </g>
                ))}
                <text transform={`rotate(-90) translate(-${height/2}, 15)`} textAnchor="middle" fill="#6b7280" fontSize="14">{t('history_score')}</text>

                {/* X Axis */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d1d5db" />
                 {data.map((_, i) => (
                    <text key={i} x={padding + (i / (data.length - 1)) * (width - 2 * padding)} y={height - padding + 20} textAnchor="middle" fill="#6b7280" fontSize="12">{t('history_quiz_attempt')} {i + 1}</text>
                ))}

                {/* Data Line */}
                <polyline fill="none" stroke="#0B72B9" strokeWidth="3" points={points} />
                {data.map((point, i) => (
                    <g key={i}>
                        <circle cx={padding + (i / (data.length - 1)) * (width - 2 * padding)} cy={height - padding - (point.score / 100) * (height - 2 * padding)} r="5" fill="#0B72B9" className="cursor-pointer" />
                        <title>{`${t('history_quiz_attempt')} ${i + 1}: ${point.score} - ${point.date}`}</title>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const RadarChart: React.FC<{ data: { [key: string]: number }, title: string }> = ({ data, title }) => {
    const width = 300;
    const height = 300;
    const center = { x: width / 2, y: height / 2 };
    const radius = Math.min(width, height) / 2 * 0.8;
    const labels = Object.keys(data);
    const numLabels = labels.length;

    const getPoint = (index: number, value: number) => {
        const angle = (Math.PI * 2 * index) / numLabels - Math.PI / 2;
        const x = center.x + (value / 100) * radius * Math.cos(angle);
        const y = center.y + (value / 100) * radius * Math.sin(angle);
        return `${x},${y}`;
    };

    const points = labels.map((_, i) => getPoint(i, data[labels[i]])).join(' ');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-xl font-bold text-gray-700 mb-4 text-center">{title}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Grid lines */}
                {[25, 50, 75, 100].map(val => (
                    <polygon
                        key={val}
                        points={labels.map((_, i) => getPoint(i, val)).join(' ')}
                        fill="none"
                        stroke="#e5e7eb"
                    />
                ))}
                {labels.map((_, i) => (
                    <line key={i} x1={center.x} y1={center.y} x2={parseFloat(getPoint(i, 100).split(',')[0])} y2={parseFloat(getPoint(i, 100).split(',')[1])} stroke="#d1d5db" />
                ))}
                
                {/* Data Polygon */}
                <polygon points={points} fill="rgba(11, 114, 185, 0.5)" stroke="#0B72B9" strokeWidth="2" />

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = (Math.PI * 2 * i) / numLabels - Math.PI / 2;
                    const x = center.x + (radius + 20) * Math.cos(angle);
                    const y = center.y + (radius + 20) * Math.sin(angle);
                    return <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#374151" fontSize="12" fontWeight="bold">{label}</text>
                })}
            </svg>
        </div>
    );
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ quizHistory, scenarioHistory }) => {
  const { t, lang } = useLanguage();
  const latestResult = quizHistory.length > 0 ? quizHistory[quizHistory.length - 1] : null;

  const lineChartData = useMemo(() => {
    return quizHistory.map((r) => ({ score: r.total_score, date: new Date(r.timestamp).toLocaleDateString(lang) }));
  }, [quizHistory, lang]);

  const radarChartData = useMemo(() => {
    if (quizHistory.length === 0) return {};

    // FIX: Explicitly type the accumulator ('acc') in the reduce function.
    // This resolves an issue where TypeScript could not infer the type of `acc[part]`,
    // leading to errors when trying to access properties like 'total' and 'count'.
    const totals = quizHistory.reduce((acc: Record<string, { total: number; count: number }>, curr) => {
        Object.entries(curr.part_scores).forEach(([part, score]) => {
            if (!acc[part]) {
                acc[part] = { total: 0, count: 0 };
            }
            acc[part].total += score;
            acc[part].count += 1;
        });
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const averages: {[key:string]: number} = {};
    Object.entries(totals).forEach(([part, data]) => {
        averages[part] = Math.round(data.total / data.count);
    });

    return averages;
  }, [quizHistory]);

  const getRecommendations = () => {
    if (!latestResult) return [];
    const recommendations = [];
    if (latestResult.part_scores['Pháp luật'] < 70) {
      recommendations.push("history_rec_law");
    }
    if (latestResult.part_scores['Đạo đức'] < 70) {
      recommendations.push("history_rec_ethics");
    }
    if (latestResult.part_scores['Văn hóa số'] < 70) {
        recommendations.push("history_rec_culture");
    }
    if (recommendations.length === 0) {
        recommendations.push("history_rec_good");
    }
    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('history_title')}</h2>
      
      {quizHistory.length === 0 && scenarioHistory.length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg text-gray-600">{t('history_empty')}</p>
        </div>
      ) : (
        <div className="space-y-12">
            {quizHistory.length > 0 && latestResult && (
                <div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-6">{t('history_latest_quiz')}</h3>
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 items-center">
                            <div className="text-center mb-4 md:mb-0">
                                <p className="text-gray-500">{t('history_total_score')}</p>
                                <p className="text-6xl font-bold text-[#0B72B9]">{latestResult.total_score}</p>
                            </div>
                            <div className="col-span-2 flex justify-around">
                                {Object.entries(latestResult.part_scores).map(([part, score]) => (
                                    <div key={part} className="text-center">
                                        <p className="font-semibold">{part}</p>
                                        <p className="text-3xl font-bold">{score}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Visualization Section */}
            {quizHistory.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-6">{t('history_progress_title')}</h3>
                    {quizHistory.length < 2 ? (
                        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
                           {t('history_no_chart_data')}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3">
                                <LineChart data={lineChartData} title={t('history_quiz_trend_title')} t={t} />
                            </div>
                            <div className="lg:col-span-2">
                                <RadarChart data={radarChartData} title={t('history_part_strengths_title')} />
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Scenario History Section */}
            {scenarioHistory.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-700 mb-6">{t('history_scenario_title')}</h3>
                <div className="space-y-6">
                  {scenarioHistory.slice().reverse().map((item, index) => {
                    const scenario = scenarios.find(s => s.id === item.scenarioId);
                    if (!scenario) return null;
                    const userChoice = scenario.options.find(opt => opt.id === item.choice);
                    const { ethical_analysis, legal_analysis, recommended_action, severity_score } = item.advisor_response;

                    return (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                        <p className="text-sm text-gray-500 mb-2">{new Date(item.timestamp).toLocaleString(lang)}</p>
                        <h4 className="font-bold text-lg mb-1">{t('history_scenario_header')} <span className="font-normal">{scenario.title}</span></h4>
                        <p className="font-semibold text-md mb-3">{t('history_your_choice')} <span className="font-normal italic">"{userChoice?.text}"</span></p>

                        <details className="bg-gray-50 p-3 rounded-md">
                          <summary className="font-semibold cursor-pointer text-[#0B72B9]">{t('history_ai_analysis')}</summary>
                          <div className="mt-4 space-y-4 text-left p-2 border-t">
                              <div>
                                  <h5 className="font-bold text-md text-[#0B72B9]">{t('scenarios_ethics_analysis')}</h5>
                                  <p className="text-sm">{ethical_analysis}</p>
                              </div>
                              <div>
                                  <h5 className="font-bold text-md text-red-600">{t('scenarios_legal_analysis')}</h5>
                                  <p className="text-sm">{legal_analysis}</p>
                              </div>
                              <div>
                                  <h5 className="font-bold text-md text-green-600">{t('scenarios_recommended_action')}</h5>
                                  <p className="text-sm">{recommended_action}</p>
                              </div>
                              <div className="mt-2">
                                  <SeverityBadge score={severity_score} />
                              </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;