import { GoogleGenerativeAI } from "@google/generative-ai";
import { useTokenStore } from "@/store/useTokenStore";

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
        console.warn("⚠️ GEMINI_API_KEY no encontrada. Configúrala en el Token Manager.");
        // Retornamos un Mock para que la app no se rompa mientras pones la llave
        return {
            mission_id: "CMP-884",
            hook: "He detectado la esencia de la marca. El algoritmo predictivo indica que este gancho generará una retención del 87%.",
            narrative_body: "He procesado la gráfica de Autoridad. El copy ataca el dolor de las agencias. El A/B test marca un CPA un 40% más bajo.",
            on_screen_text: ["STOP SCROLLING", "ROI x10", "LINK IN BIO"],
            call_to_action: "Solicita tu Demo",
            visual_description: "Cinematic, high-end corporate cyberpunk, glowing neon, hyper-realistic, 8k resolution --ar 16:9"
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        // Usamos gemini-2.0-flash para máximo rendimiento y latencia mínima
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
        const cleanedText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

        return JSON.parse(cleanedText) as CampaignWorkspace;

    } catch (error) {
        console.error("Gemini Engine Error:", error);
        return null;
    }
}
