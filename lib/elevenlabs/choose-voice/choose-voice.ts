"use server";
import { z } from "zod";
import { Character } from "@/types/character";
import generateStructuredData from "@/lib/generate-structured-data";
import { LibraryVoiceResponse } from "elevenlabs/api";
import { logger } from "@/lib/logger";
import { getVoicesByGender } from "../voice-options/voice-options";

const VoiceSelectionSchema = z.object({
  selectedVoiceId: z.string(),
  reasoning: z.string(),
});

export async function chooseVoice(
  character: Character
): Promise<LibraryVoiceResponse> {
  try {
    // Get voices matching character gender
    const availableVoices = getVoicesByGender(character.gender);

    if (availableVoices.length === 0) {
      throw new Error(`No voices found for gender: ${character.gender}`);
    }

    const systemMessage = `You are a voice casting expert that excels at matching character personalities to voice performances.
When choosing a voice, consider these factors:
- Character's age and how it matches the voice age
- Personality traits and how they align with the voice description
- Accent appropriateness for the character's background
- Voice descriptive tags and use case compatibility
Consider the character's full context including their backstory, goals, and relationships.`;

    const prompt = `Choose the most appropriate voice for this character:
${JSON.stringify(character, null, 2)}

Available voices:
${JSON.stringify(availableVoices, null, 2)}

Choose the voice that best matches the character's personality, age, and background.`;

    const result = await generateStructuredData({
      callName: "chooseVoice",
      schema: VoiceSelectionSchema,
      systemMessage,
      prompt,
      temperature: 0.7,
    });

    const selectedVoice = availableVoices.find(
      (v) => v.voice_id === result.selectedVoiceId
    );

    if (!selectedVoice) {
      throw new Error(
        `Selected voice ID ${result.selectedVoiceId} not found in available voices`
      );
    }

    await logger.info("Voice selected for character", {
      characterId: character.id,
      characterName: character.displayName,
      selectedVoiceId: selectedVoice.voice_id,
      voiceName: selectedVoice.name,
      reasoning: result.reasoning,
    });

    return selectedVoice;
  } catch (error) {
    await logger.error("Failed to choose voice for character", {
      error: error instanceof Error ? error.stack : String(error),
      characterId: character.id,
      characterName: character.displayName,
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const testCharacter: Character = {
        id: 1,
        createdAt: new Date().toISOString(),
        storyId: 1,
        portraitUrl: "https://example.com/portrait.jpg",
        voiceId: "",
        voiceSampleUrl: "",
        displayName: "Sarah",
        fullName: "Sarah Johnson",
        age: 28,
        gender: "female",
        personality: "Confident and determined, with a dry sense of humor",
        backstory: "Former military pilot turned private investigator",
        goals: ["Solve the mystery", "Protect her clients"],
        relationships: [
          "Partner in the detective agency",
          "Informant in the police force",
        ],
        physicalDescription: {
          hairStyle:
            "Long, silky hair usually kept neatly braided or tied back for archive work",
          hairColor: "Deep chestnut brown with natural copper highlights",
          eyeColor: "Striking sapphire blue with subtle flecks of silver",
          skinTone: "Fair complexion with a slight indoor pallor",
          build: "Slender and graceful, average height with delicate features",
          facialFeatures:
            "Heart-shaped face with high cheekbones and delicate jawline",
          clothing:
            "Modest archive worker robes in muted browns and grays, simple cut with practical pockets and ink-resistant sleeves",
          accessories:
            "Reading glasses, leather document satchel, concealed crystal pendant, writing implements",
          distinctiveFeatures:
            "Barely visible magical sigils on her palms that shimmer faintly when she's emotional",
          expression:
            "Carefully neutral and studious, but with an observant intensity in her eyes",
        },
      };

      const selectedVoice = await chooseVoice(testCharacter);
      console.log("Selected voice:", selectedVoice);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}
