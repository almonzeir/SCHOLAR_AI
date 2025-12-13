
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../types';
import { SparklesIcon, DocumentTextIcon, EditIcon, UploadIcon, MicIcon, StopIcon, CheckIcon, ArrowRightIcon, ShareIcon } from './icons';
import * as geminiService from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { ThemeSwitcher } from './ThemeSwitcher';
import Confetti from './Confetti';

interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [view, setView] = useState<'welcome' | 'parse_resume' | 'form' | 'voice_onboarding' | 'viral_share'>('welcome');
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

    // Celebration State
    const [showCelebration, setShowCelebration] = useState(false);

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
            setShowCelebration(true); // Celebrate successful parsing
            setTimeout(() => setShowCelebration(false), 3000);
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
            setShowCelebration(true); // Celebrate successful voice parsing
            setTimeout(() => setShowCelebration(false), 3000);
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
                
                // Holographic Arc Visualizer
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                // Calculate average volume
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                // Base radius pulsates with volume
                const baseRadius = 50 + (average * 0.8);

                // Draw Glow
                const gradient = canvasCtx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, baseRadius * 2);
                gradient.addColorStop(0, 'rgba(249, 115, 22, 0.9)'); // Orange center
                gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)');
                gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

                canvasCtx.fillStyle = gradient;
                canvasCtx.beginPath();
                canvasCtx.arc(centerX, centerY, baseRadius * 2, 0, 2 * Math.PI);
                canvasCtx.fill();

                // Draw Core Ring
                canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                canvasCtx.lineWidth = 4;
                canvasCtx.shadowBlur = 15;
                canvasCtx.shadowColor = '#f97316';
                canvasCtx.beginPath();
                canvasCtx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
                canvasCtx.stroke();
                canvasCtx.shadowBlur = 0; // Reset shadow

                // Draw orbiting particles/frequency bars
                const radius = baseRadius + 15;
                const bars = 40;
                const step = (Math.PI * 2) / bars;

                for (let i = 0; i < bars; i++) {
                    const dataIndex = Math.floor((i / bars) * (bufferLength / 2));
                    const value = dataArray[dataIndex] / 255.0;
                    const barLen = value * 60;

                    const angle = i * step + (Date.now() / 1000); // Rotate slowly
                    const x1 = centerX + Math.cos(angle) * radius;
                    const y1 = centerY + Math.sin(angle) * radius;
                    const x2 = centerX + Math.cos(angle) * (radius + barLen);
                    const y2 = centerY + Math.sin(angle) * (radius + barLen);

                    canvasCtx.strokeStyle = `rgba(249, 115, 22, ${0.4 + value})`;
                    canvasCtx.lineWidth = 3;
                    canvasCtx.beginPath();
                    canvasCtx.moveTo(x1, y1);
                    canvasCtx.lineTo(x2, y2);
                    canvasCtx.stroke();
                    
                    // Add particles at tips
                    if (value > 0.5) {
                        canvasCtx.fillStyle = '#fff';
                        canvasCtx.beginPath();
                        canvasCtx.arc(x2, y2, 2, 0, 2 * Math.PI);
                        canvasCtx.fill();
                    }
                }
            }
        };
        draw();
    };

    useEffect(() => {
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
        setShowCelebration(true);
        // Instead of completing immediately, go to Viral Share view
        setTimeout(() => {
            setView('viral_share');
            setShowCelebration(false);
        }, 1500);
    };

    const handleShareProfile = async () => {
        const input = document.getElementById('viral-card');
        if (!input) return;

        try {
            const canvas = await (window as any).html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#0a0a0a',
            });
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `scholarai-agent-${profile.name}.png`;
            link.href = imgData;
            link.click();

            // Proceed after sharing
            setTimeout(() => onComplete(profile), 1000);
        } catch (e) {
            console.error(e);
            onComplete(profile);
        }
    };
    
    const renderForm = () => {
        const inputClasses = "w-full p-4 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all backdrop-blur-md placeholder-slate-500";

        const renderStepContent = () => {
            switch (step) {
                case 1:
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                    <span className="text-xl font-bold">01</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Identity Check</h2>
                                    <p className="text-slate-400">Let's start with the basics.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">{t.full_name}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Alex Doe"
                                    className={inputClasses}
                                    required
                                    autoFocus
                                />
                            </div>
                        </motion.div>
                    );
                case 2:
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                             <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                    <span className="text-xl font-bold">02</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Academic Database</h2>
                                    <p className="text-slate-400">Log your educational history.</p>
                                </div>
                            </div>

                            {profile.education.map((edu, index) => (
                                 <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="space-y-4 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} placeholder="Institution *" className={inputClasses} required/>
                                        <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree *" className={inputClasses} required/>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)} placeholder="Field of Study *" className={inputClasses} required/>
                                        <input name="gpa" type="number" step="0.1" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} placeholder="GPA" className={inputClasses}/>
                                    </div>
                                </motion.div>
                            ))}
                             <button onClick={addEducation} className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20">
                                <span className="text-lg">+</span> <span>Add another institution</span>
                             </button>
                        </motion.div>
                    );
                case 3:
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                    <span className="text-xl font-bold">03</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Future Projection</h2>
                                    <p className="text-slate-400">Define your trajectory and constraints.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Academic & Career Goals</label>
                                    <textarea name="goals" value={profile.goals} onChange={handleChange} placeholder="What do you want to achieve? *" className={`${inputClasses} h-32 resize-none`} required/>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Skills</label>
                                    <input type="text" defaultValue={profile.skills.join(', ')} onChange={(e) => handleListChange('skills', e.target.value)} placeholder="Comma-separated (e.g., Python, Research) *" className={inputClasses} required/>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Interests</label>
                                    <input type="text" defaultValue={profile.studyInterests.join(', ')} onChange={(e) => handleListChange('studyInterests', e.target.value)} placeholder="Comma-separated (e.g., AI, Marine Biology) *" className={inputClasses} required/>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Languages</label>
                                        <input type="text" defaultValue={profile.languages.join(', ')} onChange={(e) => handleListChange('languages', e.target.value)} placeholder="English, Spanish..." className={inputClasses}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Financial Need</label>
                                        <select name="financialSituation" value={profile.financialSituation} onChange={handleChange} className={`${inputClasses} bg-[#1a1a1a]`} required>
                                            <option value="">Select Situation *</option>
                                            <option value="Significant Need">Significant Need</option>
                                            <option value="Moderate Need">Moderate Need</option>
                                            <option value="Some Need">Some Need</option>
                                            <option value="No Need">No Need</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                default: return null;
            }
        }

        return (
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl mx-auto z-10 relative"
            >
                <div className="glass-holographic rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl bg-black/40">
                    {/* XP Bar Progress */}
                    <div className="mb-12 relative">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">
                            <span>Identity</span>
                            <span>Academics</span>
                            <span>Future</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden relative">
                             {/* Glowing Bar */}
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {renderStepContent()}
                        </AnimatePresence>
                    </div>
                    
                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-3 text-slate-400 hover:text-white transition font-medium flex items-center gap-2">
                                <ArrowRightIcon className="w-4 h-4 rotate-180" /> {t.back_button}
                            </button>
                        ) : (
                            <button onClick={() => setView('welcome')} className="px-6 py-3 text-slate-400 hover:text-white transition font-medium">
                                Cancel
                            </button>
                        )}
                        
                        {step < 3 ? (
                            <button onClick={nextStep} disabled={!isStepValid} className="px-8 py-4 bg-orange-600 text-white rounded-full hover:bg-orange-500 transition-all font-bold shadow-lg shadow-orange-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95 border border-orange-400/20">
                                Next Level <ArrowRightIcon className="w-5 h-5" />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={!isStepValid} className="px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-full hover:from-orange-500 hover:to-amber-500 transition-all font-bold shadow-xl shadow-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2 border border-white/20">
                                <SparklesIcon className="w-5 h-5 animate-pulse" /> Launch System
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    const renderViralShare = () => {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg mx-auto z-10 relative text-center"
            >
                <h2 className="text-3xl font-bold text-white mb-8 text-glow">Access Granted</h2>

                {/* The "Agent Card" to share */}
                <div id="viral-card" className="bg-[#0f172a] p-8 rounded-3xl border border-orange-500/30 shadow-[0_0_50px_rgba(249,115,22,0.15)] relative overflow-hidden mb-8 transform transition-transform hover:scale-105 duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8">
                        <Logo className="w-8 h-8 text-orange-500" />
                        <div className="px-3 py-1 rounded-full border border-orange-500/30 text-[10px] font-mono text-orange-400 uppercase tracking-widest bg-orange-900/10">
                            Authorized
                        </div>
                    </div>

                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-white/10 mb-6 shadow-inner">
                        <span className="text-4xl font-black text-white">{profile.name.charAt(0)}</span>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{profile.name}</h3>
                    <p className="text-slate-400 text-sm mb-6 uppercase tracking-wider font-medium">Future Scholar</p>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-slate-500 uppercase">Target</div>
                            <div className="text-sm font-bold text-white truncate">{profile.education[0]?.degree || "N/A"}</div>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-slate-500 uppercase">Focus</div>
                            <div className="text-sm font-bold text-white truncate">{profile.skills[0] || "General"}</div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                         <div className="text-xs text-slate-500 font-mono">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </div>
                </div>

                <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                    Your profile has been initialized. Save your Access Card or proceed to the dashboard.
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleShareProfile}
                        className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-slate-200 transition flex items-center justify-center gap-2 shadow-lg"
                    >
                        <ShareIcon className="w-5 h-5" /> Save Agent Card
                    </button>
                    <button
                        onClick={() => onComplete(profile)}
                        className="w-full py-4 bg-transparent border border-white/10 text-slate-400 rounded-xl font-bold text-lg hover:text-white hover:bg-white/5 transition"
                    >
                        Enter Dashboard
                    </button>
                </div>
            </motion.div>
        );
    };

    const renderParseResume = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl mx-auto z-10 relative"
        >
            <div className="glass-holographic rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl bg-black/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">{t.paste_resume_title}</h2>
                        <p className="text-slate-400">{t.autofill_description}</p>
                    </div>
                    <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500 border border-orange-500/20">
                        <DocumentTextIcon className="w-8 h-8" />
                    </div>
                </div>
                
                <form id="form-file-upload" className="relative mb-8" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input ref={inputRef} type="file" id="input-file-upload" className="hidden" onChange={handleFileChange} accept=".txt,.pdf,.docx" />
                    <label 
                        id="label-file-upload" 
                        htmlFor="input-file-upload" 
                        className={`block h-56 rounded-2xl border-2 border-dashed ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-orange-500/50 hover:bg-white/5'} flex justify-center items-center text-center cursor-pointer transition-all duration-300 group`}
                    >
                        <div className="flex flex-col items-center justify-center p-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all border border-white/10">
                                <UploadIcon className={`w-8 h-8 ${dragActive ? 'text-orange-500' : 'text-slate-400 group-hover:text-orange-500'}`} />
                            </div>
                            <p className="text-lg font-bold text-white">
                                {t.upload_prompt_main}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">{t.upload_prompt_secondary}</p>

                            {fileName && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 flex items-center gap-2 text-sm text-green-400 font-bold bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                                >
                                    <CheckIcon className="w-4 h-4"/> {fileName}
                                </motion.div>
                            )}
                        </div>
                    </label>
                    {dragActive && <div className="absolute inset-0 w-full h-full rounded-2xl" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </form>

                <div className="flex items-center mb-8">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm font-medium uppercase tracking-wider">{t.upload_or}</span>
                    <div className="flex-grow border-t border-white/10"></div>
                </div>

                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        if (resumeFile) setResumeFile(null);
                        if (fileName) setFileName('');
                    }}
                    placeholder={t.paste_resume_placeholder}
                    className="w-full h-40 p-6 bg-white/5 text-white rounded-2xl border border-white/10 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all font-mono text-sm placeholder-slate-500"
                    disabled={isParsing}
                />
                
                {parseError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-4 bg-red-500/10 text-red-400 rounded-xl text-sm flex items-center gap-3 border border-red-500/20"
                    >
                        <StopIcon className="w-5 h-5"/> {parseError}
                    </motion.div>
                )}

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                    <button onClick={() => setView('welcome')} className="px-6 py-3 text-slate-400 hover:text-white transition font-medium" disabled={isParsing}>{t.back_button}</button>
                    <button
                        onClick={handleParseResume}
                        className="px-8 py-4 bg-orange-600 text-white rounded-full hover:bg-orange-500 transition-all font-bold flex items-center gap-3 shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-wait"
                        disabled={isParsing || (!resumeText.trim() && !resumeFile)}
                    >
                        {isParsing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Processing...</span>
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
        </motion.div>
    );
    
    const renderVoiceOnboarding = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto z-10 relative"
        >
            <div className="glass-holographic rounded-3xl p-8 md:p-12 border border-white/10 backdrop-blur-xl bg-black/40 text-center">
                <div className="w-20 h-20 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-orange-500/5 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    <MicIcon className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-bold mb-4 text-white text-glow">{t.voice_onboarding_title}</h2>
                <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">{t.voice_onboarding_subtitle}</p>
                
                <div className="relative mb-12 flex justify-center items-center h-48">
                    <canvas ref={visualizerRef} width="300" height="300" className="w-[300px] h-[300px] rounded-full bg-black/50 border border-white/5"></canvas>
                    {!isRecording && !isParsing && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-orange-400 font-mono text-xs tracking-[0.3em] uppercase bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-orange-500/30 animate-pulse">Tap to Activate</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={isRecording ? stopRecording : startRecording} 
                    disabled={isParsing}
                    className={`w-24 h-24 rounded-full text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-2xl hover:scale-105 active:scale-95 ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/50 animate-pulse' : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 shadow-orange-500/40'} disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none disabled:animate-none border border-white/20`}
                >
                    {isRecording ? <StopIcon className="w-10 h-10"/> : <MicIcon className="w-10 h-10"/>}
                </button>

                 {isParsing && (
                    <div className="mt-8 flex items-center justify-center gap-3 text-slate-300">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium animate-pulse">{t.analyzing_profile}</span>
                    </div>
                )}

                {parseError && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 mt-8 text-sm font-bold bg-red-500/10 px-6 py-3 rounded-full inline-block border border-red-500/20"
                    >
                        {parseError}
                    </motion.p>
                )}
                
                <div className="flex justify-center mt-12">
                     <button onClick={() => setView('welcome')} className="px-8 py-3 text-slate-400 hover:text-white transition font-medium rounded-full hover:bg-white/5" disabled={isParsing || isRecording}>{t.back_button}</button>
                </div>
            </div>
        </motion.div>
    );

    const OptionCard = ({ icon: Icon, title, description, onClick, recommended = false, delay = 0, isHero = false }: any) => (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay / 1000 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={onClick}
            className={`group relative flex flex-col items-start text-left p-8 rounded-[2rem] transition-all duration-300 border overflow-hidden w-full
            ${recommended 
                ? 'bg-gradient-to-b from-orange-500/20 to-black/40 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-orange-500/30'
            } backdrop-blur-xl ${isHero ? 'col-span-1 md:col-span-2' : ''}`}
        >
            {recommended && (
                <div className="absolute top-6 right-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg tracking-wider animate-pulse">
                    RECOMMENDED
                </div>
            )}
            
            <div className={`p-5 rounded-2xl mb-8 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-6 ${recommended ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white/10 text-white group-hover:bg-orange-500/20 group-hover:text-orange-500'}`}>
                <Icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-500 transition-colors">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">{description}</p>
            
            <div className={`mt-auto flex items-center font-bold text-sm transition-all transform group-hover:translate-x-2 ${recommended ? 'text-orange-400' : 'text-slate-500 group-hover:text-orange-400'}`}>
                <span className="mr-2">Initiate Sequence</span>
                <ArrowRightIcon className="w-4 h-4" />
            </div>
        </motion.button>
    );

    const renderWelcome = () => {
        return (
            <div className="w-full max-w-7xl mx-auto z-10 relative">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-wider mb-8 border border-orange-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    >
                        <SparklesIcon className="w-3 h-3" /> System Ready
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter"
                    >
                        Initialize <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-glow">Protocol</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Select your preferred method of data entry. Our AI systems are standing by to process your profile.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {/* Voice Onboarding - The "Hero" Card */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                        <OptionCard
                            icon={MicIcon}
                            title={t.voice_onboarding_title}
                            description={t.voice_onboarding_description}
                            onClick={() => setView('voice_onboarding')}
                            recommended={true}
                            delay={100}
                            isHero={true}
                        />
                    </div>
                    <div className="col-span-1 lg:col-span-1">
                        <OptionCard
                            icon={DocumentTextIcon}
                            title={t.autofill_resume}
                            description={t.autofill_description}
                            onClick={() => setView('parse_resume')}
                            delay={200}
                        />
                    </div>
                    <div className="col-span-1 lg:col-span-1">
                        <OptionCard
                            icon={EditIcon}
                            title={t.fill_manually}
                            description={t.fill_manually_description}
                            onClick={() => { setView('form'); setStep(1); }}
                            delay={300}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0a0a0a] selection:bg-orange-500 selection:text-white">
             {/* Confetti Celebration */}
             <Confetti isActive={showCelebration} />

             {/* Dynamic Background */}
             <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] animate-blob" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                 <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
             </div>

             <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
                <ThemeSwitcher isDashboard={false} />
                <LanguageSwitcher isDashboard={false} />
            </div>
            
            <header className="flex items-center gap-3 justify-center mb-12 z-10 cursor-pointer" onClick={() => setView('welcome')}>
                <Logo className="w-10 h-10 text-orange-500" />
                <h1 className="text-xl font-bold tracking-tight text-white">
                    Scholar<span className="text-orange-500">AI</span>
                </h1>
            </header>
            
            {view === 'welcome' && renderWelcome()}
            {view === 'parse_resume' && renderParseResume()}
            {view === 'form' && renderForm()}
            {view === 'voice_onboarding' && renderVoiceOnboarding()}
            {view === 'viral_share' && renderViralShare()}
        </div>
    );
};

export default Onboarding;
