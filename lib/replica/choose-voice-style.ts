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
      selectedStyle: result.styleId,
      reasoning: result.reasoning,
      voiceName: voice.name,
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
    id: "e6a1342b-ae78-4ce3-b2e1-8fa040601d4f",
    name: "Steel",
    description:
      "When Steel speaks, you know who's in-charge. Whether he's barking orders or giving a briefing, this seasoned battlefield veteran commands the room and the troops with aplomb.",
    accent: "american",
    gender: "male",
    voiceAge: "middleaged",
    characteristics: ["Authoritative", "Clear", "Commanding"],
    styles: [
      {
        id: "0c386d66-0af2-40f4-bb27-9afe12440b5e",
        name: "Barking Orders",
      },
      {
        id: "85b8b854-54ba-4468-8f76-19c1d7abb1b1",
        name: "Storyteller",
      },
      {
        id: "be9ac45e-5ed7-4568-bfd9-dc0cb5e53b87",
        name: "Briefing",
      },
    ],
  };

  chooseVoiceStyle({
    text: "How dare you betray me like this! After everything we've been through!",
    voice: testVoice,
    context: "Character has just discovered their best friend's betrayal",
  }).then(console.log);
}

