import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import * as geminiService from '../../services/geminiService';
import { BotIcon, SendIcon, SparklesIcon, MicIcon, UserIcon } from '../icons';
import { useAppContext } from '../../contexts/AppContext';
import { translations } from '../../translations';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const ChatCompanion: React.FC = () => {
    const { language } = useAppContext();
    const t = translations[language];

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        setMessages([{ role: 'model', content: t.chat_welcome }]);
    }, [t.chat_welcome]);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = language === 'ar' ? 'ar-SA' : 'en-US';
            recognitionRef.current.onstart = () => setIsListening(true);
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
            };
        }
    }, [language]);

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };
    
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);
    
    useEffect(() => {
        geminiService.startChatSession(language);
    }, [language]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.sendMessageToAI(input, language);
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: t.chat_error };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 ${language === 'ar' ? 'right-6' : 'left-6'} bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition transform hover:scale-110 z-20`}
                aria-label={t.open_chat}
            >
                <SparklesIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className={`fixed bottom-24 ${language === 'ar' ? 'right-6' : 'left-6'} w-full max-w-sm h-[60vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 z-20`}>
                    <header className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <BotIcon className="w-6 h-6 text-orange-500" />
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t.chat_title}</h3>
                    </header>

                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                                {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-orange-500"/></div>}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-orange-500 text-white rounded-bl-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-br-none'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-slate-500"/></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-orange-500"/></div>
                                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-br-none">
                                    <div className="flex items-center gap-1">
                                        <span className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-2 w-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-2 w-2 bg-orange-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <footer className="p-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={t.chat_placeholder}
                                className="w-full p-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border-transparent focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                disabled={isLoading}
                            />
                            {recognitionRef.current && (
                                <button onClick={toggleVoice} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'} hover:bg-slate-300 dark:hover:bg-slate-500`}>
                                    <MicIcon className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 hover:bg-orange-600">
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default ChatCompanion;