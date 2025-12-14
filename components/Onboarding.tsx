import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Upload, Mic, X, ChevronRight, Wand2 } from 'lucide-react';
import { Logo } from './Logo';
import { useAppContext } from '../contexts/AppContext';

interface OnboardingProps {
    onComplete: (profile: any) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
    const { language } = useAppContext();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        educationLevel: 'High School',
        major: '',
        gpa: '',
        interests: [] as string[]
    });

    // Mock progress calculation
    const progress = (step / 3) * 100;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else onComplete(formData);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-deep-space text-white relative overflow-hidden flex flex-col">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[100px] animate-blob" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PHZlRmVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-6 flex justify-between items-center max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8 text-orange-500" />
                    <span className="font-bold text-xl tracking-tight">ScholarAI</span>
                </div>
                <div className="text-sm font-medium text-slate-400">Step {step} of 3</div>
            </header>

            {/* Progress Bar (XP Bar Style) */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 mb-12">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] relative"
                    >
                         <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[2px] animate-pulse"></div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Card */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        variants={fadeInUp}
                        className="w-full max-w-2xl"
                    >
                        <div className="glass-card p-8 md:p-12 relative overflow-hidden group">
                            {/* Decorative Glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent blur-[60px] -z-10 group-hover:bg-orange-500/20 transition-colors duration-500"></div>

                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white text-glow">Let's build your profile</h1>
                                        <p className="text-slate-400 text-lg">We'll use this to find the perfect scholarships for you.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-slate-300 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all shadow-inner"
                                                placeholder="e.g. Alex Johnson"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white text-glow">Academic Background</h1>
                                        <p className="text-slate-400 text-lg">Where are you in your educational journey?</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['High School', 'Undergraduate', 'Graduate', 'PhD'].map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setFormData({...formData, educationLevel: level})}
                                                className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${
                                                    formData.educationLevel === level
                                                    ? 'bg-orange-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                                                    : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5 hover:border-white/30'
                                                }`}
                                            >
                                                <span className="font-bold text-lg">{level}</span>
                                                {formData.educationLevel === level && (
                                                    <motion.div layoutId="check" className="absolute top-4 right-4 text-orange-500">
                                                        <Sparkles className="w-5 h-5 fill-orange-500" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                             {step === 3 && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white text-glow">Magic Upload</h1>
                                        <p className="text-slate-400 text-lg">Upload your resume or transcript. Our AI will extract everything else.</p>
                                    </div>

                                    <div className="border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center gap-6 hover:border-orange-500/50 hover:bg-orange-500/5 transition-all cursor-pointer group relative overflow-hidden">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/10">
                                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-orange-400 transition-colors" />
                                        </div>
                                        <div className="text-center space-y-2 relative z-10">
                                            <p className="font-bold text-xl text-white">Click to Upload</p>
                                            <p className="text-sm text-slate-500">PDF, DOCX, or Images (Max 10MB)</p>
                                        </div>

                                        {/* Scanning Animation Effect */}
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[scan_2s_ease-in-out_infinite]"></div>
                                    </div>

                                    <div className="flex items-center gap-4 my-4">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Or</span>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                    </div>

                                    <button className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-200 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all flex items-center justify-center gap-3 group">
                                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span className="font-bold">Use AI Voice Assistant</span>
                                    </button>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                                <button
                                    onClick={handleBack}
                                    className={`text-slate-400 hover:text-white font-medium px-4 py-2 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                                >
                                    Back
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-orange-50 hover:text-orange-600 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] flex items-center gap-2 group transform hover:scale-105"
                                >
                                    <span>{step === 3 ? 'Complete Profile' : 'Continue'}</span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Onboarding;
