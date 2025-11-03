import React from 'react';

interface GuidanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GuidanceModal: React.FC<GuidanceModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">AI Guidance</h2>
                <p className="text-slate-300 mb-6">
                    Here you might find tips and suggestions from the AI based on your progress and profile.
                </p>
                <button
                    onClick={onClose}
                    className="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};

export default GuidanceModal;
