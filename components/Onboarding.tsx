import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { SparklesIcon, DocumentTextIcon, EditIcon, UploadIcon } from './icons';
import * as geminiService from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';


interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const [view, setView] = useState<'welcome' | 'parse_resume' | 'form'>('welcome');
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
        if (file.type === 'text/plain' || file.type === 'application/pdf') {
            setFileName(file.name);
            setResumeFile(file);
            setResumeText('');
            setParseError('');
        } else {
            setParseError('Unsupported file type. Please upload a .txt or .pdf file.');
            setFileName('');
            setResumeFile(null);
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => 
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
        (newEducation[index] as any)[name] = name === 'gpa' ? parseFloat(value) : value;
        setProfile(prev => ({ ...prev, education: newEducation }));
    };

    const addEducation = () => {
        setProfile(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '', fieldOfStudy: '', gpa: 0 }] }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = () => {
        onComplete(profile);
    };
    
    const renderForm = () => {
        const renderStepContent = () => {
            switch (step) {
                case 1:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-1 text-white">{t.profile_title}</h2>
                            <p className="text-slate-400 mb-6">{t.full_name}</p>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                placeholder="e.g., Alex Doe"
                                className="w-full p-3 bg-gray-700 text-white rounded-lg border-transparent focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    );
                case 2:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-white">{t.education}</h2>
                            {profile.education.map((edu, index) => (
                                 <div key={index} className="space-y-3 p-4 mb-4 border border-gray-700 rounded-lg">
                                    <input name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} placeholder="Institution" className="w-full p-2 bg-gray-700 rounded"/>
                                    <input name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} placeholder="Degree" className="w-full p-2 bg-gray-700 rounded"/>
                                    <input name="fieldOfStudy" value={edu.fieldOfStudy} onChange={(e) => handleEducationChange(index, e)} placeholder="Field of Study" className="w-full p-2 bg-gray-700 rounded"/>
                                    <input name="gpa" type="number" step="0.1" value={edu.gpa} onChange={(e) => handleEducationChange(index, e)} placeholder="GPA" className="w-full p-2 bg-gray-700 rounded"/>
                                </div>
                            ))}
                             <button onClick={addEducation} className="text-sm text-orange-400 hover:text-orange-300">+ Add another institution</button>
                        </div>
                    );
                case 3:
                    return (
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-white">{t.skills} & Interests</h2>
                            <div className="space-y-4">
                                <textarea name="goals" value={profile.goals} onChange={handleChange} placeholder="What are your academic and career goals?" className="w-full p-2 bg-gray-700 rounded h-24"/>
                                <input type="text" defaultValue={profile.skills.join(', ')} onChange={(e) => handleListChange('skills', e.target.value)} placeholder="Skills (comma-separated, e.g., Python, Research)" className="w-full p-2 bg-gray-700 rounded"/>
                                <input type="text" defaultValue={profile.studyInterests.join(', ')} onChange={(e) => handleListChange('studyInterests', e.target.value)} placeholder="Fields of interest (e.g., AI, Marine Biology)" className="w-full p-2 bg-gray-700 rounded"/>
                                <input type="text" defaultValue={profile.languages.join(', ')} onChange={(e) => handleListChange('languages', e.target.value)} placeholder="Languages spoken (e.g., English, Spanish)" className="w-full p-2 bg-gray-700 rounded"/>
                                <select name="financialSituation" value={profile.financialSituation} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded">
                                    <option value="">Select your financial situation</option>
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
                <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                    <div className="mb-6">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="min-h-[300px]">
                        {renderStepContent()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-8">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition">{t.back_button}</button>
                        ) : <div />}
                        
                        {step < 3 ? (
                            <button onClick={nextStep} className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition font-bold">Next</button>
                        ) : (
                            <button onClick={handleSubmit} className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition font-bold">Find Scholarships</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const renderParseResume = () => (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                <h2 className="text-3xl font-bold mb-2 text-white">{t.paste_resume_title}</h2>
                <p className="text-slate-400 mb-6">{t.autofill_description}</p>
                
                <form id="form-file-upload" className="relative" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input ref={inputRef} type="file" id="input-file-upload" className="hidden" onChange={handleFileChange} accept=".txt,.pdf" />
                    <label 
                        id="label-file-upload" 
                        htmlFor="input-file-upload" 
                        className={`block h-48 rounded-lg border-2 border-dashed ${dragActive ? 'border-orange-500 bg-gray-700/50' : 'border-gray-600'} flex justify-center items-center text-center cursor-pointer transition-colors`}
                    >
                        <div className="flex flex-col items-center justify-center">
                            <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-slate-300">
                                <span className="font-semibold text-orange-400">{t.upload_prompt_main}</span> {t.upload_prompt_secondary}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{t.upload_file_types}</p>
                            {fileName && <p className="text-sm text-green-400 mt-2">{fileName}</p>}
                        </div>
                    </label>
                    {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                </form>

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">{t.upload_or}</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        if (resumeFile) setResumeFile(null);
                        if (fileName) setFileName('');
                    }}
                    placeholder={t.paste_resume_placeholder}
                    className="w-full h-48 p-3 bg-gray-700 text-white rounded-lg border-gray-600 focus:ring-2 focus:ring-orange-500"
                    disabled={isParsing}
                />
                {parseError && <p className="text-red-400 mt-2 text-sm">{parseError}</p>}
                <div className="flex justify-between items-center mt-8">
                    <button onClick={() => setView('welcome')} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition" disabled={isParsing}>{t.back_button}</button>
                    <button onClick={handleParseResume} className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition font-bold flex items-center gap-2" disabled={isParsing || (!resumeText.trim() && !resumeFile)}>
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
    
    const renderWelcome = () => (
        <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">{t.welcome_title}</h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">{t.welcome_subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button onClick={() => setView('parse_resume')} className="group text-left bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-orange-500 hover:scale-105 transition-all duration-300">
                    <DocumentTextIcon className="w-10 h-10 text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{t.autofill_resume}</h2>
                    <p className="text-slate-400">{t.autofill_description}</p>
                </button>
                 <button onClick={() => { setView('form'); setStep(1); }} className="group text-left bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-orange-500 hover:scale-105 transition-all duration-300">
                    <EditIcon className="w-10 h-10 text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{t.fill_manually}</h2>
                    <p className="text-slate-400">{t.fill_manually_description}</p>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
            <LanguageSwitcher />
             <div className="flex items-center gap-2 justify-center mb-8">
                <SparklesIcon className="w-10 h-10 text-orange-500" />
                <h1 className="text-4xl font-bold">ScholarAI</h1>
            </div>
            
            {view === 'welcome' && renderWelcome()}
            {view === 'parse_resume' && renderParseResume()}
            {view === 'form' && renderForm()}
        </div>
    );
};

export default Onboarding;