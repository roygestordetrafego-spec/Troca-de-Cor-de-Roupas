
import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStylingTips = async (product: Product): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um consultor de moda de luxo. Dê dicas de estilo curtas e profissionais para o seguinte produto: ${product.name}, feito de ${product.fabric}. A descrição é: ${product.description}. Fale sobre como combinar acessórios, sapatos e ocasiões ideais. Seja breve e sofisticado. Use português do Brasil.`,
      config: {
        temperature: 0.7,
      }
    });

    // Property text directly returns the string output. Do not use response.text()
    return response.text || "Dicas de estilo indisponíveis no momento.";
  } catch (error) {
    console.error("Error fetching styling tips:", error);
    return "Não foi possível carregar dicas de estilo agora.";
  }
};
