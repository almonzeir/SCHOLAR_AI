import React, { useState } from 'react';
import { UserProfile } from '../types';
import { SparklesIcon } from './icons';

interface OnboardingProps {
    onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
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
    
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-white">Welcome to ScholarAI</h2>
                        <p className="text-slate-400 mb-6">Let's get to know you better. What's your name?</p>
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
                        <h2 className="text-2xl font-bold mb-6 text-white">Education Background</h2>
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
                        <h2 className="text-2xl font-bold mb-6 text-white">Skills & Interests</h2>
                        <div className="space-y-4">
                            <textarea name="goals" value={profile.goals} onChange={handleChange} placeholder="What are your academic and career goals?" className="w-full p-2 bg-gray-700 rounded h-24"/>
                            <input type="text" onChange={(e) => handleListChange('skills', e.target.value)} placeholder="Skills (comma-separated, e.g., Python, Research)" className="w-full p-2 bg-gray-700 rounded"/>
                            <input type="text" onChange={(e) => handleListChange('studyInterests', e.target.value)} placeholder="Fields of interest (e.g., AI, Marine Biology)" className="w-full p-2 bg-gray-700 rounded"/>
                            <input type="text" onChange={(e) => handleListChange('languages', e.target.value)} placeholder="Languages spoken (e.g., English, Spanish)" className="w-full p-2 bg-gray-700 rounded"/>
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
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                 <div className="flex items-center gap-2 justify-center mb-8">
                    <SparklesIcon className="w-10 h-10 text-orange-500" />
                    <h1 className="text-4xl font-bold">ScholarAI</h1>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
                    <div className="mb-6">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="min-h-[300px]">
                        {renderStep()}
                    </div>
                    
                    <div className="flex justify-between items-center mt-8">
                        {step > 1 ? (
                            <button onClick={prevStep} className="px-6 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition">Back</button>
                        ) : <div />}
                        
                        {step < 3 ? (
                            <button onClick={nextStep} className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition font-bold">Next</button>
                        ) : (
                            <button onClick={handleSubmit} className="px-6 py-2 bg-orange-600 rounded-lg hover:bg-orange-700 transition font-bold">Find Scholarships</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
