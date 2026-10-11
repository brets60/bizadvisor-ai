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

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your-gemini-api-key-here" || apiKey.trim() === "") {
    throw new GeminiConfigError(
      "Gemini API key is not configured. Please provide a valid GEMINI_API_KEY in your server environment (.env.local) to enable real-time AI features."
    );
  }
  return new GoogleGenerativeAI(apiKey);
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
 * Execute Gemini model call with timeout and retry handling
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
  const genAI = getGeminiClient();
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

  const timeoutMs = options?.timeoutMs ?? 30000;
  const maxRetries = 2;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const result = await model.generateContent(prompt);
        clearTimeout(timer);

        const responseText = result.response.text();
        if (!responseText) {
          throw new GeminiServiceError("The AI model returned an empty response. Please try again.");
        }
        return responseText;
      } catch (err: any) {
        clearTimeout(timer);
        if (err.name === "AbortError" || controller.signal.aborted) {
          throw new GeminiServiceError(
            `AI request timed out after ${timeoutMs / 1000} seconds. Please try again with a more concise request.`
          );
        }
        throw err;
      }
    } catch (err: any) {
      lastError = err;
      if (err instanceof GeminiConfigError) {
        throw err;
      }
      // Retry only on transient network or 503/429 errors
      const isTransient =
        err.message?.includes("503") ||
        err.message?.includes("429") ||
        err.message?.includes("fetch failed") ||
        err.message?.includes("Resource exhausted");

      if (attempt < maxRetries && isTransient) {
        // Exponential backoff
        await new Promise((res) => setTimeout(res, (attempt + 1) * 1500));
        continue;
      }
      break;
    }
  }

  const errMessage =
    lastError instanceof Error ? lastError.message : "Unknown error connecting to Gemini API";
  throw new GeminiServiceError(`AI Service Error: ${errMessage}`);
}

/**
 * Call Gemini expecting structured JSON and parse it reliably
 */
export async function callGeminiStructured<T>(
  prompt: string,
  systemInstruction?: string,
  schemaDescription?: string
): Promise<T> {
  const jsonPrompt = `${prompt}

CRITICAL: You MUST respond ONLY with valid, parseable JSON matching the required schema. Do NOT wrap in markdown formatting backticks if possible, or use standard \`\`\`json\`\`\` codeblocks. No intro or outro text.
${schemaDescription ? `Schema details:\n${schemaDescription}` : ""}`;

  const text = await callGemini(jsonPrompt, {
    systemInstruction: `${systemInstruction || ""}\nYou are a structured business AI assistant that ALWAYS returns valid JSON.`,
    temperature: 0.4,
    responseMimeType: "application/json",
  });

  try {
    // Clean potential markdown wrappers
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse AI JSON response:", text);
    throw new GeminiServiceError(
      "The AI response could not be parsed into the required structured format. Please retry."
    );
  }
}
