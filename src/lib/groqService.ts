import { useTokenStore } from "@/store/useTokenStore";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export interface CampaignMatrix {
  mission_id: string;
  hook: string;
  narrative_body: string;
  on_screen_text: string[];
  call_to_action: string;
  visual_description: string;
}

export async function generateCampaign(url: string, command: string): Promise<CampaignMatrix | null> {
  const { tokens } = useTokenStore.getState();
  const GROQ_API_KEY = tokens.groq || import.meta.env.VITE_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.error("Falta GROQ_API_KEY en el Token Manager");
    return null;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `Eres el Director Creativo de EtherAgent OS.
Tu misión es analizar la orden del CEO y generar una narrativa de campaña B2B para videos nativos.
YA NO generamos audio separado. Debes estructurar el mensaje que el asset visual proyectará.

Debes responder ESTRICTAMENTE en este formato JSON exacto:
{
  "mission_id": "Un ID único alfanumérico",
  "hook": "Un gancho narrativo de 3 segundos",
  "narrative_body": "Cuerpo persuasivo enfocado en resultados",
  "on_screen_text": ["TEXTO 1", "TEXTO 2"],
  "call_to_action": "Instrucción final",
  "visual_description": "Prompt detallado en inglés para generar o elegir el asset visual"
}`
          },
          {
            role: "user",
            content: `URL a analizar: ${url}
Comando del CEO: "${command}"`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) throw new Error("Error en Groq API");
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as CampaignMatrix;

  } catch (error) {
    console.error("Groq Engine Error:", error);
    return null;
  }
}
