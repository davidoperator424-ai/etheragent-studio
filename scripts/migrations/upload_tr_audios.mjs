import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const audiosDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop', 'audios_etheragent');

// Only the 4 TR audios that need to be re-uploaded
const audioMap = [
    { file: 'tr_hub.mp3', id: 'tr_hub', agent_id: 'marcus', script_text: 'Sistemas en línea. Bienvenido al motor de compilación neuronal de EtherAgent OS. La estrategia ha sido trazada y los vectores están listos. Transfiriendo el control a los laboratorios especializados.' },
    { file: 'tr_social.mp3', id: 'tr_social', agent_id: 'valeria', script_text: 'Vector de retención optimizado. He procesado la gráfica estática y el asset de video. El algoritmo predictivo indica un 87% de retención en los primeros tres segundos. El copy ataca directamente el dolor de las agencias tradicionales. Compilación lista.' },
    { file: 'tr_ooh.mp3', id: 'tr_ooh', agent_id: 'viktor', script_text: 'Inventario digital asegurado en el nodo Neo-Shibuya. El asset panorámico está en caché. Desplegando holograma a escala urbana para dominar el espacio visual. Contraste al máximo.' },
    { file: 'tr_commercial.mp3', id: 'tr_commercial', agent_id: 'kaelen', script_text: 'Video Sales Letter de treinta segundos compilado. Formato óptimo para Meta y LinkedIn. He construido una narrativa de valor que cierra con autoridad. El spot está listo para el despliegue masivo en la red.' },
    // E-Commerce Mission Audios
    { file: 'eco_hub.mp3', id: 'tr_ecommerce_hub', agent_id: 'marcus', script_text: "Conexión a Shopify confirmada. Arquetipo 'NeuroBoost' extraído. Vector principal: Rendimiento Z. Estrategia de lanzamiento omnicanal iniciada." },
    { file: 'eco_social.mp3', id: 'tr_ecommerce_social', agent_id: 'valeria', script_text: "150 hooks sintetizados. El formato 'unboxing caótico' proyecta 87 por ciento de retención. Costo por clic aplastado a cero punto doce centavos. Compilando Kinesia para Reels." },
    { file: 'eco_ooh.mp3', id: 'tr_ecommerce_ooh', agent_id: 'viktor', script_text: "Inventario físico asegurado en 40 paradas universitarias. Códigos QR dinámicos en caché. Desplegando holograma táctico para tráfico peatonal." },
    { file: 'eco_commercial.mp3', id: 'tr_ecommerce_commercial', agent_id: 'kaelen', script_text: "Tráfico orgánico colapsando. Video Sales Letter de retargeting desplegado para carritos abandonados. Retorno de inversión en 4 punto 8 x. Misión cumplida." },
    // SaaS Mission Audios
    { file: 'saas_hub.mp3', id: 'tr_saas_hub', agent_id: 'marcus', script_text: "Protocolo B2B Enterprise activado. Target: Directores Financieros. Extrayendo puntos de dolor sobre costos operativos de la nube." },
    { file: 'saas_social.mp3', id: 'tr_saas_social', agent_id: 'valeria', script_text: "Píldoras de autoridad compiladas para LinkedIn. Guiones generados para avatares ejecutivos. Mensaje central: Reducción de costos en un 40 por ciento." },
    { file: 'saas_ooh.mp3', id: 'tr_saas_ooh', agent_id: 'viktor', script_text: "Hackeando circuito visual del distrito financiero. Pantallas de aeropuertos VIP sincronizadas con mensaje de ROI. Impacto B2B asegurado." },
    { file: 'saas_commercial.mp3', id: 'tr_saas_commercial', agent_id: 'kaelen', script_text: "Spot documental generado. Embudo de conversión directa a agenda de Calendly activo. Flujo de leads High-Ticket estable." },
    // Fintech Mission Audios
    { file: 'fin_hub.mp3', id: 'tr_fintech_hub', agent_id: 'marcus', script_text: "Vector de adquisición Fintech en línea. Presupuesto agresivo confirmado. Optimizando Costo de Adquisición de Usuario." },
    { file: 'fin_social.mp3', id: 'tr_fintech_social', agent_id: 'valeria', script_text: "Programa de referidos inyectado en Meta Ads. Gráficas de confianza y tarjetas metálicas renderizadas. Fricción de registro eliminada." },
    { file: 'fin_ooh.mp3', id: 'tr_fintech_ooh', agent_id: 'viktor', script_text: "Vallas panorámicas reservadas en avenidas principales. La omnipresencia física genera confianza bancaria. Despliegue masivo." },
    { file: 'fin_commercial.mp3', id: 'tr_fintech_commercial', agent_id: 'kaelen', script_text: "Spot de prueba social compilado con testimonios sintéticos. Tasa de apertura de cuentas un 300 por ciento superior al benchmark. Dominio financiero." },
    // Web3 Mission Audios
    { file: 'web3_hub.mp3', id: 'tr_web3_hub', agent_id: 'marcus', script_text: "Protocolo de ingeniería social activado. Analizando sentimiento en Discord y X. Vector de campaña: Caos controlado y exclusividad FOMO." },
    { file: 'web3_social.mp3', id: 'tr_web3_social', agent_id: 'valeria', script_text: "Ejército orgánico desplegado. Filtrando accidentalmente el whitepaper del airdrop. Viralidad y especulación en aumento crítico." },
    { file: 'web3_ooh.mp3', id: 'tr_web3_ooh', agent_id: 'viktor', script_text: "Pantallas en estaciones de metro parpadeando con coordenadas secretas. Cuenta regresiva holográfica sincronizada globalmente." },
    { file: 'web3_commercial.mp3', id: 'tr_web3_commercial', agent_id: 'kaelen', script_text: "Tráiler cinemático renderizado. Caída de servidores por exceso de tráfico calculada. Sold out de la colección proyectado en 4 minutos." },
];

async function uploadAudios() {
    console.log("🦅 RESUBIENDO AUDIOS DE LA DEMO...\n");

    for (const entry of audioMap) {
        const filePath = path.join(audiosDir, entry.file);

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Archivo no encontrado: ${filePath}. Saltando...`);
            continue;
        }

        try {
            console.log(`📦 Subiendo ${entry.file} → ${entry.id}...`);
            const fileBuffer = fs.readFileSync(filePath);

            // Upload to Storage (bucket 'system-audio')
            const { error: uploadError } = await supabase.storage
                .from('system-audio')
                .upload(`${entry.id}.mp3`, fileBuffer, {
                    contentType: 'audio/mpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('system-audio')
                .getPublicUrl(`${entry.id}.mp3`);

            // Update DB via REST
            const res = await fetch(`${supabaseUrl}/rest/v1/system_scripts`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    id: entry.id,
                    agent_id: entry.agent_id,
                    script_text: entry.script_text,
                    audio_url: publicUrl,
                    updated_at: new Date().toISOString()
                })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            console.log(`✅ ${entry.id} resubido! URL: ${publicUrl}\n`);

        } catch (error) {
            console.error(`❌ Error con ${entry.file}:`, error.message, '\n');
        }
    }

    console.log("🔥 OPERACIÓN COMPLETADA.");
}

uploadAudios();
