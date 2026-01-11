import { GoogleGenAI } from "@google/genai";
import { Message, KnowledgeFile } from "../types";

/**
 * Función auxiliar para detectar si el usuario está repitiendo una consulta similar.
 */
const checkUserRepetition = (messages: Message[]): boolean => {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length < 2) return false;

  const last = userMessages[userMessages.length - 1].text.toLowerCase().trim();
  const secondLast = userMessages[userMessages.length - 2].text.toLowerCase().trim();

  return last === secondLast || 
         (last.length > 10 && (last.includes(secondLast) || secondLast.includes(last)));
};

export const sendMessageStreamToGemini = async function* (
  messages: Message[],
  knowledgeBase: KnowledgeFile[],
  masterPrompt: string
) {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const contextString = knowledgeBase.length > 0 
    ? "\nDATOS CAMPING:\n" + knowledgeBase.map(f => `[${f.name}]: ${f.content}`).join("\n")
    : "";

  const isRepeating = checkUserRepetition(messages);
  const antiRepetitionInstruction = isRepeating 
    ? "\nAVISO: El usuario está repitiendo su pregunta. NO repitas tu respuesta anterior. Sé más conciso o pregunta qué detalle falta."
    : "";

  const systemInstruction = `
    ${masterPrompt || 'Asistente de camping.'}
    REGLAS: Frases cortas. Máximo 2 emojis. Responde en el idioma del usuario. ${antiRepetitionInstruction}
    ${contextString}
  `;

  // IMPORTANTE: El historial DEBE empezar con un mensaje de 'user'.
  // Filtramos cualquier mensaje de 'model' que esté al inicio del array.
  const firstUserIndex = messages.findIndex(m => m.role === 'user');
  const validMessages = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

  const contents = validMessages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction,
        temperature: isRepeating ? 0.8 : 0.6,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};