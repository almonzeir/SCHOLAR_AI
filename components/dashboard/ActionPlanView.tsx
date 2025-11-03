import React, { useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { translations } from '../../translations';
import { CalendarIcon, CalendarPlusIcon } from '../icons';

declare global {
    interface Window {
        jspdf: {
            jsPDF: new (orientation?: 'p' | 'l', unit?: string, format?: string) => any;
        };
    }
    function html2canvas(element: HTMLElement, options?: any): Promise<HTMLCanvasElement>;
}

const ActionPlanView: React.FC = () => {
    const { actionPlan, updateActionItem, getScholarshipById, loading, language } = useAppContext();
    const t = translations[language];
    const timelineRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = () => {
        const { jsPDF } = window.jspdf;
        const input = timelineRef.current;
        if (input) {
            // Add a title element for the PDF export that is visually hidden on the screen
            const header = document.createElement('div');
            header.innerHTML = `<h1 style="font-size: 24px; font-weight: bold; color: white; text-align: center; margin-bottom: 20px; padding-top: 20px;">${t.plan_title}</h1>`;
            input.prepend(header);

            html2canvas(input, {
                scale: 2, // Higher resolution
                backgroundColor: '#111827', // Match dark theme
                useCORS: true,
                windowWidth: 1200, // Use a fixed width for consistent rendering
            }).then((canvas) => {
                input.removeChild(header); // Clean up the added header
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
                const pdfWidth = pdf.internal.pageSize.getWidth();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
    
                const ratio = canvasWidth / pdfWidth;
                const imgHeight = canvasHeight / ratio;
    
                let heightLeft = imgHeight;
                let position = 0;
    
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
    
                while (heightLeft > 0) {
                    position = position - pdf.internal.pageSize.getHeight();
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                    heightLeft -= pdf.internal.pageSize.getHeight();
                }
                pdf.save('scholarship-action-plan.pdf');
            }).catch(err => {
                console.error("Failed to export PDF", err);
                input.removeChild(header);
            });
        }
    };
    
    const handleAddToCalendar = (task: string, deadline: string) => {
        if (!deadline || deadline === 'N/A') return;
        const title = encodeURIComponent(task);
        const description = encodeURIComponent(`Deadline for scholarship application.`);
        // Assuming deadline is YYYY-MM-DD
        const date = deadline.replace(/-/g, '');
        // Google Calendar link for a single day event
        const nextDay = new Date(new Date(deadline).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0,10).replace(/-/g,'');
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${nextDay}&details=${description}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return <div className="text-center p-8 text-slate-400">{t.generating_plan}...</div>;
    }

    const scholarshipsWithTasks = actionPlan.reduce((acc, item) => {
        const scholarship = getScholarshipById(item.scholarshipId);
        if (scholarship && scholarship.feedback !== 'bad') {
            if (!acc[scholarship.id]) {
                acc[scholarship.id] = { ...scholarship, tasks: [] };
            }
            acc[scholarship.id].tasks.push(item);
        }
        return acc;
    }, {} as any);

    const sortedScholarships = Object.values(scholarshipsWithTasks).sort((a: any, b: any) => {
        if (!a.deadline || a.deadline === 'N/A') return 1;
        if (!b.deadline || b.deadline === 'N/A') return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    return (
        <div>
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold text-white">{t.plan_title}</h2>
                <button 
                    onClick={handleExportPdf} 
                    className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition self-start sm:self-center"
                >
                    {t.export_pdf}
                </button>
            </div>
            <div ref={timelineRef} className="p-2 sm:p-6 bg-gray-900 rounded-lg border border-gray-700">
                {sortedScholarships.length > 0 ? (
                    <div className="space-y-10">
                        {sortedScholarships.map((s: any) => (
                            <div key={s.id}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-2 border-b border-gray-700">
                                    <div>
                                        <h3 className="text-xl font-bold text-orange-500">{s.name}</h3>
                                        <p className="text-sm text-slate-400">{s.organization}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-2 sm:mt-0 flex-shrink-0">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{t.deadline}:</span>
                                        <span className="font-medium text-slate-200">{s.deadline || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {s.tasks.sort((a:any, b:any) => a.week - b.week).map((task: any) => (
                                         <div key={task.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-md hover:bg-gray-700/50 transition-colors duration-200">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={(e) => updateActionItem(task.id, e.target.checked)}
                                                className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-orange-600 focus:ring-orange-500 cursor-pointer flex-shrink-0"
                                                aria-label={`Mark task '${task.task}' as complete`}
                                            />
                                            <div className="flex-grow">
                                                <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                                                    {task.task}
                                                </p>
                                                <p className="text-sm text-slate-400">{t.week.replace('{week}', task.week)}</p>
                                            </div>
                                            <button onClick={() => handleAddToCalendar(task.task, s.deadline)} className="text-slate-400 hover:text-orange-400" aria-label={t.add_to_calendar}>
                                                <CalendarPlusIcon className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
                            <CalendarIcon className="h-6 w-6 text-orange-500" aria-hidden="true" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-white">{t.empty_plan_title}</h3>
                        <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{t.empty_plan_subtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionPlanView;