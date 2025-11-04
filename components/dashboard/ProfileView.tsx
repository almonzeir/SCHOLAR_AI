import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UserProfile } from '../../types';
import { translations } from '../../translations';
import { EditIcon } from '../icons';

const ProfileView: React.FC = () => {
    const { userProfile, updateUserProfile, language } = useAppContext();
    const t = translations[language];
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState<UserProfile | null>(userProfile);

    if (!userProfile || !editedProfile) return <div>Loading profile...</div>;

    const handleEditToggle = () => {
        if (isEditing && editedProfile) {
            updateUserProfile(editedProfile);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const renderField = (label: string, value: any, name: keyof UserProfile, type = 'text', component = 'input') => {
        if (isEditing) {
            const commonProps = {
                name: name,
                value: value,
                onChange: handleChange,
                className: "mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2",
            };
            if (component === 'textarea') {
                return <textarea {...commonProps} rows={3} />;
            }
            return <input type={type} {...commonProps} />;
        }
        return <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{Array.isArray(value) ? value.join(', ') : value}</p>;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.profile_title}</h2>
                <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition">
                    <EditIcon className="w-4 h-4" />
                    {isEditing ? t.save_changes : t.edit_profile}
                </button>
            </div>
            
             <div className="space-y-6">
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-orange-600">{t.summary}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{userProfile.summary}</p>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">{t.full_name}</label>
                        {renderField(t.full_name, editedProfile.name, 'name')}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">{t.goals}</label>
                        {renderField(t.goals, editedProfile.goals, 'goals', 'text', 'textarea')}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium leading-6 text-orange-600">{t.education}</h3>
                    {editedProfile.education.map((edu, i) => (
                        <div key={i} className="mt-2 p-4 border border-slate-200 dark:border-slate-700 rounded-md">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{edu.institution}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{edu.degree} in {edu.fieldOfStudy} - GPA: {edu.gpa}</p>
                        </div>
                    ))}
                </div>
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-orange-600">{t.skills}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{editedProfile.skills.join(', ')}</p>
                </div>
                 <div>
                    <h3 className="text-lg font-medium leading-6 text-orange-600">{t.languages}</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{editedProfile.languages.join(', ')}</p>
                </div>
             </div>
        </div>
    );
};

export default ProfileView;