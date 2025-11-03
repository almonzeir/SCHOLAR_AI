import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { UserProfile, Scholarship, ActionItem } from '../types';

let chat: Chat;

const scholarshipSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'A unique identifier for the scholarship (e.g., s1, s2).' },
        name: { type: Type.STRING },
        organization: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        deadline: { type: Type.STRING, description: 'In YYYY-MM-DD format.' },
        description: { type: Type.STRING },
        eligibility: { type: Type.ARRAY, items: { type: Type.STRING } },
        continent: { type: Type.STRING },
        fieldOfStudy: { type: Type.STRING },
        url: { type: Type.STRING },
        matchScore: { type: Type.NUMBER, description: 'A score from 0-100 indicating how well the scholarship matches the user profile.' },
        matchReason: { type: Type.STRING, description: 'A brief explanation of why this scholarship is a good match.' },
        effortScore: { type: Type.STRING, description: "An estimation of the application effort required. Can be 'Low', 'Medium', or 'High'." },
      },
      required: ['id', 'name', 'organization', 'amount', 'deadline', 'description', 'eligibility', 'url', 'matchScore', 'matchReason', 'effortScore']
    }
};

const actionPlanSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING, description: 'A unique identifier for the action item (e.g., a1, a2).' },
            scholarshipId: { type: Type.STRING, description: 'The ID of the scholarship this task is for.' },
            task: { type: Type.STRING, description: 'The specific task to be completed.' },
            week: { type: Type.NUMBER, description: 'The week number (from now) this task should be completed in.' },
            completed: { type: Type.BOOLEAN, description: 'Always set to false initially.' },
        },
        required: ['id', 'scholarshipId', 'task', 'week', 'completed'],
    },
};

const generatePromptForScholarships = (profile: UserProfile, language: string): string => {
    return `Based on this user profile, find and rank 5-10 relevant scholarships. Respond in ${language}.
    Profile:
    - Name: ${profile.name}
    - Education: ${profile.education.map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.institution} (GPA: ${e.gpa})`).join(', ')}
    - Experience: ${profile.experience.map(e => `${e.role} at ${e.company}`).join(', ')}
    - Skills: ${profile.skills.join(', ')}
    - Languages: ${profile.languages.join(', ')}
    - Goals: ${profile.goals}
    - Financial Situation: ${profile.financialSituation}
    - Study Interests: ${profile.studyInterests.join(', ')}
    
    Return the scholarships as a JSON array.`;
};

const generatePromptForSummary = (profile: UserProfile, language: string): string => {
    return `Summarize this user's profile in a concise and encouraging paragraph, highlighting their strengths for scholarship applications. Respond in ${language}.
    Profile:
    - Name: ${profile.name}
    - Education: ${profile.education.map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.institution} (GPA: ${e.gpa})`).join(', ')}
    - Goals: ${profile.goals}
    - Skills: ${profile.skills.join(', ')}
    
    The summary should be 1-2 sentences.`;
};


const generatePromptForActionPlan = (scholarships: Scholarship[], profile: UserProfile, language: string): string => {
    return `Create a SMART action plan for the user to apply for these scholarships. The plan should be broken down into weekly tasks. Respond in ${language}.
    User Profile Summary:
    - Goals: ${profile.goals}
    - Study Interests: ${profile.studyInterests.join(', ')}

    Scholarships:
    ${scholarships.map(s => `- ${s.name} (Deadline: ${s.deadline})`).join('\n')}

    Generate tasks for the next 8 weeks. For each task, specify the scholarship ID it relates to.
    Return the plan as a JSON array.`;
};


export const findAndRankScholarships = async (profile: UserProfile, language: string): Promise<Scholarship[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForScholarships(profile, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: scholarshipSchema,
            }
        });
        
        const jsonStr = response.text.trim();
        const scholarships: Scholarship[] = JSON.parse(jsonStr);
        return scholarships;

    } catch (error) {
        console.error("Error finding scholarships:", error);
        return [];
    }
};

export const generateProfileSummary = async (profile: UserProfile, language: string): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForSummary(profile, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        return "Could not generate profile summary.";
    }
};

export const generateSmartActionPlan = async (scholarships: Scholarship[], profile: UserProfile, language: string): Promise<ActionItem[]> => {
    if (scholarships.length === 0) return [];
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForActionPlan(scholarships, profile, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: actionPlanSchema,
            }
        });
        const jsonStr = response.text.trim();
        const actionPlan: ActionItem[] = JSON.parse(jsonStr);
        return actionPlan;
    } catch (error) {
        console.error("Error generating action plan:", error);
        return [];
    }
};

export const startChatSession = (language: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are ScholarAI, a helpful and encouraging AI assistant for students seeking scholarships. Your goal is to provide guidance, answer questions about the application process, and help users stay motivated. You have access to the user's profile but not the specific scholarships they are viewing. Keep your answers concise and friendly. Respond in ${language}.`,
        },
    });
};

export const sendMessageToAI = async (message: string, language: string): Promise<GenerateContentResponse> => {
    if (!chat) {
        startChatSession(language);
    }
    const response = await chat.sendMessage({ message });
    return response;
};
