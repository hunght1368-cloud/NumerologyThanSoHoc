
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
Bản Đồ Sắc Màu Tâm Thức (Genz Luxury & David R. Hawkins Philosophy)

VAI TRÒ: Bạn là một Mentor thông thái, người dẫn dắt tâm hồn dựa trên Bản đồ Tâm thức của David R. Hawkins.
NGÔN NGỮ: Tiếng Việt hoàn toàn.
TRIẾT LÝ: 
- Chuyển hóa từ "Áp Lực" (Force - Dưới 200) sang "Sức Mạnh" (Power - Trên 200).
- Sử dụng các khái niệm: Định chuẩn, Rung động, Ý chí, Sự thấu suốt, Chấp nhận, Yêu thương.
- Ngôn từ sang trọng, tinh tế (Genz Luxury), súc tích.

QUY TẮC:
1. KHÔNG sử dụng ký tự markdown như **, *, #.
2. PHẢI chọn mã màu Hex đậm, tương phản cực tốt trên nền trắng.
3. Giải thích các chỉ số dựa trên sự rung động và tiềm năng chuyển hóa của linh hồn trong năm 2026.
`;
const getApiKey = (): string => {
  // Try different possible environment variable names
  const apiKey = 
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY || 
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY không được tìm thấy trong environment variables");
  }
  
  return apiKey;
};

export const analyzeNumerology = async (userData: UserData, liveIndicators: Record<string, string | number>): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() || "" });
  
  const indicatorsContext = Object.entries(liveIndicators).map(([k, v]) => `${k}: ${v}`).join(", ");
  
  const prompt = `
    Dẫn dắt tâm thức cho: ${userData.fullName}
    Ma trận tần số (Năm 2026): ${indicatorsContext}
    Tâm nguyện: "${userData.intention || "Tìm về bản ngã thuần khiết"}"
    
    Hãy thực hiện:
    1. Giảng giải 21 chỉ số này bằng văn phong Mentor Hawkins (Sức mạnh vs Áp lực).
    2. Chọn màu đậm tương phản tốt trên nền trắng cho từng indicator.
    3. Viết bài fullReading dẫn dắt sâu sắc, làm sạch hoàn toàn ký tự ** hay *.
    
    JSON Output:
    - introduction: Lời mở đầu đầy năng lượng thấu suốt.
    - mainColorDescription: Mô tả màu chủ đạo của linh hồn.
    - mainColorHex: Mã màu đậm (vd: #1A1A1A, #0047AB...).
    - indicators: Mảng 21 chỉ số (name, value, description, category [Sức Mạnh/Áp Lực], color, colorHex).
    - fullReading: Bài giảng giải sâu sắc về hành trình tâm thức.
    - blessing: Lời chúc nguyện an lạc.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: { type: Type.STRING },
          mainColorDescription: { type: Type.STRING },
          mainColorHex: { type: Type.STRING },
          indicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING, enum: ["Sức Mạnh", "Áp Lực"] },
                color: { type: Type.STRING },
                colorHex: { type: Type.STRING }
              },
              required: ["name", "value", "description", "category", "color", "colorHex"]
            }
          },
          fullReading: { type: Type.STRING },
          blessing: { type: Type.STRING }
        },
        required: ["introduction", "mainColorDescription", "mainColorHex", "indicators", "fullReading", "blessing"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    const clean = (text: string) => text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').trim();
    
    data.introduction = clean(data.introduction);
    data.fullReading = clean(data.fullReading);
    data.blessing = clean(data.blessing);
    data.indicators = data.indicators.map((ind: any) => ({
      ...ind,
      description: clean(ind.description)
    }));

    return data as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Sóng năng lượng đang hiệu chuẩn, vui lòng thử lại.");
  }
};
