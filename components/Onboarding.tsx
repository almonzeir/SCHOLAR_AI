import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import { SparklesIcon, DocumentTextIcon, EditIcon, UploadIcon, MicIcon, StopIcon } from './icons';
import * as geminiService from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';


interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [view, setView] = useState<'welcome' | 'parse_resume' | 'form' | 'voice_onboarding'>('welcome');
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        education: [{ institution: '', degree: '', fieldOfStudy: '', gpa: 0 }],
        experience: [{ company: '', role: '', description: '' }],
        skills: [],
        languages: [],
        goals: '',
        financialSituation: '',
        studyInterests: [],
    });

    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState('');
    const { language } = useAppContext();
    const t = translations[language];

    const [fileName, setFileName] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Voice Onboarding State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const visualizerRef = useRef<HTMLCanvasElement>(null);
    // FIX: Initialize useRef with a value (null) to resolve type error.
    const animationFrameRef = useRef<number | null>(null);
    // PERF: Create AudioContext once and reuse.
    const audioContextRef = useRef<AudioContext | null>(null);

    // PERF: Cleanup AudioContext on unmount.
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const isStepValid = useMemo(() => {
        switch (step) {
            case 1:
                return profile.name.trim() !== '';
            case 2:
                return profile.education.every(edu => edu.institution.trim() !== '' && edu.degree.trim() !== '' && edu.fieldOfStudy.trim() !== '');
            case 3:
                return profile.goals.trim() !== '' && profile.skills.length > 0 && profile.studyInterests.length > 0 && profile.financialSituation !== '';
            default:
                return false;
        }
    }, [step, profile]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const allowedMimeTypes = [
            'text/plain',
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const allowedExtensions = ['.txt', '.pdf', '.docx'];
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

        if (allowedMimeTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
            setFileName(file.name);
            setResumeFile(file);
            setResumeText('');
            setParseError('');
        } else {
            setParseError('Unsupported file type. Please upload a .txt, .pdf, or .docx file.');
            setFileName('');
            setResumeFile(null);
        }
    };
    
    const fileToBase64 = (file: Blob): Promise<string> => 
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); 
            };
            reader.onerror = error => reject(error);
        });

    const handleParseResume = async () => {
        if (!resumeText.trim() && !resumeFile) return;
        setIsParsing(true);
        setParseError('');
        try {
            let parsedProfile: Partial<UserProfile>;

            if (resumeFile) {
                const base64Data = await fileToBase64(resumeFile);
                const fileData = { data: base64Data, mimeType: resumeFile.type };
                parsedProfile = await geminiService.parseResumeFileToProfile(fileData, language);
            } else {
                parsedProfile = await geminiService.parseResumeToProfile(resumeText, language);
            }

            setProfile(prev => ({
                ...prev,
                ...parsedProfile,
                name: parsedProfile.name || prev.name,
                education: parsedProfile.education?.length ? parsedProfile.education : prev.education,
                experience: parsedProfile.experience?.length ? parsedProfile.experience : prev.experience,
                skills: parsedProfile.skills || prev.skills,
                languages: parsedProfile.languages || prev.languages,
                studyInterests: parsedProfile.studyInterests || prev.studyInterests,
                goals: parsedProfile.goals || prev.goals,
                financialSituation: parsedProfile.financialSituation || prev.financialSituation,
            }));
            setView('form');
            setStep(1); 
        } catch (error: any) {
            setParseError(error.message || t.parse_error);
        } finally {
            setIsParsing(false);
        }
    };
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                handleParseAudio(audioBlob);
                if (audioStreamRef.current) {
                   audioStreamRef.current.getTracks().forEach(track => track.stop());
                }
                if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            visualize(stream);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setParseError("Microphone access denied. Please enable it in your browser settings.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    const handleParseAudio = async (audioBlob: Blob) => {
        setIsParsing(true);
        setParseError('');
        try {
            const base64Data = await fileToBase64(audioBlob);
            const audioData = { data: base64Data, mimeType: audioBlob.type };
            const parsedProfile = await geminiService.parseAudioToProfile(audioData, 'en');

            setProfile(prev => ({ ...prev, ...parsedProfile }));
            setView('form');
            setStep(1);
        } catch (error: any) {
            setParseError(error.message || t.parse_error);
        } finally {
            setIsParsing(false);
        }
    };

    const visualize = (stream: MediaStream) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        const audioContext = audioContextRef.current;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        source.connect(analyser);

        const canvas = visualizerRef.current;
        if (!canvas) return;
        const canvasCtx = canvas.getContext('2d');
        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            if(canvasCtx){
                canvasCtx.fillStyle = theme === 'light' ? '#f8fafc' : '#1e293b';
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let barHeight;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    barHeight = dataArray[i] / 2;
                    canvasCtx.fillStyle = `rgba(249, 115, 22, ${barHeight / 100})`;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            }
        };
        draw();
    };

    const { theme } = useAppContext();
    useEffect(() => {
        // Redraw canvas if theme changes while recording to update background color
        if (isRecording && audioStreamRef.current) {
            if(animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            visualize(audioStreamRef.current);
        }
    }, [theme, isRecording]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };
    
    const handleListChange = (name: 'skills' | 'languages' | 'studyInterests', value: string) => {
        setProfile(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(Boolean) }));
    };
    
    const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newEducation = [...profile.education];
        // FIX: Add a fallback to 0 for parseFloat to prevent NaN values for GPA.
        (newEducation[index] as any)[name] = name === 'gpa' ? (parseFloat(value) || 0) : value;
        setProfile(prev => ({ ...prev, education: newEducation }));
    };

    const addEducation = () => {
        setProfile(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', fieldOfStudy: '', gpa: 0 }] }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = () => {
        if (!isStepValid) return;
        onComplete(profile);
    };
    
    const renderForm = () => {
        const inputClasses = "w-full p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 placeholder-slate-400 dark:placeholder-slate-400";
        const renderStepContent = () => {
            switch (step) {
                case 1:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">{t.profile_title}</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">{t.full_name}</p>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="e.g., Alex Doe"
                                className={inputClasses}
                                required
                            />
                        </div>
                    );
                case 2:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.education}</h2>
                            {profile.education.map((edu, index) => (
                                 <div key={index} className="space-y-3 p-4 mb-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <input name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} placeholder="Institution *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)} placeholder="Field of Study *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="gpa" type="number" step="0.1" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} placeholder="GPA" className={inputClasses.replace('p-3', 'p-2')}/>
                                </div>
                            ))}
                             <button onClick={addEducation} className="text-sm text-orange-600 hover:text-orange-500">+ Add another institution</button>
                        </div>
                    );
                case 3:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.skills} & Interests</h2>
                            <div className="space-y-4">
                                <textarea name="goals" value={profile.goals} onChange={handleChange} placeholder="What are your academic and career goals? *" className={`${inputClasses} h-24`} required/>
                                <input type="text" defaultValue={profile.skills.join(', ')} onChange={(e) => handleListChange('skills', e.target.value)} placeholder="Skills (comma-separated, e.g., Python, Research) *" className={inputClasses} required/>
                                <input type="text" defaultValue={profile.studyInterests.join(', ')} onChange={(e) => handleListChange('studyInterests', e.target.value)} placeholder="Fields of interest (e.g., AI, Marine Biology) *" className={inputClasses} required/>
                                <input type="text" defaultValue={profile.languages.join(', ')} onChange={(e) => handleListChange('languages', e.target.value)} placeholder="Languages spoken (e.g., English, Spanish)" className={inputClasses}/>
                                <select name="financialSituation" value={profile.financialSituation} onChange={handleChange} className={inputClasses} required>
                                    <option value="">Select your financial situation *</option>
                                    <option value="Significant Need">Significant Need</option>
                                    <option value="Moderate Need">Moderate Need</option>
                                    <option value="Some Need">Some Need</option>
                                    <option value="No Need">No Need</option>
                                </select>
                            </div>
                        </div>
                    );
                default: return null;
            }
        }

        return (
             <div className="w-full max-w-2xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    <div className="mb-6">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="min-h-[300px]">
                        {renderStepContent()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-8">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition">{t.back_button}</button>
                        ) : <div />}
                        
                        {step < 3 ? (
                            <button onClick={nextStep} disabled={!isStepValid} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold disabled:bg-slate-400 disabled:cursor-not-allowed">Next</button>
                        ) : (
                            <button onClick={handleSubmit} disabled={!isStepValid} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold disabled:bg-slate-400 disabled:cursor-not-allowed">Find Scholarships</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const renderParseResume = () => (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t.paste_resume_title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t.autofill_description}</p>
                
                <form id="form-file-upload" className="relative" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input ref={inputRef} type="file" id="input-file-upload" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
                    <label 
                        id="label-file-upload" 
                        htmlFor="input-file-upload" 
                        className={`block h-48 rounded-lg border-2 border-dashed ${dragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600'} flex justify-center items-center text-center cursor-pointer transition-colors`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <UploadIcon className="w-10 h-10 text-slate-400 mb-2" />
                            <p className="text-slate-600 dark:text-slate-300">
                                <span className="font-semibold text-orange-600">{t.upload_prompt_main}</span> {t.upload_prompt_secondary}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{t.upload_file_types}</p>
                            {fileName && <p className="text-sm text-green-500 mt-2">{fileName}</p>}
                        </div>
                    </label>
                    {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-sm">{t.upload_or}</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        if (resumeFile) setResumeFile(null);
                        if (fileName) setFileName('');
                    }}
                    placeholder={t.paste_resume_placeholder}
                    className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-200 rounded-lg border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-orange-500"
                    disabled={isParsing}
                />
                {parseError && <p className="text-red-500 mt-2 text-sm">{parseError}</p>}
                <div className="flex justify-between items-center mt-8">
                    <button onClick={() => setView('welcome')} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition" disabled={isParsing}>{t.back_button}</button>
                    <button onClick={handleParseResume} className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-bold flex items-center gap-2" disabled={isParsing || (!resumeText.trim() && !resumeFile)}>
                        {isParsing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>{t.parsing_resume}</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>{t.parse_button}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderVoiceOnboarding = () => (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 text-center">
                 <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t.voice_onboarding_title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">{t.voice_onboarding_subtitle}</p>
                
                <div className={`bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg ${language === 'ar' ? 'text-right' : 'text-left'} mb-6 text-sm text-slate-600 dark:text-slate-300`}>
                    <p className="font-semibold mb-2">{t.voice_onboarding_guidance_title}</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>{t.voice_onboarding_guidance_item1}</li>
                        <li>{t.voice_onboarding_guidance_item2}</li>
                        <li>{t.voice_onboarding_guidance_item3}</li>
                        <li>{t.voice_onboarding_guidance_item4}</li>
                        <li>{t.voice_onboarding_guidance_item5}</li>
                    </ul>
                </div>

                <canvas ref={visualizerRef} width="600" height="100" className="w-full h-24 rounded-lg mb-6 bg-slate-100 dark:bg-slate-900/50"></canvas>

                <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isParsing}
                    className={`w-24 h-24 rounded-full text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} disabled:bg-slate-400 disabled:cursor-not-allowed`}
                >
                    {isRecording ? <StopIcon className="w-10 h-10"/> : <MicIcon className="w-10 h-10"/>}
                </button>

                 {isParsing && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>{t.analyzing_profile}</span>
                    </div>
                )}

                {parseError && <p className="text-red-500 mt-4 text-sm">{parseError}</p>}
                
                <div className="flex justify-start items-center mt-8">
                     <button onClick={() => setView('welcome')} className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition" disabled={isParsing || isRecording}>{t.back_button}</button>
                </div>
            </div>
        </div>
    );

    const renderWelcome = () => (
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4">{t.welcome_title}</h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">{t.welcome_subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <button onClick={() => setView('parse_resume')} className={`group ${language === 'ar' ? 'text-right' : 'text-left'} bg-white/50 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:scale-105 transition-all duration-300`}>
                    <DocumentTextIcon className="w-10 h-10 text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.autofill_resume}</h2>
                    <p className="text-slate-600 dark:text-slate-300">{t.autofill_description}</p>
                </button>
                 <button onClick={() => setView('voice_onboarding')} className={`group ${language === 'ar' ? 'text-right' : 'text-left'} bg-white/50 dark:bg-slate-800/50 p-8 rounded-xl border border-orange-500 dark:border-orange-500 hover:scale-105 transition-all duration-300 ring-2 ring-orange-500`}>
                    <MicIcon className="w-10 h-10 text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.voice_onboarding_title}</h2>
                    <p className="text-slate-600 dark:text-slate-300">{t.voice_onboarding_description}</p>
                </button>
                 <button onClick={() => { setView('form'); setStep(1); }} className={`group ${language === 'ar' ? 'text-right' : 'text-left'} bg-white/50 dark:bg-slate-800/50 p-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-500 hover:scale-105 transition-all duration-300`}>
                    <EditIcon className="w-10 h-10 text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.fill_manually}</h2>
                    <p className="text-slate-600 dark:text-slate-300">{t.fill_manually_description}</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
             <div className="absolute top-6 right-6 flex items-center gap-2">
                <ThemeSwitcher isDashboard={false} />
                <LanguageSwitcher isDashboard={false} />
            </div>
             <header className="flex items-center gap-3 justify-center mb-8">
                <Logo className="w-16 h-16" />
                <h1 className="text-4xl font-bold tracking-tight">
                    <span className="text-slate-900 dark:text-white">Scholar</span>
                    <span className="text-orange-500">AI</span>
                </h1>
            </header>
            
            {view === 'welcome' && renderWelcome()}
            {view === 'parse_resume' && renderParseResume()}
            {view === 'form' && renderForm()}
            {view === 'voice_onboarding' && renderVoiceOnboarding()}
        </div>
    );
};

export default Onboarding;