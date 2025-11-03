import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { UserProfile, Scholarship, ActionItem } from '../types';

let chat: Chat;

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

const userProfileSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The user's full name." },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    fieldOfStudy: { type: Type.STRING },
                    gpa: { type: Type.NUMBER },
                },
                required: ['institution', 'degree', 'fieldOfStudy']
            }
        },
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ['company', 'role']
            }
        },
        skills: { type: Type.ARRAY, items: { type: Type.STRING } },
        languages: { type: Type.ARRAY, items: { type: Type.STRING } },
        goals: { type: Type.STRING, description: "A summary of the user's academic and career goals." },
        financialSituation: { type: Type.STRING, description: "Must be one of: 'Significant Need', 'Moderate Need', 'Some Need', 'No Need'." },
        studyInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['name', 'education', 'goals', 'skills']
};


const generatePromptForResumeParsing = (resumeText: string, language: string): string => {
    return `Analyze the following resume/CV text and extract the user's profile information. Respond in ${language} if possible for fields like 'goals'.
    For the 'financialSituation' field, make a reasonable guess based on the resume content or default to 'Some Need' if no information is available.
    Ensure the output strictly follows the provided JSON schema. If a piece of information (like GPA) is not present, omit the field but do not fail.

    Resume Text:
    ---
    ${resumeText}
    ---
    
    Return the user's profile as a single JSON object.`;
};

const generatePromptForResumeFileParsing = (language: string): string => {
    return `Analyze the following resume/CV document and extract the user's profile information. Respond in ${language} if possible for fields like 'goals'.
    For the 'financialSituation' field, make a reasonable guess based on the resume content or default to 'Some Need' if no information is available.
    Ensure the output strictly follows the provided JSON schema. If a piece of information (like GPA) is not present, omit the field but do not fail.
    
    Return the user's profile as a single JSON object.`;
};


const generatePromptForScholarships = (profile: UserProfile, language: string): string => {
    const schemaDescription = `
    [
      {
        "id": "string",
        "name": "string",
        "organization": "string",
        "amount": "number",
        "deadline": "string",
        "description": "string",
        "eligibility": ["string"],
        "continent": "string",
        "fieldOfStudy": "string",
        "url": "string",
        "matchScore": "number",
        "matchReason": "string",
        "effortScore": "string"
      }
    ]`;

    return `Using Google Search, find 5-10 real and currently available scholarships that are a strong match for the following user profile. 
    
    **CRITICAL INSTRUCTIONS:**
    1.  You **MUST** provide the direct, valid, and publicly accessible URL for each scholarship's application or information page. Do not use placeholder URLs like '#'.
    2.  Your response **MUST** be ONLY a single, valid JSON array of scholarship objects that adheres to the structure below. Do not include any text, explanation, or markdown formatting before or after the JSON array.

    **JSON Structure:**
    \`\`\`json
    ${schemaDescription}
    \`\`\`

    **User Profile:**
    - Name: ${profile.name}
    - Education: ${profile.education.map(e => `${e.degree} in ${e.fieldOfStudy} from ${e.institution} (GPA: ${e.gpa})`).join(', ')}
    - Experience: ${profile.experience.map(e => `${e.role} at ${e.company}`).join(', ')}
    - Skills: ${profile.skills.join(', ')}
    - Languages: ${profile.languages.join(', ')}
    - Goals: ${profile.goals}
    - Financial Situation: ${profile.financialSituation}
    - Study Interests: ${profile.studyInterests.join(', ')}
    
    Respond in ${language}.`;
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

export const parseResumeToProfile = async (resumeText: string, language: string): Promise<Partial<UserProfile>> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForResumeParsing(resumeText, language);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: userProfileSchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedProfile: Partial<UserProfile> = JSON.parse(jsonStr);
        return parsedProfile;

    } catch (error) {
        console.error("Error parsing resume:", error);
        throw new Error("Failed to parse resume with AI. Please try again or fill the form manually.");
    }
};

export const parseResumeFileToProfile = async (file: { data: string; mimeType: string }, language: string): Promise<Partial<UserProfile>> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForResumeFileParsing(language);

        const filePart = {
            inlineData: {
                data: file.data,
                mimeType: file.mimeType,
            },
        };
        
        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, filePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: userProfileSchema,
            }
        });

        const jsonStr = response.text.trim();
        const parsedProfile: Partial<UserProfile> = JSON.parse(jsonStr);
        return parsedProfile;

    } catch (error) {
        console.error("Error parsing resume file:", error);
        throw new Error("Failed to parse resume file with AI. Please try again or fill the form manually.");
    }
};

export const findAndRankScholarships = async (profile: UserProfile, language: string): Promise<Scholarship[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = generatePromptForScholarships(profile, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        
        const text = response.text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.error("No valid JSON array found in the scholarship response:", text);
            return [];
        }

        const jsonStr = jsonMatch[0];
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