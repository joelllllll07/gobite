import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Calls Gemini directly via Google's OpenAI-compatible endpoint, using a key
// from https://aistudio.google.com/apikey (no Lovable account needed).
export function createGeminiProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
}
