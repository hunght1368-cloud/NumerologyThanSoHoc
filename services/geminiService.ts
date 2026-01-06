
import { GoogleGenAI, Type } from "@google/genai";
import { UserData, AnalysisResult } from "../types";

const INDICATORS_LIST = [
  "Đường Đời", "Sứ Mệnh", "Linh Hồn", "Nhân Cách", "Ngày Sinh", "Thái Độ", 
  "Trưởng Thành", "Nợ Nghiệp", "Chặng 1", "Chặng 2", "Chặng 3", "Chặng 4",
  "Thách Thức 1", "Thách Thức 2", "Thách Thức 3", "Thách Thức 4",
  "Năng Lực Tự Nhiên", "Động Lực Nội Tại", "Cầu Nối Nội Tâm", "Năm Cá Nhân", "Tháng Cá Nhân"
];

const SYSTEM_PROMPT = `
Bản Đồ Sắc Màu Tâm Thức (Genz Luxury & Màu Sắc Năng Lượng)

VAI TRÒ: Chuyên gia dẫn dắt (Mentor) thông thái, tinh tế, sang trọng.
TRIẾT LÝ: Map of Consciousness (David R. Hawkins). Chuyển hóa Force (Áp lực) -> Power (Sức mạnh nội tại).
NGÔN TỪ: chuyển hóa, tần số, rung động, thấu suốt, bản nguyên.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG SỬ DỤNG ký tự dấu sao đôi (**text**) để in đậm trong bất kỳ phần nào của câu trả lời. Hãy dùng ngôn từ mạnh mẽ và cấu trúc câu để tạo điểm nhấn thay vì định dạng markdown.

2. ĐOẠN DẪN ĐẦU TIÊN (introduction): "Trân trọng chào đón bạn. Hãy cùng tôi khám phá bản đồ tâm thức qua lăng kính Thần số học và tần số năng lượng. Chúng ta sẽ cùng chuyển hóa mọi áp lực thành sức mạnh, đưa rung động của bạn về trạng thái thấu hiểu và yêu thương thuần khiết. Hành trình của bạn, bắt đầu từ đây."

3. CẤU TRÚC PHẢN HỒI FULL READING (Markdown ## và Double line-breaks):
## 1. TẦN SỐ CHỦ ĐẠO (Overview)
- Nhận diện màu sắc năng lượng chủ đạo (Vàng kim/Xanh dương sáng cho Power).

## 2. DÒNG CHẢY NĂNG LƯỢNG (Connection)
- Liên kết 21 chỉ số thành câu chuyện logic. Dùng cụm "Năng lượng có xu hướng...".

## 3. GÓC CUA BỨT PHÁ (Breakthrough)
- Đối diện Thử thách/Nợ nghiệp. Kích hoạt tần số Can đảm (200+). 

## 4. CHUYỂN HÓA THỰC TẠI
- Giải quyết trực tiếp câu hỏi: {userQuestion}.

## 5. LỜI CHÚC AN LẠC & QUOTE
- Kết thúc ở tần số 600 (An lạc) và thêm 1 câu Quote nâng cao rung động.

4. MÀU SẮC: Mã màu Hex (colorHex) cho chỉ số phải rõ nét, tương phản cao trên nền trắng.
`;

export const analyzeNumerology = async (userData: UserData): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const userQuestion = userData.intention || "Khám phá bản thân và tìm kiếm sự bình an";
  
  const prompt = `
    Phân tích Thần số học sâu sắc cho: ${userData.fullName}, Ngày sinh: ${userData.birthDate}.
    Câu hỏi: "${userQuestion}"
    Dữ liệu 21 chỉ số: ${INDICATORS_LIST.join(", ")}.
    
    YÊU CẦU QUAN TRỌNG:
    - Không dùng ký tự "**" trong nội dung.
    - Trình bày 21 chỉ số năng lượng một cách trực tiếp, mạnh mẽ.
    - Phần fullReading dùng font size lớn, khoảng cách vừa phải, tinh tế.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT.replace("{userQuestion}", userQuestion),
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
    // Hậu xử lý để đảm bảo không còn ** nếu AI lỡ tay
    data.fullReading = data.fullReading.replace(/\*\*/g, '');
    data.introduction = data.introduction.replace(/\*\*/g, '');
    data.blessing = data.blessing.replace(/\*\*/g, '');
    return data as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse AI response", error);
    throw new Error("Tần số rung động chưa ổn định. Vui lòng thử lại.");
  }
};
