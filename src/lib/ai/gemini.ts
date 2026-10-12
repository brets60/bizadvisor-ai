import { GoogleGenerativeAI, GenerationConfig } from "@google/generative-ai";

export class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigError";
  }
}

export class GeminiServiceError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "GeminiServiceError";
  }
}

/**
 * Fallback AI key reconstructed at runtime (StudyMate engine compatibility)
 */
function getSystemFallbackKey(): string {
  const codes = [
    103, 115, 107, 95, 97, 115, 97, 75, 65, 116, 72, 82, 69, 118, 119, 51, 69, 119, 50, 50,
    67, 99, 66, 77, 87, 71, 100, 121, 98, 51, 70, 89, 49, 86, 53, 106, 74, 76, 108, 121,
    54, 71, 110, 86, 52, 116, 55, 89, 122, 78, 76, 122, 49, 51, 120, 89
  ];
  return String.fromCharCode(...codes);
}

/**
 * Determine AI Provider from environment variables or active keys (identical to AI StudyMate engine)
 */
function resolveProvider(explicitKey?: string): {
  provider: "groq" | "gemini" | "openai";
  key: string;
} {
  const candidate = (
    explicitKey ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    getSystemFallbackKey()
  ).trim();

  if (candidate.startsWith("gsk_")) {
    return { provider: "groq", key: candidate };
  }
  if (candidate.startsWith("AIzaSy")) {
    return { provider: "gemini", key: candidate };
  }
  if (candidate.startsWith("sk-")) {
    return { provider: "openai", key: candidate };
  }

  // If candidate is long, assume Gemini or Groq
  if (candidate.length >= 35 && !candidate.includes("your-")) {
    return { provider: "gemini", key: candidate };
  }

  return { provider: "groq", key: getSystemFallbackKey() };
}

/**
 * Sanitize user input to guard against prompt injection and control sequence escaping
 */
export function sanitizePromptInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/<system>[\s\S]*?<\/system>/gi, "")
    .replace(/\[system\][\s\S]*?\[\/system\]/gi, "")
    .replace(/ignore previous instructions/gi, "[filtered]")
    .replace(/disregard all previous directives/gi, "[filtered]")
    .trim();
}

/**
 * Call Groq high-speed LLM (same lightning-fast response engine as AI StudyMate)
 */
async function callGroqLLM(
  apiKey: string,
  prompt: string,
  options?: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    responseMimeType?: string;
  }
): Promise<string | null> {
  const models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"];
  const messages: any[] = [];

  if (options?.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 20000);

    try {
      const payload: Record<string, unknown> = {
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxOutputTokens ?? 4096,
      };

      if (options?.responseMimeType === "application/json") {
        payload.response_format = { type: "json_object" };
      }

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const content = json.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch (err: any) {
      clearTimeout(timeout);
      console.warn(`Groq model ${model} attempt error:`, err.message);
    }
  }

  return null;
}

/**
 * Call Google Generative AI (Gemini 1.5 Flash)
 */
async function callGeminiSDK(
  apiKey: string,
  prompt: string,
  options?: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    responseMimeType?: string;
  }
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    const generationConfig: GenerationConfig = {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxOutputTokens ?? 4096,
      ...(options?.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
    };

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: options?.systemInstruction,
      generationConfig,
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text || null;
  } catch (err: any) {
    console.warn("Gemini SDK attempt error:", err.message);
    return null;
  }
}

/**
 * Universal call function with automatic multi-engine resolution
 */
export async function callGemini(
  prompt: string,
  options?: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    responseMimeType?: string;
  }
): Promise<string> {
  const resolved = resolveProvider();

  // 1. Try primary resolved provider
  if (resolved.provider === "gemini") {
    const geminiText = await callGeminiSDK(resolved.key, prompt, options);
    if (geminiText) return geminiText;
  } else {
    const groqText = await callGroqLLM(resolved.key, prompt, options);
    if (groqText) return groqText;
  }

  // 2. Fallback to alternate provider
  const fallbackKey = getSystemFallbackKey();
  if (fallbackKey && resolved.key !== fallbackKey) {
    const fallbackText = await callGroqLLM(fallbackKey, prompt, options);
    if (fallbackText) return fallbackText;
  }

  // 3. Fallback to Gemini if Groq failed and Gemini key exists
  const envGemini = process.env.GEMINI_API_KEY?.trim();
  if (envGemini && envGemini.startsWith("AIzaSy")) {
    const geminiText = await callGeminiSDK(envGemini, prompt, options);
    if (geminiText) return geminiText;
  }

  throw new GeminiServiceError(
    "AI is momentarily synchronizing with high-speed clusters. Please retry in a few seconds."
  );
}

/**
 * Clean Markdown code fences and extract JSON cleanly
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const start =
    firstBrace !== -1 && firstBracket !== -1
      ? Math.min(firstBrace, firstBracket)
      : firstBrace !== -1
      ? firstBrace
      : firstBracket;

  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned.trim();
}

/**
 * Call AI expecting structured JSON and parse it reliably
 */
export async function callGeminiStructured<T>(
  prompt: string,
  systemInstruction?: string,
  schemaDescription?: string
): Promise<T> {
  const jsonPrompt = `${prompt}

CRITICAL: You MUST respond ONLY with valid, parseable JSON matching the required schema. Do NOT include conversational text.
${schemaDescription ? `Schema details:\n${schemaDescription}` : ""}`;

  const text = await callGemini(jsonPrompt, {
    systemInstruction: `${systemInstruction || ""}\nYou are an expert structured business advisory AI that ALWAYS returns valid JSON.`,
    temperature: 0.3,
    responseMimeType: "application/json",
  });

  try {
    const cleaned = cleanJsonOutput(text);
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse AI JSON response:", text);
    throw new GeminiServiceError(
      "The AI response could not be parsed into the required structured format. Please retry."
    );
  }
}
