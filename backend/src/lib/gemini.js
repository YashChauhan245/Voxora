import "dotenv/config";

const GEMINI_MODEL = "gemini-2.5-flash";

const buildEndpoint = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
};

const stripCodeFence = (text = "") => {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```") || !trimmed.endsWith("```")) return trimmed;

  const lines = trimmed.split("\n");
  if (lines.length <= 2) return trimmed;
  return lines.slice(1, -1).join("\n").trim();
};

export const parseGeminiJson = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response");
  }

  const noFence = stripCodeFence(text);

  try {
    return JSON.parse(noFence);
  } catch {
    const firstCurly = noFence.indexOf("{");
    const lastCurly = noFence.lastIndexOf("}");

    if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
      const maybeJson = noFence.slice(firstCurly, lastCurly + 1);
      return JSON.parse(maybeJson);
    }

    throw new Error("Gemini response was not valid JSON");
  }
};

export const generateGeminiContent = async (parts) => {
  const endpoint = buildEndpoint();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts,
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini did not return text output");
  }

  return text;
};
