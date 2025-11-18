import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { translations } from '../../translations';
import { ActionItem } from '../../types';
import { CalendarPlusIcon, SparklesIcon } from '../icons';

const ActionPlanView: React.FC = () => {
    const { 
        actionPlan, 
        isPlanLoading, 
        planError, 
        generateActionPlan, 
        updateActionItemStatus, 
        getScholarshipById, 
        language 
    } = useAppContext();
    const t = translations[language];

    const groupedPlan = useMemo(() => {
        // FIX: Explicitly type the accumulator via generic to ensure TypeScript correctly
        // infers the return type of reduce as Record<string, ActionItem[]>.
        return actionPlan.reduce<Record<string, ActionItem[]>>((acc, item) => {
            const weekKey = String(item.week);
            if (!acc[weekKey]) {
                acc[weekKey] = [];
            }
            acc[weekKey].push(item);
            return acc;
        }, {});
    }, [actionPlan]);

    const handleAddToCalendar = (task: string, scholarshipId: string) => {
        const scholarship = getScholarshipById(scholarshipId);
        if (!scholarship || !scholarship.deadline) return;

        const title = encodeURIComponent(task);
        const description = encodeURIComponent(`Task for ${scholarship.name}. Deadline: ${scholarship.deadline}. More info: ${scholarship.url}`);
        
        // Make the calendar event for the day of the task, assuming it's for the deadline week
        const deadlineDate = new Date(scholarship.deadline);
        
        // Safely calculate max week and handle empty plan
        const weeks = (actionPlan || []).map((i: ActionItem) => i.week);
        const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 1;

        // Correctly calculate the date without mutating the original deadline date object
        const referenceDate = new Date(deadlineDate);
        const eventDate = new Date(referenceDate.setDate(referenceDate.getDate() - 7 * (maxWeek - 1)));
        
        const dateStr = eventDate.toISOString().slice(0, 10).replace(/-/g, '');
        const nextDateStr = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');

        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateStr}/${nextDateStr}&details=${description}`;
        window.open(url, '_blank');
    };

    if (isPlanLoading) {
        return (
            <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t.generating_plan}</h3>
            </div>
        );
    }

    if (planError) {
        return <div className="text-center py-20 text-red-500">{planError}</div>;
    }

    if (actionPlan.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{t.empty_plan_title}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">{t.empty_plan_subtitle}</p>
                <button 
                    onClick={generateActionPlan} 
                    className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition flex items-center gap-2 mx-auto"
                >
                    <SparklesIcon className="w-5 h-5" />
                    <span>{t.generate_plan_button}</span>
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t.tab_action_plan}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{t.action_plan_subtitle}</p>
                </div>
                <button 
                    onClick={generateActionPlan}
                    className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition self-start sm:self-center flex items-center gap-2"
                >
                    <SparklesIcon className="w-4 h-4" />
                    {t.regenerate_plan_button}
                </button>
            </div>

            {Object.entries(groupedPlan).sort(([a], [b]) => Number(a) - Number(b)).map(([week, items]: [string, ActionItem[]]) => (
                <div key={week} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-orange-600 mb-4">{t.week.replace('{week}', week)}</h3>
                    <ul className="space-y-3">
                        {items.map(item => (
                            <li key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={(e) => updateActionItemStatus(item.id, e.target.checked)}
                                        id={`task-${item.id}`}
                                        className="h-5 w-5 rounded border-slate-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 bg-white dark:bg-slate-900"
                                    />
                                    <label htmlFor={`task-${item.id}`} className={`mx-3 text-slate-800 dark:text-slate-200 ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                        {item.task}
                                    </label>
                                </div>
                                <button onClick={() => handleAddToCalendar(item.task, item.scholarshipId)} className="text-slate-400 hover:text-orange-500" aria-label={t.add_to_calendar}>
                                    <CalendarPlusIcon className="w-5 h-5"/>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ActionPlanView;