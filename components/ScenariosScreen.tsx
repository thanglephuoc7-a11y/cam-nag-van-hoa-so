

import React, { useState } from 'react';
import { scenarios } from '../data/scenarios';
import type { Scenario, ScenarioOption, ScenarioResult } from '../types';
import { getScenarioAdvice } from '../services/geminiService';
import Modal from './Modal';
import SeverityBadge from './SeverityBadge';
import { useLanguage } from '../contexts/LanguageContext';
import { CameraIcon, Share2Icon, HeartIcon, GavelIcon, CheckSquareIcon, BookOpenIcon } from './icons';

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
  CameraIcon,
  Share2Icon,
};

const getScenarioIcon = (iconName: string) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="w-16 h-16 text-[#0B72B9]" /> : <BookOpenIcon className="w-16 h-16 text-[#0B72B9]" />;
};

const ScenariosScreen: React.FC<{onScenarioAnalyzed: (analysis: any) => void;}> = ({ onScenarioAnalyzed }) => {
  const { t } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ScenarioResult | null>(null);

  const handleOptionSelect = async (scenario: Scenario, option: ScenarioOption) => {
    setSelectedScenario(scenario);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await getScenarioAdvice(scenario, option);
      setAnalysisResult(result);
      onScenarioAnalyzed({
        scenarioId: scenario.id,
        choice: option.id,
        advisor_response: result,
      });
    } catch (err) {
      console.error(err);
      setError(t('scenarios_error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const closeModal = () => {
    setAnalysisResult(null);
    setSelectedScenario(null);
    setError(null);
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('scenarios_title')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center border border-gray-200 h-full transform transition-transform hover:-translate-y-1">
            <div className="w-24 h-24 mb-4 rounded-full flex items-center justify-center bg-blue-100">
              {getScenarioIcon(scenario.icon)}
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{scenario.title}</h3>
            <p className="text-gray-600 mb-4 flex-grow">{scenario.description}</p>
            <div className="space-y-3 mt-auto w-full">
              {scenario.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(scenario, option)}
                  className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(isLoading || analysisResult || error) && (
        <Modal 
            title={isLoading ? t('scenarios_loading_title') : t('scenarios_results_title')} 
            onClose={closeModal}
            onConfirm={!isLoading ? closeModal : undefined}
            confirmText={!isLoading ? t('modal_close_button') : undefined}
        >
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0B72B9]"></div>
              <p className="mt-4 text-lg">{t('scenarios_loading_message')}</p>
            </div>
          )}
          {error && (
             <div className="text-center p-4">
                 <p className="text-red-600">{error}</p>
             </div>
          )}
          {analysisResult && selectedScenario && (
            <div className="space-y-6 text-left p-2">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                        <HeartIcon className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />
                        <h4 className="font-bold text-lg text-blue-600">{t('scenarios_ethics_analysis')}</h4>
                    </div>
                    <p className="text-gray-700">{analysisResult.ethical_analysis}</p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                    <div className="flex items-center mb-2">
                        <GavelIcon className="w-6 h-6 mr-3 text-red-500 flex-shrink-0" />
                        <h4 className="font-bold text-lg text-red-600">{t('scenarios_legal_analysis')}</h4>
                    </div>
                    <p className="text-gray-700">{analysisResult.legal_analysis}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-center mb-2">
                        <CheckSquareIcon className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" />
                        <h4 className="font-bold text-lg text-green-600">{t('scenarios_recommended_action')}</h4>
                    </div>
                    <p className="text-gray-700">{analysisResult.recommended_action}</p>
                </div>

                {analysisResult.positive_alternative && (
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                    <div className="flex items-center mb-2">
                        <BookOpenIcon className="w-6 h-6 mr-3 text-yellow-500 flex-shrink-0" />
                        <h4 className="font-bold text-lg text-yellow-600">{t('scenarios_positive_alternative')}</h4>
                    </div>
                    <p className="text-gray-700">{analysisResult.positive_alternative}</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t gap-4">
                    <SeverityBadge score={analysisResult.severity_score} />
                    <p className="text-sm text-green-700 font-medium">{t('scenarios_result_saved')}</p>
                </div>

                {analysisResult.citations && analysisResult.citations.length > 0 && (
                    <div className="pt-4 border-t">
                        <h4 className="font-bold text-md text-gray-700">{t('scenarios_citations')}</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                            {analysisResult.citations.map((cite, index) => (
                                <li key={index}><strong>{cite.title}:</strong> "{cite.excerpt}"</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ScenariosScreen;