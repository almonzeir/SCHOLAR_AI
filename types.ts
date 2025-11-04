export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gpa: number;
}

export interface Experience {
  company: string;
  role: string;
  description: string;
}

export interface UserProfile {
  name: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: string[];
  goals: string;
  financialSituation: string;
  studyInterests: string[];
  summary?: string;
  aiReviewNotes?: string;
  profileFeedback?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  organization: string;
  amount: number;
  deadline: string;
  description: string;
  eligibility: string[];
  continent: string;
  fieldOfStudy: string;
  url: string;
  matchScore: string;
  matchReason: string;
  effortScore: 'Low' | 'Medium' | 'High';
  feedback?: 'good' | 'bad';
  applicationStatus?: 'Not Started' | 'In Progress' | 'Submitted';
}

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

export interface ActionItem {
    id: string;
    scholarshipId: string;
    task: string;
    week: number;
    completed: boolean;
}

// FIX: Consolidated all global type declarations into a single file to prevent
// declaration conflicts and improve code organization, resolving an error in App.tsx.
declare global {
    interface Window {
        jspdf: {
            jsPDF: new (orientation?: 'p' | 'l', unit?: string, format?: string) => any;
        };
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }

    function html2canvas(
        element: HTMLElement,
        options?: any
    ): Promise<HTMLCanvasElement>;
}