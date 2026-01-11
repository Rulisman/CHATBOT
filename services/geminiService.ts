
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

  // Verificación de similitud básica (exacta o contenida) para evitar latencia de algoritmos complejos
  return last === secondLast || 
         (last.length > 10 && (last.includes(secondLast) || secondLast.includes(last)));
};

export const sendMessageStreamToGemini = async function* (
  messages: Message[],
  knowledgeBase: KnowledgeFile[],
  masterPrompt: string
) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  // Optimizamos el string de contexto
  const contextString = knowledgeBase.length > 0 
    ? "\nDATOS CAMPING:\n" + knowledgeBase.map(f => `[${f.name}]: ${f.content}`).join("\n")
    : "";

  // Detección de repetición para ajustar el comportamiento
  const isRepeating = checkUserRepetition(messages);
  const antiRepetitionInstruction = isRepeating 
    ? "\nAVISO: El usuario está repitiendo su pregunta. NO repitas tu respuesta anterior. Sé más conciso, ofrece un enfoque distinto o pregunta qué detalle específico falta por aclarar."
    : "";

  // Instrucciones compactas para latencia mínima
  const systemInstruction = `
    ${masterPrompt || 'Asistente de camping.'}
    REGLAS: Frases cortas. Doble salto de línea entre párrafos. Máximo 2 emojis. Responde en el idioma del usuario. ${antiRepetitionInstruction}
    ${contextString}
  `;

  const contents = messages.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction,
        temperature: isRepeating ? 0.8 : 0.6, // Subimos ligeramente la temperatura si repite para variar la respuesta
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
    console.error("Gemini Streaming Error:", error);
    throw error;
  }
};
