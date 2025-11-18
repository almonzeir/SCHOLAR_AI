
import React from 'react';

// Helper for consistent sizing and props
const IconBase: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        {children}
    </svg>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase viewBox="0 0 24 24" strokeWidth="0" fill="currentColor" {...props}>
        <path d="M12 2.5L13.8 8.2C13.9 8.5 14.2 8.8 14.5 8.9L20.2 10.7C20.8 10.9 20.8 11.7 20.2 11.9L14.5 13.7C14.2 13.8 13.9 14.1 13.8 14.4L12 20.1C11.8 20.7 11 20.7 10.8 20.1L9 14.4C8.9 14.1 8.6 13.8 8.3 13.7L2.6 11.9C2 11.7 2 10.9 2.6 10.7L8.3 8.9C8.6 8.8 8.9 8.5 9 8.2L10.8 2.5C11 1.9 11.8 1.9 12 2.5Z" />
        <path d="M19 2L19.6 4.4C19.7 4.6 19.9 4.8 20.1 4.9L22.5 5.5C22.9 5.6 22.9 6.2 22.5 6.3L20.1 6.9C19.9 7 19.7 7.2 19.6 7.4L19 9.8C18.9 10.2 18.3 10.2 18.2 9.8L17.6 7.4C17.5 7.2 17.3 7 17.1 6.9L14.7 6.3C14.3 6.2 14.3 5.6 14.7 5.5L17.1 4.9C17.3 4.8 17.5 4.6 17.6 4.4L18.2 2C18.3 1.6 18.9 1.6 19 2Z" fillOpacity="0.5" />
        <path d="M5 18L5.6 20.4C5.7 20.6 5.9 20.8 6.1 20.9L8.5 21.5C8.9 21.6 8.9 22.2 8.5 22.3L6.1 22.9C5.9 23 5.7 23.2 5.6 23.4L5 25.8C4.9 26.2 4.3 26.2 4.2 25.8L3.6 23.4C3.5 23.2 3.3 23 3.1 22.9L0.7 22.3C0.3 22.2 0.3 21.6 0.7 21.5L3.1 20.9C3.3 20.8 3.5 20.6 3.6 20.4L4.2 18C4.3 17.6 4.9 17.6 5 18Z" fillOpacity="0.3" />
    </IconBase>
);

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" />
        <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
    </IconBase>
);

export const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M12 2V4" strokeWidth="2" />
        <path d="M12 20V22" strokeWidth="2" />
        <path d="M2 12H4" strokeWidth="2" />
        <path d="M20 12H22" strokeWidth="2" />
    </IconBase>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <path d="M3 10H21" strokeOpacity="0.3" />
        <path d="M16 2V6" strokeWidth="2" />
        <path d="M8 2V6" strokeWidth="2" />
        <rect x="7" y="14" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="11" y="14" width="2" height="2" fill="currentColor" stroke="none" />
        <rect x="15" y="14" width="2" height="2" fill="currentColor" stroke="none" />
    </IconBase>
);

export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M7 10V22" fill="currentColor" fillOpacity="0.2" />
        <path d="M15 5.88L14 10H19.83C20.9346 10 21.83 10.8954 21.83 12L19.5 20C19.28 21.12 18.32 22 17.17 22H4C2.89543 22 2 21.1046 2 20V12C2 10.8954 2.89543 10 4 10H6.76C7.31228 10 7.8393 9.7807 8.23 9.39L12 5.62V5.88C12 4.22315 13.3431 2.88 15 2.88C15 2.88 15 3 15 5.88Z" />
    </IconBase>
);

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
         <path d="M17 14V2" fill="currentColor" fillOpacity="0.2" />
         <path d="M9 18.12L10 14H4.17C3.06543 14 2.17 13.1046 2.17 12L4.5 4C4.72 2.88 5.68 2 6.83 2H20C21.1046 2 22 2.89543 22 4V12C22 13.1046 21.1046 14 20 14H17.24C16.6877 14 16.1607 14.2193 15.77 14.61L12 18.38V18.12C12 19.7769 10.6569 21.12 9 21.12C9 21.12 9 21 9 18.12Z" />
    </IconBase>
);

export const CalendarPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M8 2V6" />
        <path d="M16 2V6" />
        <rect x="3" y="6" width="18" height="16" rx="2" />
        <path d="M3 10H21" strokeOpacity="0.3" />
        <path d="M10 16H14" />
        <path d="M12 14V18" />
    </IconBase>
);

export const BotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <rect x="4" y="8" width="16" height="12" rx="3" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 8V4" />
        <path d="M8 4H16" />
        <path d="M9 13C9 13 9.5 14 12 14C14.5 14 15 13 15 13" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
        <circle cx="15" cy="11" r="1" fill="currentColor" />
    </IconBase>
);

export const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M22 2L11 13" strokeOpacity="0.4" />
        <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M12 1V1" />
        <path d="M12 23V20" />
        <path d="M8 23H16" />
        <path d="M19 10C19 13.866 15.866 17 12 17C8.13401 17 5 13.866 5 10" />
        <rect x="9" y="3" width="6" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
        <line x1="9" y1="6" x2="15" y2="6" stroke="currentColor" strokeOpacity="0.3"/>
        <line x1="9" y1="9" x2="15" y2="9" stroke="currentColor" strokeOpacity="0.3"/>
        <line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" strokeOpacity="0.3"/>
    </IconBase>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
         <rect x="6" y="6" width="12" height="12" rx="3" fill="currentColor" fillOpacity="0.2" />
    </IconBase>
);

export const EditIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M12 20H21" strokeOpacity="0.3" />
        <path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M14 2V8H20" strokeOpacity="0.4" />
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 13H16" strokeOpacity="0.5" />
        <path d="M8 17H16" strokeOpacity="0.5" />
        <path d="M8 9H10" strokeOpacity="0.5" />
    </IconBase>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M4 16V17C4 19.2091 5.79086 21 8 21H16C18.2091 21 20 19.2091 20 17V16" strokeOpacity="0.5" />
        <path d="M12 12V3" />
        <path d="M8 7L12 3L16 7" />
        <ellipse cx="12" cy="16" rx="4" ry="1" fill="currentColor" fillOpacity="0.2" stroke="none" />
    </IconBase>
);

export const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 2V4" />
        <path d="M12 20V22" />
        <path d="M4.93 4.93L6.34 6.34" />
        <path d="M17.66 17.66L19.07 19.07" />
        <path d="M2 12H4" />
        <path d="M20 12H22" />
        <path d="M6.34 17.66L4.93 19.07" />
        <path d="M19.07 4.93L17.66 6.34" />
    </IconBase>
);

export const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" fillOpacity="0.1" />
    </IconBase>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M20 6L9 17L4 12" strokeWidth="3" strokeLinecap="round" />
    </IconBase>
);

export const ArrowRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <IconBase {...props}>
        <path d="M5 12H19" />
        <path d="M12 5L19 12L12 19" />
    </IconBase>
);
