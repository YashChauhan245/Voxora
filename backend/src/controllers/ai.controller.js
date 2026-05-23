import { generateGeminiContent, parseGeminiJson } from "../lib/gemini.js";

const TONE_VALUES = ["literal", "natural", "polite", "casual"];
const GRAMMAR_MODES = ["beginner", "natural", "professional"];

// Keep only supported tone values. Fallback to natural if invalid.
const normalizeTone = (tone = "natural") => {
  const normalized = String(tone).trim().toLowerCase();
  return TONE_VALUES.includes(normalized) ? normalized : "natural";
};

// Keep only supported grammar modes. Fallback to natural if invalid.
const normalizeGrammarMode = (mode = "natural") => {
  const normalized = String(mode).trim().toLowerCase();
  return GRAMMAR_MODES.includes(normalized) ? normalized : "natural";
};

export async function translateWithTone(req, res) {
  try {
    // Read user input from request body.
    const { text, targetLanguage, sourceLanguage = "auto", tone = "natural" } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        message: "text and targetLanguage are required",
      });
    }

    const selectedTone = normalizeTone(tone);

    // We use prompt engineering to force model output into a fixed JSON shape.
    const prompt = `
You are a translation assistant for a language-learning app.
Translate the user's message.

Rules:
- Source language: ${sourceLanguage}
- Target language: ${targetLanguage}
- Tone mode: ${selectedTone}
- Keep meaning accurate.
- Keep output concise and practical for chat.

Return ONLY valid JSON in this shape:
{
  "translatedText": "string",
  "detectedSourceLanguage": "string",
  "tone": "${selectedTone}",
  "alternatives": ["string", "string"],
  "notes": "string"
}

User message:
${text}
`;

    const rawText = await generateGeminiContent([{ text: prompt }]);
  // Parse model output safely before sending to frontend.
    const parsed = parseGeminiJson(rawText);

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in translateWithTone:", error.message);
    res.status(500).json({ message: "Failed to translate text" });
  }
}

export async function grammarHelper(req, res) {
  try {
    const { text, mode = "natural", targetLanguage = "same as input" } = req.body;

    if (!text) {
      return res.status(400).json({ message: "text is required" });
    }

    const selectedMode = normalizeGrammarMode(mode);

    // Ask model for corrected sentence + short explanation points.
    const prompt = `
You are an expert language tutor.
Improve grammar and clarity while preserving intended meaning.

Rules:
- Mode: ${selectedMode}
- Output language: ${targetLanguage}
- Keep tone helpful and educational.

Return ONLY valid JSON in this shape:
{
  "originalText": "string",
  "correctedText": "string",
  "mode": "${selectedMode}",
  "explanations": ["string", "string", "string"],
  "betterPhrasing": ["string", "string"]
}

Text:
${text}
`;

    const rawText = await generateGeminiContent([{ text: prompt }]);
    const parsed = parseGeminiJson(rawText);

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in grammarHelper:", error.message);
    res.status(500).json({ message: "Failed to generate grammar suggestions" });
  }
}

export async function conversationStarters(req, res) {
  try {
    const {
      nativeLanguage,
      learningLanguage,
      level = "beginner",
      interests = [],
      partnerCountry = "",
      count = 5,
    } = req.body;

    if (!nativeLanguage || !learningLanguage) {
      return res.status(400).json({
        message: "nativeLanguage and learningLanguage are required",
      });
    }

    // We clamp prompt count to keep model output predictable.
    const parsedCount = Math.min(Math.max(Number(count) || 5, 3), 10);
    const interestText = Array.isArray(interests)
      ? interests.filter(Boolean).join(", ") || "general topics"
      : String(interests || "general topics");

    const prompt = `
You are creating conversation icebreakers for a language exchange app.

Context:
- User native language: ${nativeLanguage}
- User learning language: ${learningLanguage}
- Level: ${level}
- Interests: ${interestText}
- Partner country: ${partnerCountry || "not specified"}

Create ${parsedCount} beginner-friendly, practical prompts that are short and engaging.

Return ONLY valid JSON in this shape:
{
  "summary": "string",
  "prompts": ["string", "string"],
  "tips": ["string", "string"]
}
`;

    const rawText = await generateGeminiContent([{ text: prompt }]);
    const parsed = parseGeminiJson(rawText);

    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in conversationStarters:", error.message);
    res.status(500).json({ message: "Failed to generate conversation starters" });
  }
}

export async function voiceFeedback(req, res) {
  try {
    const {
      audioBase64,
      mimeType = "audio/webm",
      targetLanguage = "same as speaker",
      translateTo = "",
    } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ message: "audioBase64 is required" });
    }

    // Send both text instruction and audio data to Gemini.
    const prompt = `
You are a speaking coach.
Analyze the provided voice note.

Tasks:
1) Transcribe speech
2) Correct grammar
3) Suggest better phrasing
4) Give pronunciation tips
5) If translateTo is provided, translate transcript

Context:
- targetLanguage: ${targetLanguage}
- translateTo: ${translateTo || "none"}

Return ONLY valid JSON in this shape:
{
  "transcript": "string",
  "grammarMistakes": ["string", "string"],
  "betterPhrasing": ["string", "string"],
  "pronunciationTips": ["string", "string"],
  "translatedTranscript": "string"
}
If translation is not requested, set translatedTranscript to an empty string.
`;

    const rawText = await generateGeminiContent([
      { text: prompt },
      {
        inline_data: {
          // Gemini expects mime type + base64 data for audio input.
          mime_type: mimeType,
          data: audioBase64,
        },
      },
    ]);

    const parsed = parseGeminiJson(rawText);
    res.status(200).json(parsed);
  } catch (error) {
    console.error("Error in voiceFeedback:", error.message);
    res.status(500).json({ message: "Failed to process voice feedback" });
  }
}
