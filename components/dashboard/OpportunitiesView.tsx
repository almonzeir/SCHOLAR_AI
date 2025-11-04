import React, { useRef } from 'react';
// FIX: Updated imports for React 18 compatibility.
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Scholarship } from '../../types';
import { CalendarIcon, ThumbsUpIcon, ThumbsDownIcon, CalendarPlusIcon, SparklesIcon } from '../icons';
import { translations } from '../../translations';
import LoadingView from '../LoadingView';

const ScholarshipCard: React.FC<{ scholarship: Scholarship, isPdfView?: boolean }> = ({ scholarship, isPdfView = false }) => {
    const { language, updateScholarshipFeedback, theme } = useAppContext();
    const t = translations[language];

    const scoreColors: { [key: string]: string } = {
        'Perfect Match': 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700',
        'Excellent Match': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700',
        'Good Match': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700',
        'Possible Match': 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-700',
    };
    
    const effortColors = {
        Low: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
        Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
        High: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    };

    const feedbackColor = (feedback: 'good' | 'bad' | undefined, type: 'good' | 'bad') => {
        if (!feedback) return 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300';
        if (feedback === 'good' && type === 'good') return 'text-green-500';
        if (feedback === 'bad' && type === 'bad') return 'text-red-500';
        return 'text-slate-300 dark:text-slate-600';
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

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700 ${!isPdfView && 'hover:border-orange-500 hover:scale-[1.02] transition-all duration-300'} flex flex-col justify-between h-full ${scholarship.feedback === 'bad' ? 'opacity-50' : ''}`}>
            <div>
                <div className="flex justify-between items-start mb-4 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{scholarship.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{scholarship.organization}</p>
                    </div>
                    <span className={`text-xs text-center font-bold px-3 py-1 rounded-full whitespace-nowrap ${scoreColors[scholarship.matchScore] || 'bg-slate-100 dark:bg-slate-700'}`}>{scholarship.matchScore}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${effortColors[scholarship.effortScore]}`}>{t[(`effort_${scholarship.effortScore.toLowerCase()}` as keyof typeof t)]}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{scholarship.description}</p>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md mb-4 text-sm">
                    <p className="font-semibold text-orange-600">{t.why_it_fits}</p>
                    <p className="text-slate-600 dark:text-slate-300">{scholarship.matchReason}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-semibold">{t.deadline}:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{scholarship.deadline}</span>
                    </div>
                     <div className="flex items-center gap-2">
                         {!isPdfView && (
                            <>
                                <button onClick={() => handleAddToCalendar(`Apply for ${scholarship.name}`, scholarship.deadline)} className="text-slate-400 hover:text-orange-500" aria-label={t.add_to_calendar}><CalendarPlusIcon className="w-5 h-5"/></button>
                                <button onClick={() => updateScholarshipFeedback(scholarship.id, 'good')} className={feedbackColor(scholarship.feedback, 'good')} aria-label={t.save_to_plan}><ThumbsUpIcon className="w-5 h-5"/></button>
                                <button onClick={() => updateScholarshipFeedback(scholarship.id, 'bad')} className={feedbackColor(scholarship.feedback, 'bad')} aria-label={t.not_a_fit}><ThumbsDownIcon className="w-5 h-5"/></button>
                            </>
                         )}
                    </div>
                </div>
                <a
                    href={scholarship.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-orange-500 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors duration-300"
                >
                    {t.apply_now}
                </a>
            </div>
        </div>
    );
};

const OpportunitiesView: React.FC = () => {
    const { scholarships, loading, language, userProfile, theme } = useAppContext();
    const t = translations[language];
    const pdfExportRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = () => {
        const input = document.createElement('div');
        // Apply styles for off-screen rendering
        input.style.position = 'absolute';
        input.style.left = '-9999px';
        input.style.width = '1200px'; // A fixed width for consistency
        document.body.appendChild(input);

        // A component to render for PDF
        const PdfContent = () => (
            <div className={`${theme} p-8 bg-slate-50 dark:bg-slate-900`} style={{ fontFamily: "'Cairo', 'Inter', sans-serif"}}>
                 <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white', textAlign: 'center', marginBottom: '20px' }}>{t.opportunities_title} for {userProfile?.name}</h1>
                 <div className="grid grid-cols-2 gap-6">
                    {scholarships.filter(s => s.feedback !== 'bad').map(s => <ScholarshipCard key={s.id} scholarship={s} isPdfView={true} />)}
                </div>
            </div>
        );

        // FIX: Use React 18 createRoot API for rendering content for PDF export.
        const root = createRoot(input);
        
        // Use flushSync to ensure the component is rendered before calling html2canvas.
        flushSync(() => {
            root.render(<PdfContent />);
        });

        html2canvas(input, {
            scale: 2,
            useCORS: true,
            backgroundColor: theme === 'light' ? '#f8fafc' : '#0f172a',
        }).then((canvas) => {
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
            pdf.save(`${userProfile?.name}-scholarship-opportunities.pdf`);
            
        }).catch(err => {
            console.error("Failed to export PDF", err);
        }).finally(() => {
            // Cleanup
            root.unmount();
            document.body.removeChild(input);
        });
    };

    if (loading) {
        return <LoadingView title={t.loading_title} subtitle={t.loading_subtitle} />;
    }

    const goodMatches = [...scholarships].filter(s => s.feedback !== 'bad');

    return (
        <div className="space-y-8">
            <div>
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.opportunities_title}</h2>
                        <p className="text-slate-500 dark:text-slate-400">{t.opportunities_subtitle}</p>
                    </div>
                    <button 
                        onClick={handleExportPdf} 
                        className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition self-start sm:self-center"
                    >
                        {t.export_pdf}
                    </button>
                </div>

                {goodMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goodMatches.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t.no_scholarships_title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">{t.no_scholarships_subtitle}</p>
                    </div>
                )}
            </div>
            
            {userProfile?.profileFeedback && (
                 <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-3 mb-2">
                        <SparklesIcon className="w-6 h-6 text-blue-500"/>
                        <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200">{t.feedback_title}</h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{userProfile.profileFeedback}</p>
                </div>
            )}
        </div>
    );
};

export default OpportunitiesView;