
import { GoogleGenAI } from "@google/genai";

// Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
function getAIClient() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  
  return new GoogleGenAI({ apiKey });
}

export async function getFinancialInsights(summary: string) {
  const ai = getAIClient();
  
  if (!ai) {
    return "AI Insights are unavailable: API Key not configured.";
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As an expert travel agency financial consultant, analyze the following trial balance and financial summary. Provide 3 actionable insights on how to improve cash flow or profitability. Keep it concise. Data: ${summary}`,
    });
    // Correct access to .text property from GenerateContentResponse
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate AI insights at this moment.";
  }
}
