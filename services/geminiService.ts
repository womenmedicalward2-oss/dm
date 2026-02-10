
import { GoogleGenAI, Type } from "@google/genai";
import { FoodCategory, FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateFoodItems = async (): Promise<FoodItem[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "จงสร้างรายการอาหาร 10 อย่างสำหรับเกมสอนผู้ป่วยเบาหวาน โดยแบ่งเป็น 'ควรทาน' (Low Glycemic Index, High Fiber) และ 'ควรหลีกเลี่ยง' (High Sugar, Refined Carbs). ขอรายการอาหารที่หลากหลายและเป็นอาหารที่พบเห็นได้บ่อยในประเทศไทย",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "ชื่ออาหารเป็นภาษาไทย" },
            category: { 
              type: Type.STRING, 
              enum: [FoodCategory.RECOMMENDED, FoodCategory.AVOID],
              description: "หมวดหมู่ของอาหาร"
            },
            description: { type: Type.STRING, description: "คำอธิบายสั้นๆ ของอาหาร" },
            reason: { type: Type.STRING, description: "เหตุผลว่าทำไมถึงควรทานหรือควรหลีกเลี่ยงสำหรับคนเป็นเบาหวาน" },
            imagePrompt: { type: Type.STRING, description: "ภาษาอังกฤษ: Simple descriptive prompt for image generation of this food" }
          },
          required: ["name", "category", "description", "reason", "imagePrompt"]
        }
      }
    }
  });

  const rawData = JSON.parse(response.text || "[]");
  return rawData.map((item: any, index: number) => ({
    ...item,
    id: `food-${index}-${Date.now()}`
  }));
};

export const generateFoodImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high quality, appetizing professional food photography of ${prompt}, white background, studio light` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "https://picsum.photos/400/400?text=Food";
  } catch (error) {
    console.error("Image generation failed:", error);
    return `https://picsum.photos/400/400?random=${Math.random()}`;
  }
};
