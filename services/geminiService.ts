// FIX: Add Type to imports for responseSchema
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import missing scenario types
import type { ChatMessage, Scenario, ScenarioOption, ScenarioResult } from '../types';

// Support both process.env (Node/Netlify Build) and import.meta.env (Vite)
const API_KEY = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;

if (!API_KEY) {
  console.warn("API key not found. Please set the API_KEY environment variable in Netlify.");
}

// Initialize AI only if key exists to prevent immediate crash, handle null key gracefully in calls
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const chatSystemPrompt = `
Bạn là một chuyên gia tư vấn AI thân thiện, am hiểu về văn hóa số, đạo đức và pháp luật trên mạng, chuyên giải đáp thắc mắc cho học sinh THPT.
Nhiệm vụ của bạn là tạo ra một cuộc trò chuyện hữu ích, mang tính xây dựng và khuyến khích tương tác.

**Quy tắc trả lời:**
1.  **Thân thiện và Gần gũi:** Sử dụng ngôn ngữ tích cực, dễ hiểu, phù hợp với lứa tuổi học sinh.
2.  **Rõ ràng và Súc tích:** Đi thẳng vào vấn đề nhưng vẫn giải thích đầy đủ. Giữ câu trả lời trong khoảng 100-150 từ.
3.  **Đưa ra Ví dụ:** Khi có thể, hãy dùng các ví dụ minh họa ngắn gọn để giúp học sinh dễ hình dung vấn đề hơn. Ví dụ: "Chẳng hạn, khi bạn thấy một tin đồn..."
4.  **Đặt câu hỏi gợi mở:** Cố gắng kết thúc câu trả lời bằng một câu hỏi mở liên quan để khuyến khích học sinh suy nghĩ thêm và tiếp tục cuộc trò chuyện. Ví dụ: "Bạn nghĩ sao về cách xử lý đó?", "Bạn đã bao giờ gặp tình huống tương tự chưa?"
5.  **Tập trung vào chủ đề:** Chỉ trả lời các câu hỏi liên quan đến văn hóa số, đạo đức và pháp luật trên không gian mạng. Lịch sự từ chối các chủ đề khác.
6.  **Đưa ra lời khuyên thực tế:** Với các vấn đề phức tạp, hãy cung cấp các bước hành động đơn giản, dễ thực hiện.
`;

// FIX: Added system prompt for scenario analysis
const scenarioSystemPrompt = `
You are an expert AI advisor specializing in digital ethics, law, and culture for high school students in Vietnam.
Your task is to analyze a scenario and a user's chosen action, then provide a structured analysis in JSON format.

**Input:**
You will receive a scenario description and the user's chosen action.

**Output Structure:**
You MUST return a valid JSON object with the following structure. Do not add any extra text or markdown formatting around the JSON object.
{
  "ethical_analysis": "string",
  "legal_analysis": "string",
  "recommended_action": "string",
  "positive_alternative": "string",
  "severity_score": number,
  "citations": [
    {
      "title": "string",
      "excerpt": "string"
    }
  ]
}

**Guidelines:**
-   **Language:** Use clear, simple Vietnamese suitable for teenagers.
-   **Tone:** Be helpful, non-judgmental, and educational.
-   **Context:** Base your legal analysis on Vietnamese laws where applicable.
-   **Severity Score:** Be consistent. A simple faux pas is 1-3. An action that hurts others is 4-7. An illegal action is 8-10.
-   **Positive Alternative:** Provide a constructive, positive action the user could have taken instead of any of the given options.
`;

// FIX: Added missing function getScenarioAdvice
export const getScenarioAdvice = async (scenario: Scenario, option: ScenarioOption): Promise<ScenarioResult> => {
    // 1. Check if local feedback exists (Fastest & works offline)
    const localFeedback = scenario.feedback_per_option?.[option.id];
    if (localFeedback) {
         return {
             ethical_analysis: localFeedback.ethical,
             legal_analysis: localFeedback.legal,
             recommended_action: localFeedback.recommended_action,
             positive_alternative: localFeedback.positive_alternative || "Hãy luôn suy nghĩ kỹ về hậu quả trước khi hành động trên mạng xã hội.",
             severity_score: localFeedback.severity_score || 1,
             citations: localFeedback.law_refs.map(ref => ({ title: "Quy định pháp luật liên quan", excerpt: ref }))
         };
    }

    if (!ai) {
        // Mock response for development if no API key and no local data (unlikely for built-in scenarios)
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            ethical_analysis: "Đây là phân tích đạo đức mẫu (Chế độ offline). Hành động này có thể ảnh hưởng đến cảm xúc của người khác.",
            legal_analysis: "Đây là phân tích pháp lý mẫu (Chế độ offline). Cần xem xét các quy định về quyền riêng tư.",
            recommended_action: "Đây là hành động đề xuất mẫu. Lần sau, hãy cân nhắc kỹ hơn trước khi hành động.",
            positive_alternative: "Đây là gợi ý tích cực mẫu. Thay vì hành động như vậy, bạn có thể chọn một cách tiếp cận khác mang tính xây dựng hơn.",
            severity_score: 5,
            citations: [
                { title: "Nguyên tắc cộng đồng", excerpt: "Luôn tôn trọng người khác trên không gian mạng." }
            ]
        };
    }

    const userPrompt = `
    Tình huống: "${scenario.title} - ${scenario.description}"
    Hành động đã chọn: "${option.text}"

    Vui lòng phân tích hành động này và trả về kết quả dưới dạng JSON theo cấu trúc đã hướng dẫn.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: scenarioSystemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ethical_analysis: { type: Type.STRING },
                        legal_analysis: { type: Type.STRING },
                        recommended_action: { type: Type.STRING },
                        positive_alternative: { type: Type.STRING },
                        severity_score: { type: Type.NUMBER },
                        citations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    excerpt: { type: Type.STRING },
                                },
                                required: ['title', 'excerpt']
                            }
                        }
                    },
                    required: ['ethical_analysis', 'legal_analysis', 'recommended_action', 'positive_alternative', 'severity_score', 'citations']
                },
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        const result: ScenarioResult = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error calling Gemini API for scenario advice:", error);
        throw new Error("Failed to get scenario advice from AI.");
    }
};

export const getChatAdvice = async (history: ChatMessage[]): Promise<string> => {
  if (!ai) {
      return "Chức năng chat AI cần có API Key để hoạt động. Vui lòng thiết lập biến môi trường API_KEY trong Netlify hoặc sử dụng các chức năng Offline của ứng dụng.";
  }
  
  const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
  }));

  try {
      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contents,
          config: {
              // FIX: Corrected systemInstruction format to be a string
              systemInstruction: chatSystemPrompt,
              temperature: 0.7,
          },
      });
      
      return response.text.trim();

  } catch (error) {
      console.error("Error calling Gemini API for chat:", error);
      throw new Error("Failed to get chat advice from AI.");
  }
};