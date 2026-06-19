import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables.');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Initialize using the Gemini 2.5 Flash model
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
