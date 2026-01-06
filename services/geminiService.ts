
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult } from "../types";

const SYSTEM_PROMPT = `
Bản Đồ Sắc Màu Tâm Thức (Genz Luxury & High Vibration Mentor 2026)

VAI TRÒ: Bạn là một Mentor thông thái, người dẫn dắt tâm hồn với sự tinh tế và sang trọng bậc nhất. 
BỐI CẢNH THỜI GIAN: Hiện tại là đầu năm 2026 (Tháng 01). Mọi dự đoán và dẫn dắt cần tập trung vào năng lượng của chu kỳ mới này.

TRIẾT LÝ: 
- Chuyển hóa rung động từ Force sang Power (Hawkins).
- Ngôn từ thanh tao, súc tích, mang tính kiến tạo và dẫn lối.
- KHÔNG sử dụng ký tự markdown như **, *, #, __. Văn bản cần sự thuần khiết tuyệt đối.

QUY TẮC MÀU SẮC (CỰC KỲ QUAN TRỌNG):
- Đối với 21 chỉ số (indicators), bạn PHẢI chọn các mã màu Hex CÓ ĐỘ TƯƠNG PHẢN CAO với nền trắng.
- TUYỆT ĐỐI KHÔNG sử dụng màu Trắng, Xám quá nhạt, hay các màu pastel gần như trắng (vd: tránh #FFFFFF, #F5F5F5, #FAFAFA, #EEEEEE).
- Hãy ưu tiên các sắc thái đá quý đậm: Vàng Kim (đậm), Xanh Lục Bảo, Xanh Sapphire, Tím Amethyst, Hồng Ruby, Cam Hổ Phách, Đỏ Garnet, Xanh Indigo sâu.

QUY TẮC DẪN DẮT:
1. Bài luận (fullReading) cần bắt đầu bằng sự công nhận bản nguyên của người dùng, sau đó mở rộng sang tiềm năng năm 2026.
2. Dùng cấu trúc câu nâng đỡ, không phán xét.
3. Làm sạch mọi dấu vết markdown.

MỤC TIÊU: Một trải nghiệm sang trọng, bình an và đầy sức mạnh cho người đọc.
`;

export const analyzeNumerology = async (userData: UserData, liveIndicators: Record<string, string | number>): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const userQuestion = userData.intention || "Khởi đầu chương mới rực rỡ trong năm 2026";
  const indicatorsContext = Object.entries(liveIndicators).map(([k, v]) => `${k}: ${v}`).join(", ");
  
  const prompt = `
    Dẫn dắt tâm thức cho: ${userData.fullName}
    Ma trận tần số (Năm quy chuẩn 2026): ${indicatorsContext}
    Tâm nguyện: "${userQuestion}"
    
    Hãy thực hiện:
    1. Giảng giải 21 chỉ số này với ngôn từ của một Mentor.
    2. Chọn màu sắc cho từng chỉ số đảm bảo ĐẬM và SẮC NÉT (không dùng màu sáng/xám nhạt trùng nền).
    3. Viết bài fullReading dẫn dắt sâu sắc, làm sạch hoàn toàn các ký tự **.
    
    JSON Output:
    - introduction: Lời mở đầu đầy năng lượng.
    - mainColorDescription: Mô tả màu chủ đạo của linh hồn này.
    - mainColorHex: Mã màu đậm (vd: #1A1A1A, #0047AB...).
    - indicators: Mảng 21 chỉ số (name, value, description, category [Power/Force], color, colorHex [ĐẬM]).
    - fullReading: Bài giảng giải sâu sắc, không markdown.
    - blessing: Lời chúc nguyện bình an.
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
                category: { type: Type.STRING, enum: ["Power", "Force"] },
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
    
    const cleanVibrationText = (text: string) => {
      return text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/__/g, '')
        .trim();
    };
    
    data.introduction = cleanVibrationText(data.introduction);
    data.fullReading = cleanVibrationText(data.fullReading);
    data.blessing = cleanVibrationText(data.blessing);
    data.indicators = data.indicators.map((ind: any) => ({
      ...ind,
      description: cleanVibrationText(ind.description)
    }));

    return data as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Tần số đang được hiệu chỉnh cho năm 2026, hãy thử lại.");
  }
};
