import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { UserProfile, Scholarship, ActionItem } from '../types';

// IMPORTANT: Replace "YOUR_API_KEY_HERE" with your actual Google AI Studio API key.
// FIX: API key is now sourced from environment variables as per security best practices.
// const API_KEY = "AIzaSyC247YaVSkRAV9X-LrTzfP9puLj3o0Tun0";

// PERF: Instantiate the AI client once and reuse it across all service functions.
// FIX: Updated to use process.env.API_KEY for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let chat: Chat;

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

const generatePromptForAudioParsing = (language: string): string => {
    return `Listen to the following audio. The user is describing their professional and academic profile. Extract the information into a JSON object matching the provided schema. Be precise. If some information is missing, omit the field. Respond in ${language} if possible for fields like 'goals'.
    For the 'financialSituation' field, make a reasonable guess based on the content or default to 'Some Need' if no information is available.
    Ensure the output strictly follows the provided JSON schema.
    
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
        "matchScore": "string", 
        "matchReason": "string",
        "effortScore": "string"
      }
    ]`;

    return `Using Google Search, find up to 50 real and currently available scholarships that are a strong match for the following user profile. Prioritize diversity in opportunities, including well-known and niche scholarships.
    
    **CRITICAL INSTRUCTIONS:**
    1.  You **MUST** provide the direct, valid, and publicly accessible URL for each scholarship's application or information page. Do not use placeholder URLs like '#'.
    2.  For the 'matchScore' field, use one of the following descriptive labels based on how well the user's profile aligns with the eligibility criteria: 'Perfect Match', 'Excellent Match', 'Good Match', 'Possible Match'.
    3.  Your response **MUST** be ONLY a single, valid JSON array of scholarship objects that adheres to the structure below. Do not include any text, explanation, or markdown formatting before or after the JSON array.

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

const generatePromptForProfileFeedback = (profile: UserProfile, scholarships: Scholarship[], language: string): string => {
    return `You are an expert academic advisor. Based on the user's profile and the list of scholarships found for them, provide 2-3 actionable, personalized recommendations for how they can strengthen their profile to unlock even more scholarship opportunities. Be encouraging and specific. For example, if they are in tech but lack project experience, suggest building a portfolio. If many scholarships require volunteering, suggest that. The response should be a concise paragraph. Respond in ${language}.

    **User Profile:**
    - Goals: ${profile.goals}
    - Skills: ${profile.skills.join(', ')}
    - Study Interests: ${profile.studyInterests.join(', ')}
    - Experience: ${profile.experience.map(e => e.role).join(', ')}

    **Found Scholarships Sample:**
    ${scholarships.slice(0, 5).map(s => `- ${s.name} (Eligibility: ${s.eligibility.join(', ')})`).join('\n')}
    `;
};

const generatePromptForActionPlan = (scholarships: Scholarship[], language: string): string => {
    const actionItemSchema = `
    [
      {
        "id": "string (unique identifier for the task)",
        "scholarshipId": "string (the ID of the scholarship this task is for)",
        "task": "string (a clear, actionable task description including the scholarship name)",
        "week": "number (the week number, starting from 1 for the upcoming week)",
        "completed": "boolean (always false initially)"
      }
    ]`;

    return `You are an expert academic advisor. Based on the following list of scholarships a user is interested in, create a detailed, week-by-week action plan to help them apply successfully. Today's date is ${new Date().toISOString().split('T')[0]}.

    **CRITICAL INSTRUCTIONS:**
    1.  For each scholarship, create 2-4 essential tasks (e.g., draft essay, request recommendation letters, finalize application, submit).
    2.  Distribute these tasks across weeks, starting from week 1 (this upcoming week).
    3.  Work backward from each scholarship's deadline to schedule the tasks logically. Submission should be in the final week before the deadline. Earlier tasks like drafting should come first.
    4.  The 'task' description **MUST** include the name of the scholarship it pertains to.
    5.  Your response **MUST** be ONLY a single, valid JSON array of action item objects that adheres to the structure below. Do not include any text, explanation, or markdown formatting before or after the JSON array.

    **JSON Structure:**
    \`\`\`json
    ${actionItemSchema}
    \`\`\`

    **User's Selected Scholarships:**
    ${scholarships.map(s => `- ID: ${s.id}, Name: ${s.name}, Deadline: ${s.deadline}`).join('\n')}

    Respond in ${language}.`;
};


export const parseResumeToProfile = async (resumeText: string, language: string): Promise<Partial<UserProfile>> => {
    try {
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

    } catch (error: any) {
        console.error("Error parsing resume:", error);
        throw new Error("Failed to parse resume with AI. The service may be temporarily unavailable.");
    }
};

export const parseResumeFileToProfile = async (file: { data: string; mimeType: string }, language: string): Promise<Partial<UserProfile>> => {
    try {
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

    } catch (error: any) {
        console.error("Error parsing resume file:", error);
        throw new Error("Failed to parse resume file with AI. The service may be temporarily unavailable.");
    }
};

export const parseAudioToProfile = async (audio: { data: string; mimeType: string }, language: string): Promise<Partial<UserProfile>> => {
    try {
        const prompt = generatePromptForAudioParsing(language);
        
        const audioPart = {
            inlineData: {
                data: audio.data,
                mimeType: audio.mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // A model that supports audio input
            contents: { parts: [textPart, audioPart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: userProfileSchema,
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr);
    } catch (error: any) {
        console.error("Error parsing audio file:", error);
        throw new Error("Failed to parse audio with AI. The service may be temporarily unavailable.");
    }
};


export const findAndRankScholarships = async (profile: UserProfile, language: string): Promise<Scholarship[]> => {
    try {
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
            throw new Error("The AI returned an unexpected format for scholarships. Please try rescanning.");
        }

        const jsonStr = jsonMatch[0];
        const scholarships: Scholarship[] = JSON.parse(jsonStr);
        return scholarships;

    } catch (error: any) {
        console.error("Error finding scholarships:", error);
        throw new Error("Could not find scholarships. The AI service may be temporarily unavailable.");
    }
};

export const generateProfileSummary = async (profile: UserProfile, language: string): Promise<string> => {
     try {
        const prompt = generatePromptForSummary(profile, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error: any) {
        console.error("Error generating summary:", error);
        throw new Error("Could not generate profile summary. The AI service may be temporarily unavailable.");
    }
};

export const generateProfileFeedback = async (profile: UserProfile, scholarships: Scholarship[], language: string): Promise<string> => {
    if (scholarships.length === 0) return "";
    try {
        const prompt = generatePromptForProfileFeedback(profile, scholarships, language);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error: any) {
        console.error("Error generating profile feedback:", error);
        return "Could not generate personalized feedback at this time.";
    }
};

export const generateActionPlan = async (scholarships: Scholarship[], language: string): Promise<ActionItem[]> => {
    try {
        if (scholarships.length === 0) return [];
        const prompt = generatePromptForActionPlan(scholarships, language);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            scholarshipId: { type: Type.STRING },
                            task: { type: Type.STRING },
                            week: { type: Type.NUMBER },
                            completed: { type: Type.BOOLEAN },
                        },
                        required: ['id', 'scholarshipId', 'task', 'week', 'completed']
                    }
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const plan: ActionItem[] = JSON.parse(jsonStr);
        return plan;

    } catch (error: any) {
        console.error("Error generating action plan:", error);
        throw new Error("Could not generate an action plan. The AI service may be temporarily unavailable.");
    }
};

export const startChatSession = (language: string) => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are ScholarAI, a helpful and encouraging AI assistant for students seeking scholarships. Your goal is to provide guidance, answer questions about the application process, and help users stay motivated. You have access to the user's profile but not the specific scholarships they are viewing. Keep your answers concise and friendly. Respond in ${language}.`,
        },
    });
};

export const sendMessageToAI = async (message: string, language: string): Promise<GenerateContentResponse> => {
    try {
        if (!chat) {
            startChatSession(language);
        }
        const response = await chat.sendMessage({ message });
        return response;
// FIX: Added curly braces to the catch block to fix a syntax error.
    } catch (error: any) {
        console.error("Error sending chat message:", error);
        throw new Error("Failed to get a response from the AI assistant. The service may be temporarily unavailable.");
    }
};