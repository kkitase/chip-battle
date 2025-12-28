
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const askAI = async (prompt: string, history: {role: 'user'|'model', text: string}[]) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      ...history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: "あなたはGPUとTPUの専門家です。日本人の初心者（大学生や新人エンジニア）に向けて、専門用語を噛み砕いて、親しみやすく解説してください。回答は簡潔にしつつ、具体的なイメージ（例え話）を交えてください。"
    }
  });

  const response = await model;
  return response.text;
};

export const fetchRealWorldCases = async () => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "最新のGoogle検索結果を元に、Google TPUとNVIDIA GPUを実際に採用している実在の企業（Meta, OpenAI, Google, X.ai, Character.ai等）の事例を、TPU事例3つ、GPU事例3つの計6つ挙げてください。各事例について『### 企業名』で見出しを作り、1.用途 2.背景 3.具体的な数値 4.出典URL を含めてください。特に『出典URL』は、その事例のすぐ下に『ソース: [URL]』という形式で必ず個別に記載してください。最後に『TPU vs GPU 比較まとめ表』をMarkdownのテーブル形式で出力してください。",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
