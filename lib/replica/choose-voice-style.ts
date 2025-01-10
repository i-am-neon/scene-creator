import generateStructuredData from "@/lib/generate-structured-data";
import { ReplicaVoice } from "@/types/replica-voice";
import { z } from "zod";
import { logger } from "@/lib/logger";

const VoiceStyleSelectionSchema = z.object({
  styleId: z.string(),
  reasoning: z.string(),
});

export default async function chooseVoiceStyle({
  text,
  voice,
  context,
}: {
  text: string;
  voice: ReplicaVoice;
  context?: string;
}): Promise<string> {
  try {
    const result = await generateStructuredData({
      callName: "chooseVoiceStyle",
      schema: VoiceStyleSelectionSchema,
      systemMessage: `You are an expert at analyzing dialogue and selecting appropriate emotional styles for voice generation.
      Consider:
      1. The emotional content and subtext of the line
      2. Any stage directions or descriptions
      3. The broader context of the scene
      4. The character's overall personality`,
      prompt: `
      Select the most appropriate voice style for this line of dialogue:
      
      Line: "${text}"
      ${context ? `Context: ${context}` : ""}
      
      Available styles for voice "${voice.name}":
      ${voice.styles
        .map((style) => `- ${style.name} (ID: ${style.id})`)
        .join("\n")}
      
      Choose the style that best matches the emotional content of the line.
      Consider the voice's characteristics: ${voice.characteristics.join(
        ", "
      )}`,
      temperature: 0.7,
    });

    await logger.info("Voice style selected", {
      text: text.substring(0, 100), // Log only the first 100 chars
      voiceName: voice.name,
      selectedStyle: result.styleId,
      reasoning: result.reasoning,
    });

    return result.styleId;
  } catch (error) {
    await logger.error("Failed to choose voice style", {
      error: error instanceof Error ? error.stack : String(error),
      text: text.substring(0, 100),
      voiceName: voice.name,
    });
    throw error;
  }
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testVoice: ReplicaVoice = {
    id: "2cabd0a1-49c4-4720-8fc8-edc5ce95d686",
    name: "Ava",
    description:
      "There's nothing artificial with Ava's intelligence. She's the soul of the perfect android and the voice of a sophisticated humanoid. And if you're not paying attention, Ava is sometimes, more human than human.",
    accent: "british",
    gender: "female",
    voiceAge: "youngadult",
    characteristics: [
      "Calm",
      "Clean",
      "Formal",
      "Gentle",
      "Smooth",
      "Voice-over",
    ],
    styles: [
      {
        id: "da285f00-516c-43e2-a74c-036dd38ee072",
        name: "Urgent",
        speakerId: "015bf234-12b9-4a1a-bb14-255afa89cd72",
      },
      {
        id: "619b4f32-6d41-43a2-bc43-4a3466783eb6",
        name: "Polite",
        speakerId: "55a0aad5-a739-402f-9cec-36b01ff81a41",
      },
    ],
    defaultStyle: {
      id: "619b4f32-6d41-43a2-bc43-4a3466783eb6",
      name: "Polite",
      speakerId: "55a0aad5-a739-402f-9cec-36b01ff81a41",
    },
  };

  chooseVoiceStyle({
    text: "How dare you betray me like this! After everything we've been through!",
    voice: testVoice,
    context: "Character has just discovered their best friend's betrayal",
  }).then(console.log);
}

