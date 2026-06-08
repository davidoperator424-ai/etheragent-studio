export interface OnboardingMessage {
  id: number;
  sender: string;
  text: string;
  audioFile: string;
  delayMs: number;
}

export interface ProductionPrompts {
  visualPrompt: string;
  audioPrompt: string;
  voiceProfile: string;
}

export interface SocialLabMessage {
  id: number;
  sender: string;
  text: string;
  audioFile?: string;
  delayMs: number;
}

export interface FinalAsset {
  videoUrl: string;
  thumbnailUrl: string;
  costTokens: number;
}

export interface CampaignMeta {
  missionId: string;
  brand: string;
  targetAudience: string;
  archetype: string;
  painPoint: string;
}

export interface CampaignZeroData {
  meta: CampaignMeta;
  onboardingSequence: OnboardingMessage[];
  productionPrompts: ProductionPrompts;
  socialLabSequence: SocialLabMessage[];
  oohSequence: OnboardingMessage[];
  commercialSequence: OnboardingMessage[];
  finalAsset: FinalAsset;
}

export const CAMPAIGN_ZERO_DATA: CampaignZeroData = {
  meta: {
    missionId: "DEMO_CERO_001",
    brand: "EtherAgent OS",
    targetAudience: "Agencias Tradicionales ydueños de E-commerce",
    archetype: "PERFORMANCE_SATIRE_BRO",
    painPoint: "Quema de presupuesto en Ads, ROAS negativo, fatiga de creativos.",
  },
  
  onboardingSequence: [
    {
      id: 1,
      sender: "Marcus",
      text: "Autenticación biométrica confirmada. Bienvenido a la matriz de mando, CEO David. Soy Marcus, tu Director de Estrategia Analítica. Los sistemas están en verde. ¿Qué imperio vamos a escalar hoy? Define el objetivo.",
      audioFile: "/audio/agents/marcus_welcome.mp3",
      delayMs: 1000
    },
    {
      id: 2,
      sender: "David",
      text: "Marcus, vamos a lanzar la Campaña Cero para nuestra propia marca: EtherAgent OS. Quiero atacar a las agencias tradicionales y dueños de E-commerce que queman presupuesto en Ads. Usa el arquetipo de los pavos llorando por el ROAS.",
      audioFile: "/audio/agents/david_prompt.mp3",
      delayMs: 15000
    },
    {
      id: 3,
      sender: "Marcus",
      text: "Directiva aceptada, David. Dolor identificado: Fatiga de creativos y ROAS negativo. Arquetipo: Sátira Aviar B2B. Estructurando prompts de ingeniería. Derivando comandos a las Matrices de Producción.",
      audioFile: "/audio/agents/marcus_processing.mp3",
      delayMs: 30000
    }
  ],

  productionPrompts: {
    visualPrompt: "[SCENE_1: WIDE SHOT, HANDHELD CAMERA STYLE] Point of view of a pedestrian walking in Times Square at night. Raining, wet asphalt reflecting neon lights. In the middle of the street, two hyper-realistic humanoid turkeys in expensive Wall Street suits are looking up at the billboards...",
    audioPrompt: "Hermano... el ROAS está en 0.2. Quemamos 10 mil dólares en TikTok Ads y solo vendimos tres fundas. Zuckerberg nos está desplumando, bro. ¡Glu-glu!",
    voiceProfile: "Tech-Bro Sarcastic (Gonzalo/Jorge Pitch Modified)"
  },

  socialLabSequence: [
    {
      id: 1,
      sender: "Valeria",
      text: "Recibido, Marcus. Hola, David. Aquí la gestora de crecimiento. Tomando el render de los pavos y el audio quejumbroso. Aplicando cortes dinámicos, música Phonk de fondo y subtítulos de retención verde neón. Inyectando activo final en tu dispositivo de previsualización en 3... 2... 1...",
      audioFile: "valeria_social_1.mp3",
      delayMs: 2000
    },
    {
      id: 2,
      sender: "Valeria",
      text: "Campaña Cero lista para dominar TikTok y Reels, CEO. Despliegue completado. Costo operativo: 0 Tokens (Cortesía de la casa). Tienes 1500 Tokens intactos. El teclado es tuyo.",
      audioFile: "valeria_social_2.mp3",
      delayMs: 18000
    }
  ],

  oohSequence: [
    { 
      id: 1, 
      sender: "Kaelen", 
      text: "Iniciando dominación espacial en Manhattan. Desplegando holograma táctico en Times Square. Los arquetipos aviares han sido neutralizados por nuestra compra programática.", 
      audioFile: "/audio/agents/kaelen_ooh_zero.mp3",
      delayMs: 2000 
    }
  ],
  commercialSequence: [
    { 
      id: 1, 
      sender: "Viktor", 
      text: "Analizando rebote en página de precios. En los últimos 3 minutos, tus competidores redujeron su CAC en un 42%. La indecisión es tu impuesto más caro. Video Sales Letter de retargeting inyectado con éxito.", 
      audioFile: "/audio/agents/viktor_commercial_zero.mp3",
      delayMs: 2000 
    }
  ],
  
  finalAsset: {
    videoUrl: "https://njhifpbnrbbhbmwgedtz.supabase.co/storage/v1/object/public/visual-assets/social_video_reel-1773586630821.mp4",
    thumbnailUrl: "",
    costTokens: 0
  }
};
