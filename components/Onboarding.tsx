
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import { SparklesIcon, DocumentTextIcon, EditIcon, UploadIcon, MicIcon, StopIcon, CheckIcon, ArrowRightIcon } from './icons';
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
    const { language, theme } = useAppContext();
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
    const animationFrameRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

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
            const parsedProfile = await geminiService.parseAudioToProfile(audioData, language);

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
                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
                
                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;
                const centerY = canvas.height / 2;

                for (let i = 0; i < bufferLength; i++) {
                    const v = dataArray[i] / 255.0;
                    const barHeight = v * canvas.height * 1.5; // Amplify for better visibility
                    
                    // Dynamic orange-based color
                    const opacity = Math.min(1, v + 0.2);
                    canvasCtx.fillStyle = theme === 'light' 
                        ? `rgba(249, 115, 22, ${opacity})` // Orange-500
                        : `rgba(251, 146, 60, ${opacity})`; // Orange-400
                        
                    // Draw centered symmetric bars (waveform style)
                    canvasCtx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
                    
                    x += barWidth + 1;
                }
            }
        };
        draw();
    };

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
                        <div className="animate-fade-in">
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
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{t.education}</h2>
                            {profile.education.map((edu, index) => (
                                 <div key={index} className="space-y-3 p-4 mb-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-700/30">
                                    <input name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} placeholder="Institution *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)} placeholder="Field of Study *" className={inputClasses.replace('p-3', 'p-2')} required/>
                                    <input name="gpa" type="number" step="0.1" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} placeholder="GPA" className={inputClasses.replace('p-3', 'p-2')}/>
                                </div>
                            ))}
                             <button onClick={addEducation} className="text-sm text-orange-600 hover:text-orange-500 font-medium flex items-center gap-1">
                                <span>+ Add another institution</span>
                             </button>
                        </div>
                    );
                case 3:
                    return (
                        <div className="animate-fade-in">
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
             <div className="w-full max-w-2xl mx-auto z-10 relative">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                    <div className="mb-8">
                        <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                            <span>Basics</span>
                            <span>Education</span>
                            <span>Interests</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="min-h-[320px]">
                        {renderStepContent()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition font-medium">{t.back_button}</button>
                        ) : (
                            <button onClick={() => setView('welcome')} className="px-6 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition font-medium">{t.back_button}</button>
                        )}
                        
                        {step < 3 ? (
                            <button onClick={nextStep} disabled={!isStepValid} className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-bold shadow-lg hover:shadow-orange-500/30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2">
                                Next <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={!isStepValid} className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-bold shadow-lg hover:shadow-orange-500/30 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none">Find Scholarships</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const renderParseResume = () => (
        <div className="w-full max-w-2xl mx-auto z-10 relative">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.paste_resume_title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t.autofill_description}</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-500">
                        <DocumentTextIcon className="w-8 h-8" />
                    </div>
                </div>
                
                <form id="form-file-upload" className="relative mb-6" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input ref={inputRef} type="file" id="input-file-upload" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
                    <label 
                        id="label-file-upload" 
                        htmlFor="input-file-upload" 
                        className={`block h-48 rounded-xl border-2 border-dashed ${dragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500'} flex justify-center items-center text-center cursor-pointer transition-all duration-300`}
                    >
                        <div className="flex flex-col items-center justify-center p-4">
                            <UploadIcon className={`w-12 h-12 mb-3 ${dragActive ? 'text-orange-500' : 'text-slate-400'}`} />
                            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
                                {t.upload_prompt_main}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.upload_prompt_secondary}</p>
                            <p className="text-xs text-slate-400 mt-2 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{t.upload_file_types}</p>
                            {fileName && <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full"><CheckIcon className="w-4 h-4"/> {fileName}</div>}
                        </div>
                    </label>
                    {dragActive && <div className="absolute inset-0 w-full h-full rounded-xl" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </form>

                <div className="flex items-center mb-6">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">{t.upload_or}</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                </div>

                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        if (resumeFile) setResumeFile(null);
                        if (fileName) setFileName('');
                    }}
                    placeholder={t.paste_resume_placeholder}
                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all"
                    disabled={isParsing}
                />
                {parseError && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm flex items-center gap-2"><StopIcon className="w-4 h-4"/> {parseError}</div>}
                
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => setView('welcome')} className="px-6 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition font-medium" disabled={isParsing}>{t.back_button}</button>
                    <button onClick={handleParseResume} className="px-8 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-bold flex items-center gap-2 shadow-lg hover:shadow-orange-500/30 disabled:opacity-70 disabled:cursor-wait" disabled={isParsing || (!resumeText.trim() && !resumeFile)}>
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
        <div className="w-full max-w-2xl mx-auto z-10 relative">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MicIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">{t.voice_onboarding_title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">{t.voice_onboarding_subtitle}</p>
                
                <div className={`bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700 ${language === 'ar' ? 'text-right' : 'text-left'} mb-8 text-sm text-slate-600 dark:text-slate-300`}>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-orange-500"/> {t.voice_onboarding_guidance_title}
                    </p>
                    <ul className="space-y-2">
                        {[t.voice_onboarding_guidance_item1, t.voice_onboarding_guidance_item2, t.voice_onboarding_guidance_item3, t.voice_onboarding_guidance_item4, t.voice_onboarding_guidance_item5].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative mb-8">
                    <canvas ref={visualizerRef} width="600" height="120" className="w-full h-32 rounded-xl bg-slate-50 dark:bg-slate-900"></canvas>
                    {!isRecording && !isParsing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/40 rounded-xl pointer-events-none">
                            <p className="text-slate-600 dark:text-white/70 text-sm font-mono">Click microphone to start</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isParsing}
                    className={`w-20 h-20 rounded-full text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-xl hover:scale-110 active:scale-95 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'} disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:animate-none`}
                >
                    {isRecording ? <StopIcon className="w-8 h-8"/> : <MicIcon className="w-8 h-8"/>}
                </button>

                 {isParsing && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-slate-600 dark:text-slate-300 animate-pulse">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">{t.analyzing_profile}</span>
                    </div>
                )}

                {parseError && <p className="text-red-500 mt-6 text-sm font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg inline-block">{parseError}</p>}
                
                <div className="flex justify-center mt-8">
                     <button onClick={() => setView('welcome')} className="px-6 py-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition font-medium" disabled={isParsing || isRecording}>{t.back_button}</button>
                </div>
            </div>
        </div>
    );

    const OptionCard = ({ icon: Icon, title, description, onClick, recommended = false, delay = 0 }: any) => (
        <button 
            onClick={onClick}
            className={`group relative flex flex-col items-start text-left p-8 rounded-3xl transition-all duration-300 border hover:shadow-2xl hover:-translate-y-2 overflow-hidden
            ${recommended 
                ? 'bg-white dark:bg-slate-800 border-orange-500/50 dark:border-orange-500/50 ring-4 ring-orange-500/10' 
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
            }`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Decorative glow in background */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10`}></div>
            
            {recommended && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wider">
                    RECOMMENDED
                </div>
            )}
            
            <div className={`p-4 rounded-2xl mb-6 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3 ${recommended ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600'}`}>
                <Icon className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 transition-colors">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{description}</p>
            
            <div className="mt-auto flex items-center text-orange-500 font-bold text-sm transition-all transform group-hover:translate-x-1">
                <span className="mr-2">Select Option</span>
                <ArrowRightIcon className="w-4 h-4" />
            </div>
        </button>
    );

    const renderWelcome = () => {
        const features = [
            t.feature_smart_matching || "Smart AI Matching",
            t.feature_action_plans || "Weekly Action Plans",
            t.feature_global_access || "Global Scholarships"
        ];

        return (
            <div className="w-full max-w-6xl mx-auto z-10 relative">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-xs font-bold uppercase tracking-wider mb-6 border border-orange-200 dark:border-orange-800/30">
                        <SparklesIcon className="w-3 h-3" /> AI-Powered Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        {t.welcome_title.split('ScholarAI')[0]}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">ScholarAI</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">{t.welcome_subtitle}</p>
                    
                    <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                                    <CheckIcon className="w-3 h-3" />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4">
                    <OptionCard 
                        icon={MicIcon}
                        title={t.voice_onboarding_title}
                        description={t.voice_onboarding_description}
                        onClick={() => setView('voice_onboarding')}
                        recommended={true}
                        delay={100}
                    />
                    <OptionCard 
                        icon={DocumentTextIcon}
                        title={t.autofill_resume}
                        description={t.autofill_description}
                        onClick={() => setView('parse_resume')}
                        delay={200}
                    />
                    <OptionCard 
                        icon={EditIcon}
                        title={t.fill_manually}
                        description={t.fill_manually_description}
                        onClick={() => { setView('form'); setStep(1); }}
                        delay={300}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-900 selection:bg-orange-500 selection:text-white">
             {/* Background decorations */}
             <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-soft-light animate-blob" />
             <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-soft-light animate-blob animation-delay-2000" />
             <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-pink-400/20 rounded-full blur-3xl pointer-events-none mix-blend-multiply dark:mix-blend-soft-light animate-blob animation-delay-4000" />

             <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
                <ThemeSwitcher isDashboard={false} />
                <LanguageSwitcher isDashboard={false} />
            </div>
            
            <header className="flex items-center gap-3 justify-center mb-12 z-10">
                <Logo className="w-12 h-12" />
                <h1 className="text-2xl font-bold tracking-tight">
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
