import React, { useState, useEffect, useRef } from 'react';
import { getChatAdvice } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SendIcon, MicrophoneIcon } from './icons';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const CHAT_HISTORY_KEY = 'advisorChatHistory';

const AdvisorScreen: React.FC = () => {
  const { t, lang } = useLanguage();
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
          return parsedHistory;
        }
      }
    } catch (error) {
      console.error("Failed to load or parse chat history:", error);
    }
    return [];
  });

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'vi' ? 'vi-VN' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setChatInput(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.abort();
    };
  }, [lang]);
  
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{ role: 'model', content: t('scenarios_chat_greeting') }]);
    }
  }, [t]);

  useEffect(() => {
    // Only save if the conversation has more than just the initial greeting
    if (chatMessages.length > 1) {
      try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatMessages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    }
  }, [chatMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);
  
  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || isChatLoading) return;

      if (isListening) {
        recognitionRef.current?.stop();
      }

      const userMessage: ChatMessage = { role: 'user', content: chatInput.trim() };
      const newMessages = [...chatMessages, userMessage];
      setChatMessages(newMessages);
      setChatInput('');
      setIsChatLoading(true);

      try {
        const aiResponse = await getChatAdvice(newMessages);
        const modelMessage: ChatMessage = { role: 'model', content: aiResponse };
        setChatMessages(prev => [...prev, modelMessage]);
      } catch (err) {
        const errorMessage: ChatMessage = { role: 'model', content: t('scenarios_error') };
        setChatMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsChatLoading(false);
      }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setChatInput('');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#0B72B9] mb-8">{t('advisor_title')}</h2>
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col max-h-[75vh]">
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">🤖</div>}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#0B72B9] text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">🤖</div>
                <div className="max-w-xs p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                  <p className="animate-pulse text-sm">...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleChatSubmit} className="p-3 border-t flex items-center gap-2 bg-gray-50">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleChatSubmit(e as any);
                }
              }}
              placeholder={t('scenarios_chat_placeholder')}
              className="flex-grow p-2 border rounded-lg resize-none focus:ring-2 focus:ring-[#0B72B9] focus:outline-none"
              rows={2}
              disabled={isChatLoading}
            />
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isChatLoading}
              className={`p-3 rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={isListening ? t('advisor_stop_recording') : t('advisor_start_recording')}
            >
              <MicrophoneIcon className="w-5 h-5"/>
            </button>
            <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="bg-[#0B72B9] text-white p-3 rounded-full hover:bg-[#085a94] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0">
              <SendIcon className="w-5 h-5"/>
            </button>
          </form>
        </div>
    </div>
  );
};

export default AdvisorScreen;