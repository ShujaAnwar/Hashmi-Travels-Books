import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the required environment key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getFinancialInsights(summary: string) {
  if (!process.env.API_KEY) {
    return "AI Insights are unavailable: API Key not configured.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert travel agency financial consultant, analyze the following trial balance and financial summary. Provide 3 actionable insights on how to improve cash flow or profitability. Keep it concise. Data: ${summary}`,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI insights at this moment.";
  }
}