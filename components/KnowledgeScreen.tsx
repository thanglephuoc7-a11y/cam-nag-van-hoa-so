import React, { useState } from 'react';
import { knowledgeItems } from '../data/knowledge';
import type { KnowledgeItem } from '../types';
import { ChevronDownIcon, GavelIcon, HeartIcon, UsersIcon, BookOpenIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import MindMap from './MindMap';

const AccordionItem: React.FC<{ item: KnowledgeItem }> = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  const typeStyles: { [key: string]: { border: string, iconColor: string } } = {
    law: { border: 'border-red-500', iconColor: 'text-red-500' },
    ethics: { border: 'border-blue-500', iconColor: 'text-blue-500' },
    culture: { border: 'border-green-500', iconColor: 'text-green-500' },
    general: { border: 'border-gray-500', iconColor: 'text-gray-500' }
  };

  const currentStyle = typeStyles[item.type] || typeStyles.general;

  const getIcon = () => {
    const props = { className: `w-6 h-6 mr-4 flex-shrink-0 ${currentStyle.iconColor}` };
    switch(item.type) {
        case 'law': return <GavelIcon {...props} />;
        case 'ethics': return <HeartIcon {...props} />;
        case 'culture': return <UsersIcon {...props} />;
        case 'general': return <BookOpenIcon {...props} />;
        default: return <BookOpenIcon {...props} />;
    }
  };

  return (
    <div className={`border-l-4 ${currentStyle.border} bg-white rounded-lg shadow-sm mb-4 overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left"
      >
        <div className="flex items-center flex-grow mr-4 min-w-0">
          {getIcon()}
          <span className="font-semibold text-lg text-gray-800 flex-1">{item.short_text}</span>
        </div>
        <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-5 border-t border-gray-200">
          <p className="text-gray-700 whitespace-pre-wrap">{item.tip_or_checklist}</p>
          {item.infographic_link && (
            <div className="mt-4">
              <img src={item.infographic_link} alt="Infographic" className="rounded-lg shadow-md max-w-full h-auto" />
            </div>
          )}
          <div className="mt-4 text-sm text-gray-500">
            <span className="font-semibold">{t('knowledge_source')}:</span> {item.source_ref} ({item.source_type})
          </div>
        </div>
      )}
    </div>
  );
};

const KnowledgeScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('knowledge_title')}</h2>
      
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-center text-gray-700 mb-6">{t('knowledge_mindmap_title')}</h3>
        <MindMap />
      </div>

      <div className="max-w-4xl mx-auto">
        {knowledgeItems.map((item) => (
          <AccordionItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default KnowledgeScreen;