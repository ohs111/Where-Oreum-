
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

export async function getJejuWeather(): Promise<any> {
  return callGeminiWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "현재 제주도의 날씨 정보를 알려주세요. 온도, 날씨 상태(맑음/흐림/비 등), 풍속, 습도를 포함하여 JSON 형식으로 제공해 주세요.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            temp: { type: Type.NUMBER, description: "현재 온도 (섭씨)" },
            condition: { type: Type.STRING, description: "날씨 상태 (예: 맑음, 구름 조금, 흐림, 비 등)" },
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
  availableOreumNames: string[]
): Promise<RecommendationResponse> {
  return callGeminiWithRetry(async () => {
    const listString = availableOreumNames.join(", ");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `사용자 질문: "${userInput}"
추천 가능한 오름 후보군: [${listString}]

위 후보군 목록에 포함된 오름 중에서만 3곳을 선정하여 추천해 주세요. 
각 오름의 특징을 사용자의 의도에 맞춰 설명하고, 탐방 팁을 제공해 주세요.`,
      config: {
        systemInstruction: `당신은 제주도 오름 탐방 및 위성 데이터 분석 전문가 '오름피커'입니다.
사용자의 기분, 상황, 목적(예: 데이트, 운동, 명상, 사진 촬영 등)에 가장 적합한 오름을 추천합니다.

[규칙]
1. 반드시 제공된 '추천 가능한 오름 후보군' 리스트에 있는 이름만 사용하세요.
2. 결과는 반드시 지정된 JSON 형식을 따라야 합니다.
3. 추천 이유는 감성적이면서도 전문적이어야 합니다.
4. 위성 관측 요약(satelliteSummary)에는 식생 지수(EVI)와 같은 전문적인 용어를 섞어 현재 탐방하기 좋은 상태임을 언급하세요.`,
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
                  name: { type: Type.STRING, description: "오름 이름 (리스트와 정확히 일치해야 함)" },
                  reason: { type: Type.STRING, description: "사용자 맞춤형 추천 이유" },
                  tips: { type: Type.STRING, description: "실질적인 탐방 팁" },
                  difficulty: { type: Type.STRING, description: "난이도 (상/중/하)" },
                  estimatedTime: { type: Type.STRING, description: "예상 소요 시간 (예: 약 40분)" },
                },
                required: ["name", "reason", "tips", "difficulty", "estimatedTime"],
              },
            },
            satelliteSummary: { type: Type.STRING, description: "현재 제주 전역의 위성 데이터 상태 요약 (한 문장)" },
          },
          required: ["suggestedOreums", "satelliteSummary"],
        },
      },
    });

    try {
      const text = response.text;
      if (!text) throw new Error("AI 응답이 비어있습니다.");
      const parsed = JSON.parse(text);
      
      if (!parsed.suggestedOreums || !Array.isArray(parsed.suggestedOreums) || parsed.suggestedOreums.length === 0) {
        throw new Error("유효한 추천 결과가 생성되지 않았습니다.");
      }
      
      return parsed;
    } catch (e) {
      console.error("Gemini Parsing Error:", e);
      throw new Error("AI의 답변을 처리하는 중 문제가 발생했습니다. 다시 시도해 주세요.");
    }
  });
}
