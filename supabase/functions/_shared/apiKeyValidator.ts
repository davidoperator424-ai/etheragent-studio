// supabase/functions/_shared/apiKeyValidator.ts
// Validador de API keys en runtime

export interface ValidationResult {
  valid: boolean;
  error?: string;
  service?: string;
}

const REQUIRED_KEYS: Record<string, string> = {
  'marcus-orchestrator': 'GROQ_API_KEY',
  'analyze': 'GOOGLE_API_KEY',
  'agents': 'GOOGLE_API_KEY',
  'generate-avatar': 'GOOGLE_API_KEY',
};

export function validateApiKey(functionName: string): ValidationResult {
  const requiredKey = REQUIRED_KEYS[functionName];
  
  if (!requiredKey) {
    return { valid: true };
  }
  
  const apiKey = Deno.env.get(requiredKey);
  
  if (!apiKey) {
    return {
      valid: false,
      error: `API key not configured: ${requiredKey}. Please set it in Supabase secrets.`,
      service: requiredKey,
    };
  }
  
  if (apiKey.startsWith('your-') || apiKey.startsWith('sk_placeholder')) {
    return {
      valid: false,
      error: `Invalid API key format for ${requiredKey}. Please configure a real key.`,
      service: requiredKey,
    };
  }
  
  return { valid: true, service: requiredKey };
}

export function logApiKeyStatus() {
  console.log('🔐 API Keys Status:');
  
  for (const [key, value] of Object.entries(REQUIRED_KEYS)) {
    const apiKey = Deno.env.get(value);
    const status = apiKey ? (apiKey.startsWith('your-') ? '⚠️ placeholder' : '✅ configured') : '❌ missing';
    console.log(`  ${value}: ${status}`);
  }
}
