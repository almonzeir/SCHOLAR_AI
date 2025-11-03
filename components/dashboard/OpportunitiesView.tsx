import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Scholarship } from '../../types';
import { CalendarIcon, ThumbsUpIcon, ThumbsDownIcon } from '../icons';
import { translations } from '../../translations';
import LoadingView from '../LoadingView';

const ScholarshipCard: React.FC<{ scholarship: Scholarship }> = ({ scholarship }) => {
    const { language, updateScholarshipFeedback } = useAppContext();
    const t = translations[language];

    const scoreColor = scholarship.matchScore > 85 ? 'text-green-400' : scholarship.matchScore > 70 ? 'text-yellow-400' : 'text-orange-400';
    
    const effortColors = {
        Low: 'bg-green-500/20 text-green-300',
        Medium: 'bg-yellow-500/20 text-yellow-300',
        High: 'bg-red-500/20 text-red-300',
    };

    const feedbackColor = (feedback: 'good' | 'bad' | undefined, type: 'good' | 'bad') => {
        if (!feedback) return 'text-slate-500 hover:text-white';
        if (feedback === 'good' && type === 'good') return 'text-green-500';
        if (feedback === 'bad' && type === 'bad') return 'text-red-500';
        return 'text-slate-600';
    };

    return (
        <div className={`bg-gray-800/50 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-orange-500 hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between h-full ${scholarship.feedback === 'bad' ? 'opacity-50' : ''}`}>
            <div>
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-xl font-bold text-white">{scholarship.name}</h3>
                     <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-700" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                            <path className={scoreColor} strokeWidth="2" strokeDasharray={`${scholarship.matchScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold ${scoreColor}`}>{scholarship.matchScore}%</span>
                        </div>
                    </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">{scholarship.organization}</p>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${effortColors[scholarship.effortScore]}`}>{t[(`effort_${scholarship.effortScore.toLowerCase()}` as keyof typeof t)]}</span>
                </div>
                <p className="text-slate-300 text-sm mb-4">{scholarship.description}</p>
                <div className="bg-gray-700/50 p-3 rounded-md mb-4 text-sm">
                    <p className="font-semibold text-orange-400">{t.why_it_fits}</p>
                    <p className="text-slate-300">{scholarship.matchReason}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-400">
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-semibold">{t.deadline}:</span>
                        <span className="font-medium text-slate-200">{scholarship.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => updateScholarshipFeedback(scholarship.id, 'good')} className={feedbackColor(scholarship.feedback, 'good')} aria-label={t.save_to_plan}><ThumbsUpIcon className="w-5 h-5"/></button>
                        <button onClick={() => updateScholarshipFeedback(scholarship.id, 'bad')} className={feedbackColor(scholarship.feedback, 'bad')} aria-label={t.not_a_fit}><ThumbsDownIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <a
                    href={scholarship.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-700 transition-colors duration-300"
                >
                    {t.apply_now}
                </a>
            </div>
        </div>
    );
};

const OpportunitiesView: React.FC = () => {
    const { scholarships, loading, language } = useAppContext();
    const t = translations[language];

    if (loading) {
        return <LoadingView title={t.loading_title} subtitle={t.loading_subtitle} />;
    }

    const sortedScholarships = [...scholarships].sort((a,b) => b.matchScore - a.matchScore);
    const goodMatches = sortedScholarships.filter(s => s.feedback !== 'bad');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2 text-white">{t.opportunities_title}</h2>
                <p className="text-slate-400 mb-6">{t.opportunities_subtitle}</p>
                {goodMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goodMatches.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <h3 className="text-xl font-semibold text-white">{t.no_scholarships_title}</h3>
                        <p className="text-slate-400 mt-2">{t.no_scholarships_subtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunitiesView;