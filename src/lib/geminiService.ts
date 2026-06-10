import { GoogleGenerativeAI } from "@google/generative-ai";
import { useTokenStore } from "@/store/useTokenStore";
import { generateCampaign } from "./groqService";

export interface CampaignWorkspace {
    mission_id: string;
    hook: string;
    narrative_body: string;
    on_screen_text: string[];
    call_to_action: string;
    visual_description: string;
}

export async function generateWorkspaceCampaign(brandOrUrl: string): Promise<CampaignWorkspace | null> {
    const { tokens } = useTokenStore.getState();
    const GEMINI_API_KEY = tokens.gemini || import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        const groqResult = await generateCampaign(brandOrUrl, "Analiza esta URL y genera una campaña B2B");
        if (groqResult) return groqResult;
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Eres el Director Creativo Supremo de EtherAgent OS. 
    Tu objetivo es estructurar una narrativa de campaña B2B de alto impacto para: "${brandOrUrl}".
    YA NO generamos guiones para voz artificial separada; ahora operamos con videos nativos.
    
    Tu respuesta debe ser UNICAMENTE un objeto JSON válido con esta estructura exacta:
    {
      "mission_id": "Un ID único alfanumérico",
      "hook": "Un gancho narrativo de 3 segundos para captar atención inmediata",
      "narrative_body": "El cuerpo del mensaje persuasivo enfocado en ROI y dolor del cliente",
      "on_screen_text": ["TEXTO 1", "TEXTO 2", "TEXTO 3"],
      "call_to_action": "Una instrucción clara de cierre",
      "visual_description": "Un prompt detallado en inglés para generar o seleccionar el video nativo ideal (especifica iluminación, encuadre, estilo cinemático)."
    }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Limpiamos el texto por si Gemini devuelve markdown (\`\`\`json ...)
        const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText) as CampaignWorkspace;

    } catch (error) {
        console.error("Gemini Engine Error:", error);
        return null;
    }
}
