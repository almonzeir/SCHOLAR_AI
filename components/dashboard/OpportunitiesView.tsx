import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Scholarship } from '../../types';
import { CalendarIcon, ThumbsUpIcon, ThumbsDownIcon, CalendarPlusIcon, SparklesIcon, ShareIcon, ArrowRightIcon } from '../icons';
import { translations } from '../../translations';
import LoadingView from '../LoadingView';
import Confetti from '../Confetti';

// Visualizing the match score with a glowing ring
const MatchScoreRing = ({ score, size = 40 }: { score: string, size?: number }) => {
    const getPercentage = (s: string) => {
        switch(s) {
            case 'Perfect Match': return 98;
            case 'Excellent Match': return 85;
            case 'Good Match': return 70;
            case 'Possible Match': return 50;
            default: return 0;
        }
    };
    const percentage = getPercentage(score);
    const radius = (size - 4) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;
    
    const getColor = (p: number) => {
        if (p >= 90) return 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]';
        if (p >= 80) return 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
        if (p >= 60) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]';
        return 'text-slate-400';
    }

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full filter drop-shadow-md">
                <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" 
                        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                        className={`${getColor(percentage)} transition-all duration-1000 ease-out`} />
            </svg>
            <span className="absolute text-[10px] font-bold text-white shadow-black drop-shadow-md">{percentage}%</span>
        </div>
    );
}

interface ScholarshipCardProps {
    scholarship: Scholarship;
    isPdfView?: boolean;
    language: 'ar' | 'en';
    theme: 'light' | 'dark';
    updateScholarshipFeedback: (scholarshipId: string, feedback: 'good' | 'bad') => void;
    onShare?: (scholarship: Scholarship) => void;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = React.memo(({ scholarship, isPdfView = false, language, theme, updateScholarshipFeedback, onShare }) => {
    const t = translations[language];
    
    const effortColors = {
        Low: 'bg-green-500/20 text-green-300 border border-green-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
        High: 'bg-red-500/20 text-red-300 border border-red-500/30',
    };

    const feedbackColor = (feedback: 'good' | 'bad' | undefined, type: 'good' | 'bad') => {
        if (!feedback) return 'text-slate-500 hover:text-white transition-colors';
        if (feedback === 'good' && type === 'good') return 'text-green-500 scale-110 drop-shadow-[0_0_5px_green]';
        if (feedback === 'bad' && type === 'bad') return 'text-red-500 scale-110 drop-shadow-[0_0_5px_red]';
        return 'text-slate-600';
    };

    const handleAddToCalendar = (task: string, deadline: string) => {
        if (!deadline || deadline === 'N/A') return;
        const title = encodeURIComponent(task);
        const description = encodeURIComponent(`Deadline for ${scholarship.name}. View details here: ${scholarship.url}`);
        const date = deadline.replace(/-/g, '');
        const nextDay = new Date(new Date(deadline).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0,10).replace(/-/g,'');
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${nextDay}&details=${description}`;
        window.open(url, '_blank');
    };

    // Use simplified layout for PDF view
    if (isPdfView) {
        return (
            <div className="bg-white p-6 border border-slate-200 rounded-lg">
                <h3 className="text-xl font-bold text-black">{scholarship.name}</h3>
                <p className="text-slate-500">{scholarship.organization}</p>
                <div className="my-2 text-orange-600 font-bold">{scholarship.matchScore}</div>
                <p className="text-slate-700 text-sm">{scholarship.description}</p>
                <div className="mt-4 text-sm text-slate-500">Deadline: {scholarship.deadline}</div>
            </div>
        );
    }

    return (
        <div className={`glass-card p-6 flex flex-col justify-between h-full group relative ${scholarship.feedback === 'bad' ? 'opacity-50 grayscale' : ''}`}>
             {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

            <div>
                <div className="flex justify-between items-start mb-6 gap-3 relative z-10">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-orange-400 transition-colors">{scholarship.name}</h3>
                        <p className="text-sm text-slate-400 mt-1">{scholarship.organization}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <MatchScoreRing score={scholarship.matchScore} size={48} />
                    </div>
                </div>
                
                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${effortColors[scholarship.effortScore]}`}>{t[(`effort_${scholarship.effortScore.toLowerCase()}` as keyof typeof t)]}</span>
                </div>

                <p className="text-slate-300 text-sm mb-6 leading-relaxed relative z-10">{scholarship.description}</p>

                <div className="bg-white/5 p-4 rounded-xl mb-6 text-sm border border-white/5 relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-orange-400 font-bold text-xs uppercase tracking-wide">
                        <SparklesIcon className="w-3 h-3" /> {t.why_it_fits}
                    </div>
                    <p className="text-slate-400 italic">"{scholarship.matchReason}"</p>
                </div>
            </div>

            <div className="mt-auto pt-4 space-y-4 relative z-10">
                <div className="flex items-center justify-between text-sm text-slate-500">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-300">{scholarship.deadline}</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <button onClick={() => handleAddToCalendar(`Apply for ${scholarship.name}`, scholarship.deadline)} className="text-slate-500 hover:text-orange-400 transition-colors tooltip" title={t.add_to_calendar}>
                            <CalendarPlusIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => updateScholarshipFeedback(scholarship.id, 'good')} className={feedbackColor(scholarship.feedback, 'good')} title={t.save_to_plan}>
                            <ThumbsUpIcon className="w-5 h-5"/>
                        </button>
                        <button onClick={() => updateScholarshipFeedback(scholarship.id, 'bad')} className={feedbackColor(scholarship.feedback, 'bad')} title={t.not_a_fit}>
                            <ThumbsDownIcon className="w-5 h-5"/>
                        </button>
                        {onShare && (
                            <button onClick={() => onShare(scholarship)} className="text-slate-500 hover:text-blue-400 transition-colors tooltip" title="Share Match">
                                <ShareIcon className="w-5 h-5"/>
                            </button>
                        )}
                    </div>
                </div>

                <a
                    href={scholarship.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-orange-500/25 gap-2 group/btn"
                >
                    {t.apply_now} <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </a>
            </div>
        </div>
    );
});

const OpportunitiesView: React.FC = () => {
    const { scholarships, loading, language, userProfile, theme, updateScholarshipFeedback } = useAppContext();
    const [showConfetti, setShowConfetti] = useState(false);
    const t = translations[language];

    const handleShare = (scholarship: Scholarship) => {
        if (scholarship.matchScore === 'Perfect Match' || scholarship.matchScore === 'Excellent Match') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

        const input = document.createElement('div');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.width = '1080px';
        input.style.height = '1920px';
        document.body.appendChild(input);

        // STUNNING INSTAGRAM STORY DESIGN
        const ShareContent = () => (
            <div className="w-full h-full relative overflow-hidden bg-[#050505] text-white flex flex-col items-center justify-center p-16" style={{ fontFamily: "'Inter', sans-serif" }}>
                 {/* Background Elements */}
                 <div className="absolute top-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-purple-600/30 rounded-full blur-[200px]" />
                 <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-orange-600/30 rounded-full blur-[200px]" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>

                 {/* Border Gradient */}
                 <div className="absolute inset-8 rounded-[3rem] border border-white/20 z-20"></div>

                 <div className="relative z-30 flex flex-col items-center text-center transform scale-125">
                    {/* Match Badge */}
                    <div className="mb-16 relative">
                        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full"></div>
                        <div className="bg-black/50 backdrop-blur-2xl border border-white/20 p-8 rounded-full shadow-2xl relative">
                             <MatchScoreRing score={scholarship.matchScore} size={200} />
                        </div>
                    </div>

                    <div className="text-orange-400 font-bold text-3xl uppercase tracking-[0.3em] mb-8 animate-pulse">It's a Match!</div>

                    <h1 className="text-7xl font-black mb-10 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-400 drop-shadow-2xl max-w-4xl">
                        {scholarship.name}
                    </h1>

                    <p className="text-4xl text-slate-400 mb-16 font-light max-w-3xl">
                        {scholarship.organization}
                    </p>

                    <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[2rem] border border-white/10 max-w-3xl mb-16 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
                        <p className="text-3xl text-slate-200 italic leading-relaxed font-serif">"{scholarship.matchReason}"</p>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="absolute bottom-24 left-0 right-0 text-center z-30">
                    <div className="inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full font-bold text-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">ScholarAI</span>
                        <span className="w-2 h-2 bg-black rounded-full opacity-30"></span>
                        <span className="text-slate-800">Found this for me</span>
                    </div>
                 </div>
            </div>
        );

        const root = createRoot(input);
        flushSync(() => {
            root.render(<ShareContent />);
        });

        (window as any).html2canvas(input, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#050505',
        }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `scholarai-story-${scholarship.id}.png`;
            link.href = imgData;
            link.click();
        }).finally(() => {
            root.unmount();
            document.body.removeChild(input);
        });
    };

    const handleExportPdf = () => {
         // (PDF Export logic simplified for brevity, assuming similar implementation)
         // For now, I'll keep the logic but ensure it uses the new card structure if needed,
         // but since PDF uses a simplified view, the existing logic is fine.
         const input = document.createElement('div');
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.width = '1200px';
        document.body.appendChild(input);

        const PdfContent = () => (
            <div className={`p-12 bg-white text-black`} style={{ fontFamily: "'Inter', sans-serif"}}>
                 <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>Scholarship Opportunities for {userProfile?.name}</h1>
                 <div className="grid grid-cols-2 gap-8">
                    {scholarships.filter(s => s.feedback !== 'bad').map(s => 
                        <ScholarshipCard 
                            key={s.id} 
                            scholarship={s} 
                            isPdfView={true}
                            language={language}
                            theme={theme}
                            updateScholarshipFeedback={() => {}}
                        />)
                    }
                </div>
            </div>
        );

        const root = createRoot(input);
        flushSync(() => { root.render(<PdfContent />); });

        (window as any).html2canvas(input, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas: any) => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / pdfWidth;
            const imgHeight = canvasHeight / ratio;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = position - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`${userProfile?.name}-opportunities.pdf`);
        }).finally(() => { root.unmount(); document.body.removeChild(input); });
    };

    if (loading) {
        return <LoadingView title={t.loading_title} subtitle={t.loading_subtitle} />;
    }

    const goodMatches = [...scholarships].filter(s => s.feedback !== 'bad');

    return (
        <div className="space-y-8 pb-20">
            <Confetti isActive={showConfetti} />
            <div>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-white text-glow">{t.opportunities_title}</h2>
                        <p className="text-slate-400">{t.opportunities_subtitle}</p>
                    </div>
                    <button 
                        onClick={handleExportPdf} 
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition shadow-lg backdrop-blur-md flex items-center gap-2"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {t.export_pdf}
                    </button>
                </div>

                {goodMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goodMatches.map(s => (
                            <ScholarshipCard
                                key={s.id}
                                scholarship={s}
                                language={language}
                                theme={theme}
                                updateScholarshipFeedback={updateScholarshipFeedback}
                                onShare={handleShare}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                             <SparklesIcon className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t.no_scholarships_title}</h3>
                        <p className="text-slate-400 max-w-md mx-auto">{t.no_scholarships_subtitle}</p>
                    </div>
                )}
            </div>
            
            {userProfile?.profileFeedback && (
                 <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-8 rounded-3xl border border-blue-500/20 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                             <SparklesIcon className="w-6 h-6 text-blue-400 animate-pulse"/>
                        </div>
                        <h3 className="text-2xl font-bold text-white">{t.feedback_title}</h3>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed relative z-10">{userProfile.profileFeedback}</p>
                </div>
            )}
        </div>
    );
};

export default OpportunitiesView;
