
import { GoogleGenAI, Type } from "@google/genai";
import { RecommendationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to call Gemini with exponential backoff retry logic
 */
async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED");
      const isServerError = errorMessage.includes("500") || errorMessage.includes("503");

      if (isRateLimit || isServerError) {
        const backoffDelay = initialDelay * Math.pow(2, i);
        console.warn(`Gemini API error (Attempt ${i + 1}/${maxRetries}). Retrying in ${backoffDelay}ms...`, error);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        continue;
      }
      throw error; 
    }
  }
  throw lastError;
}

export async function getJejuWeather(lang: 'ko' | 'en' = 'ko'): Promise<any> {
  return callGeminiWithRetry(async () => {
    const prompt = lang === 'ko' 
      ? "현재 제주도의 날씨 정보를 알려주세요. 온도, 날씨 상태(맑음/흐림/비 등), 풍속, 습도를 포함하여 JSON 형식으로 제공해 주세요."
      : "Provide current weather info for Jeju Island. Include temperature, condition (clear/cloudy/rain, etc.), wind speed, and humidity in JSON format.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temp: { type: Type.NUMBER, description: "현재 온도 (섭씨)" },
            condition: { type: Type.STRING, description: lang === 'ko' ? "날씨 상태 (예: 맑음, 흐림)" : "Weather condition (e.g., Clear, Cloudy)" },
            wind: { type: Type.STRING, description: "풍속 정보" },
            humidity: { type: Type.STRING, description: "습도 정보" },
            description: { type: Type.STRING, description: "날씨에 대한 짧은 조언이나 요약" }
          },
          required: ["temp", "condition", "wind", "humidity", "description"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse weather data", e);
      return null;
    }
  });
}

export async function getOreumRecommendations(
  userInput: string,
  availableOreums: {name: string, name_en: string}[],
  lang: 'ko' | 'en' = 'ko'
): Promise<RecommendationResponse> {
  return callGeminiWithRetry(async () => {
    const listString = availableOreums.map(o => `${o.name} (${o.name_en})`).join(", ");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User Query: "${userInput}"
Available Candidates: [${listString}]
Language: ${lang === 'ko' ? 'Korean' : 'English'}

Based on the candidates, select 3 locations and provide reasons, tips, and metadata in the requested language.`,
      config: {
        systemInstruction: `You are 'Oreum Picker', an expert in Jeju Island trekking and satellite data analysis.
Recommend oreums based on mood, situation, or purpose.

[Rules]
1. ONLY use names from the provided candidate list.
2. Return strictly in JSON format.
3. Language must be ${lang === 'ko' ? 'Korean' : 'English'}.
4. Use professional yet emotional descriptions.
5. satelliteSummary should mention NDVI/EVI in a concise way.`,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedOreums: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Oreum name (must exactly match one of the provided Korean or English names)" },
                  reason: { type: Type.STRING, description: "Customized reason" },
                  tips: { type: Type.STRING, description: "Practical tips" },
                  difficulty: { type: Type.STRING, description: lang === 'ko' ? "난이도 (상/중/하)" : "Difficulty (High/Mid/Low)" },
                  estimatedTime: { type: Type.STRING, description: "Est. time (e.g., 40 mins)" },
                },
                required: ["name", "reason", "tips", "difficulty", "estimatedTime"],
              },
            },
            satelliteSummary: { type: Type.STRING, description: "One-sentence satellite summary" },
          },
          required: ["suggestedOreums", "satelliteSummary"],
        },
      },
    });

    try {
      const text = response.text;
      if (!text) throw new Error("AI 응답이 비어있습니다.");
      const parsed = JSON.parse(text);
      return parsed;
    } catch (e) {
      console.error("Gemini Parsing Error:", e);
      throw new Error(lang === 'ko' ? "AI 응답 처리 중 문제가 발생했습니다." : "Problem processing AI response.");
    }
  });
}
