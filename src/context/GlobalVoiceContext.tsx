import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// API Key de Groq desde variables de entorno
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Tipado del Contexto
interface VoiceContextType {
    isListening: boolean;
    isAwake: boolean;       // Wake Word detectada — modo activo
    isProcessing: boolean;
    transcript: string;
    agentResponse: string;
    startListening: () => void;
    stopListening: () => void;
}

// Tipado de la respuesta del LLM
interface LLMRouterResponse {
    route: string | null;
    speech: string;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// El Prompt Maestro del Sistema (El cerebro semántico de EtherAgent)
const SYSTEM_PROMPT = `
Eres el motor de enrutamiento semántico de EtherAgent OS.
Tu única función es analizar lo que dice el CEO y decidir a qué pantalla de la plataforma enviarlo y qué debe responder el sistema en voz alta.

RUTAS VÁLIDAS Y SU CONTEXTO:
- "/nexus" : Inicio, panel principal, escáner de marca, dashboard central.
- "/social" : Laboratorio social, redes sociales, TikTok, Instagram, Valeria, campañas.
- "/commercial-matrix" : Matriz comercial, anuncios de video, render cinemático, Sora, videos.
- "/commercial" : Laboratorio de anuncios comerciales, ad lab.
- "/visual-matrix" : Matriz visual, imágenes estáticas, Midjourney, assets gráficos.
- "/ooh" : Metaverso, vallas publicitarias virtuales, Viktor, out-of-home.
- "/sonic" : Anuncios de radio, Spotify, Aria, música, jingles.
- "/ads" : Performance ads, Kaelen, campañas de rendimiento, Google Ads, Meta Ads.
- "/telemetry" : Telemetría, métricas, estadísticas, KPIs, analytics.
- "/templates" : Plantillas, bóveda de plantillas, templates.
- "/influencers" : Roster de influencers, creadores, avatares.
- "/spaces" : System Spaces, espacios del sistema.
- "/engine" : Motor de inteligencia, intelligence engine.
- "/pricing" : Planes, precios, suscripciones.
- "/deployment" : Despliegue, deployment, lanzamiento.
- "/exchange" : Exchange global, intercambio.

REGLAS ESTRICTAS:
1. Si el usuario pide ir a un lugar, asigna la ruta correspondiente.
2. Si el usuario solo saluda o hace una pregunta conversacional, la ruta debe ser null.
3. La respuesta ("speech") debe ser corta, sobria, con tono B2B de alta tecnología (máximo 15 palabras).
4. DEBES responder ÚNICAMENTE con un objeto JSON válido. Nada de texto adicional.

FORMATO JSON ESPERADO:
{
  "route": "/ruta-elegida" | null,
  "speech": "Texto exacto que dirá la voz sintética."
}
`.trim();

// Variantes fonéticas de "Ether" en reconocimiento de voz en español
const WAKE_WORDS = ['ether', 'éter', 'eder', 'ider', 'éther', 'iter', 'either'];

export function VoiceProvider({ children }: { children: ReactNode }) {
    const [isListening, setIsListening] = useState(false);
    const [isAwake, setIsAwake] = useState(false);       // Wake Word — ¿Escuchó "Ether"?
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [agentResponse, setAgentResponse] = useState('');
    const navigate = useNavigate();
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const processingRef = useRef(false);

    // Referencias para el escudo Anti-Spam (Rate Limiting)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isAwakeRef = useRef(false);

    // Mantener isAwakeRef sincronizado con el estado
    useEffect(() => {
        isAwakeRef.current = isAwake;
    }, [isAwake]);

    // Ejecución y Respuesta de Voz Sintética
    const executeAction = useCallback((route: string | null, speechText: string) => {
        setIsProcessing(false);
        setAgentResponse(speechText);

        if (route) {
            navigate(route);
        }

        // TTS (Text-to-Speech) usando la API nativa del navegador
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = 'es-ES';
        utterance.pitch = 0.9;
        utterance.rate = 1.0;

        utterance.onend = () => {
            setAgentResponse('');
            setTranscript('');
        };

        window.speechSynthesis.speak(utterance);
    }, [navigate]);

    // FALLBACK: Enrutador por keywords (cuando no hay API key o falla la conexión)
    const processCommandFallback = useCallback((text: string): boolean => {
        const lower = text.toLowerCase();
        if (lower.includes('abre nexus') || lower.includes('ir al inicio') || lower.includes('panel principal')) {
            executeAction('/nexus', 'Abriendo el Nexus Central. Todos los sistemas en línea.');
            return true;
        }
        if (lower.includes('abre social lab') || lower.includes('vamos a redes') || lower.includes('laboratorio social')) {
            executeAction('/social', 'Abriendo el laboratorio social, señor.');
            return true;
        }
        if (lower.includes('modo comercial') || lower.includes('crear anuncio de video') || lower.includes('matriz comercial')) {
            executeAction('/commercial-matrix', 'Iniciando matriz de video comercial. Listo para compilar.');
            return true;
        }
        if (lower.includes('desplegar valla') || lower.includes('metaverso') || lower.includes('vallas virtuales')) {
            executeAction('/ooh', 'Conectando con nodos del metaverso. Arquitecto Viktor en línea.');
            return true;
        }
        if (lower.includes('anuncios') || lower.includes('performance') || lower.includes('campañas de rendimiento')) {
            executeAction('/ads', 'Cargando laboratorio de anuncios de rendimiento.');
            return true;
        }
        if (lower.includes('imágenes') || lower.includes('visual matrix') || lower.includes('assets visuales')) {
            executeAction('/visual-matrix', 'Iniciando la Matriz Visual. Generador de assets activado.');
            return true;
        }
        if (lower.includes('sonic') || lower.includes('música') || lower.includes('laboratorio sónico')) {
            executeAction('/sonic', 'Sincronizando frecuencias. Sonic Lab en línea.');
            return true;
        }
        if (lower.includes('telemetría') || lower.includes('métricas') || lower.includes('estadísticas')) {
            executeAction('/telemetry', 'Desplegando telemetría activa. Datos en tiempo real.');
            return true;
        }
        if (lower.includes('plantillas') || lower.includes('templates') || lower.includes('bóveda')) {
            executeAction('/templates', 'Accediendo a la bóveda de plantillas.');
            return true;
        }
        return false;
    }, [executeAction]);

    // EL ENRUTADOR SEMÁNTICO (LLM ORCHESTRATOR via Groq)
    const processCommand = useCallback(async (text: string) => {
        // Evitar procesamiento duplicado (Mutex Lock)
        if (processingRef.current) return;
        processingRef.current = true;

        // Si no hay API key de Groq, usar fallback por keywords
        if (!GROQ_API_KEY) {
            console.warn('[OmniAgent] Sin GROQ API Key, usando enrutamiento por keywords.');
            processCommandFallback(text);
            processingRef.current = false;
            return;
        }

        setIsProcessing(true);   // Bloqueamos nuevas peticiones (Mutex Lock)
        setIsListening(false);   // Apagamos el mic temporalmente

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: text },
                    ],
                    temperature: 0.1,
                    max_tokens: 150,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[OmniAgent] Groq API Error:', response.status, errorData);
                throw new Error(`Groq API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('Respuesta vacía del LLM');
            }

            let llmResponse: LLMRouterResponse;
            try {
                llmResponse = JSON.parse(content);
            } catch {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    llmResponse = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No se pudo parsear la respuesta del LLM');
                }
            }
            console.log('[OmniAgent] 🧠 LLM Response:', llmResponse);

            executeAction(llmResponse.route, llmResponse.speech);
        } catch (error) {
            console.error('[OmniAgent] Fallo en la sinapsis del enrutador:', error);

            // Fallback: intentar con keywords si el LLM falla
            const handled = processCommandFallback(text);
            if (!handled) {
                executeAction(null, 'Saturación en los nodos cognitivos. Por favor, repita la orden.');
            }
        } finally {
            processingRef.current = false;
            setIsAwake(false); // El agente vuelve a dormir tras ejecutar
        }
    }, [executeAction, processCommandFallback]);

    // =====================================================================
    // INICIALIZACIÓN DEL MICRÓFONO + WAKE WORD + ESCUDO ANTI-SPAM
    // =====================================================================
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            console.warn('[OmniAgent] Tu navegador no soporta Web Speech API. Usa Chrome o Edge.');
            return;
        }

        if (isListening) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                // CAPA 1: Si Groq está pensando, ignoramos el audio
                if (processingRef.current) return;

                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    currentTranscript += event.results[i][0].transcript;
                }

                const textNormalizado = currentTranscript.toLowerCase();

                // ──────────────────────────────────────────────
                // FASE 1: ESCUCHA PASIVA (WAKE WORD DETECTION)
                // ──────────────────────────────────────────────
                if (!isAwakeRef.current) {
                    const wakeWordDetected = WAKE_WORDS.some(w => textNormalizado.includes(w));

                    if (wakeWordDetected) {
                        console.log('[OmniAgent] 🔊 Wake Word detectada! Activando modo activo.');
                        setIsAwake(true);
                        setTranscript('EtherOS en línea...');

                        // Feedback de audio rápido (Latencia cero)
                        const ack = new SpeechSynthesisUtterance('A la escucha.');
                        ack.lang = 'es-ES';
                        ack.pitch = 0.9;
                        ack.rate = 1.1;
                        window.speechSynthesis.speak(ack);
                    }
                    return; // No enviamos NADA a Groq en modo pasivo
                }

                // ──────────────────────────────────────────────
                // FASE 2: ESCUCHA ACTIVA (COMANDO PARA GROQ)
                // ──────────────────────────────────────────────

                // Limpiar la wake word del texto para no enviarla como parte del comando
                let cleanedText = currentTranscript;
                for (const w of WAKE_WORDS) {
                    cleanedText = cleanedText.replace(new RegExp(w, 'gi'), '').trim();
                }

                setTranscript(cleanedText || currentTranscript);

                // --- ESCUDO ANTI-SPAM (DEBOUNCE 1.5s) ---
                if (debounceRef.current) clearTimeout(debounceRef.current);

                // CAPA 3: Filtro de ruido — mínimo 5 caracteres
                if (cleanedText.trim().length > 5) {
                    // Esperamos 1.5 segundos de silencio antes de enviar a Groq
                    debounceRef.current = setTimeout(() => {
                        console.log('[OmniAgent] 🎯 Comando capturado tras 1.5s de silencio:', cleanedText.trim());
                        processCommand(cleanedText.trim());
                        debounceRef.current = null;
                    }, 1500);
                }
            };

            recognition.onerror = (event: Event & { error: string }) => {
                console.error('[OmniAgent] Error de micrófono:', event.error);
                // No apagamos por "no-speech" (silencio normal es esperado en modo pasivo)
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setIsListening(false);
                    setIsAwake(false);
                    setIsProcessing(false);
                }
            };

            recognition.onend = () => {
                // Auto-restart si todavía debería estar escuchando
                if (recognitionRef.current === recognition) {
                    try {
                        recognition.start();
                    } catch {
                        // Ya está corriendo o fue detenido intencionalmente
                    }
                }
            };

            recognitionRef.current = recognition;

            try {
                recognition.start();
                console.log('[OmniAgent] 🎙️ Escucha pasiva activada — Esperando Wake Word "Ether"...');
            } catch (e) {
                console.error('[OmniAgent] No se pudo iniciar el reconocimiento:', e);
            }

            return () => {
                recognitionRef.current = null;
                if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                }
                try {
                    recognition.stop();
                } catch {
                    // Silenciar errores al detener
                }
            };
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Silenciar
                }
                recognitionRef.current = null;
            }
            setIsAwake(false);
        }
    }, [isListening, processCommand]);

    const startListening = useCallback(() => setIsListening(true), []);
    const stopListening = useCallback(() => {
        setIsListening(false);
        setIsProcessing(false);
        setIsAwake(false);
    }, []);

    return (
        <VoiceContext.Provider value={{ isListening, isAwake, isProcessing, transcript, agentResponse, startListening, stopListening }}>
            {children}
        </VoiceContext.Provider>
    );
}

export const useVoice = () => {
    const context = useContext(VoiceContext);
    if (!context) throw new Error('useVoice debe usarse dentro de un VoiceProvider');
    return context;
};
