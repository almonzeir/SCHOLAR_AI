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
            html2canvas(input, {
                scale: 2, // Higher resolution
                backgroundColor: '#1f2937', // Match dark theme
                useCORS: true,
            }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait orientation
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
    
                // Calculate the ratio to fit the canvas width to the PDF width
                const ratio = canvasWidth / pdfWidth;
                const canvasHeightInPdf = canvasHeight / ratio;
    
                let heightLeft = canvasHeightInPdf;
                let position = 0;
    
                // Add the first page
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInPdf);
                heightLeft -= pdfHeight;
    
                // Add new pages if content is taller than one page
                while (heightLeft > 0) {
                    position = position - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, canvasHeightInPdf);
                    heightLeft -= pdfHeight;
                }
                pdf.save('scholarship-action-plan.pdf');
            });
        }
    };
    
    const handleAddToCalendar = (task: string, deadline: string) => {
        const title = encodeURIComponent(task);
        const description = encodeURIComponent(`Deadline for scholarship application.`);
        const date = deadline.replace(/-/g, '');
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}&details=${description}`;
        window.open(url, '_blank');
    };

    if (loading) {
        return <div className="text-center p-8 text-slate-400">{t.generating_plan}...</div>;
    }

    const scholarshipsWithTasks = actionPlan.reduce((acc, item) => {
        const scholarship = getScholarshipById(item.scholarshipId);
        if (scholarship) {
            if (!acc[scholarship.id]) {
                acc[scholarship.id] = { ...scholarship, tasks: [] };
            }
            acc[scholarship.id].tasks.push(item);
        }
        return acc;
    }, {} as any);

    const sortedScholarships = Object.values(scholarshipsWithTasks).sort((a: any, b: any) => {
        if (a.deadline === 'N/A') return 1;
        if (b.deadline === 'N/A') return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{t.plan_title}</h2>
                <button 
                    onClick={handleExportPdf} 
                    className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition"
                >
                    {t.export_pdf}
                </button>
            </div>
            <div ref={timelineRef} className="p-6 bg-gray-900 rounded-lg border border-gray-700">
                {sortedScholarships.length > 0 ? (
                    <div className="space-y-8">
                        {sortedScholarships.map((s: any) => (
                            <div key={s.id}>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-2 border-b border-gray-700">
                                    <h3 className="text-xl font-bold text-orange-500">{s.name}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mt-2 sm:mt-0">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{t.deadline}:</span>
                                        <span className="font-medium text-slate-200">{s.deadline}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {s.tasks.map((task: any) => (
                                         <div key={task.id} className="flex items-center gap-4 bg-gray-800 p-3 rounded-md">
                                            <input
                                                type="checkbox"
                                                checked={task.completed}
                                                onChange={(e) => updateActionItem(task.id, e.target.checked)}
                                                className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-orange-600 focus:ring-orange-500 cursor-pointer flex-shrink-0"
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
                    <div className="text-center py-8">
                        <p className="text-slate-400">{t.empty_plan_title}</p>
                        <p className="text-sm text-slate-500">{t.empty_plan_subtitle}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionPlanView;