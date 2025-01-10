import { logger } from "@/lib/logger";
import { Character } from "@/types/character";
import { addVoiceToMyVoices } from "./add-voice-to-my-voices";
import { voiceOptionsMap } from "../voice-options/voice-options";

interface VoiceAdditionResult {
  id: number;
  originalVoiceId: string;
  newVoiceId: string;
  success: boolean;
  error?: string;
  type: "character" | "narrator";
}

interface AddVoicesParams {
  characters: Character[];
  narratorVoiceId: string;
}

export async function addCharacterVoicesToMyVoices({
  characters,
  narratorVoiceId,
}: AddVoicesParams): Promise<VoiceAdditionResult[]> {
  const allResults = await Promise.all([
    // Add narrator voice
    (async (): Promise<VoiceAdditionResult> => {
      try {
        const voice = voiceOptionsMap[narratorVoiceId];
        const newVoiceId = await addVoiceToMyVoices({
          publicUserId: voice.public_owner_id,
          voiceId: narratorVoiceId,
          newName: "Narrator",
        });
        return {
          id: 0,
          originalVoiceId: narratorVoiceId,
          newVoiceId,
          success: true,
          type: "narrator",
        };
      } catch (error) {
        await logger.error(`Failed to add narrator voice`, {
          voiceId: narratorVoiceId,
          error: error instanceof Error ? error.stack : String(error),
        });
        return {
          id: 0,
          originalVoiceId: narratorVoiceId,
          newVoiceId: "",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          type: "narrator",
        };
      }
    })(),
    // Add character voices
    ...characters.map(async (character): Promise<VoiceAdditionResult> => {
      try {
        const voice = voiceOptionsMap[character.voiceId];
        const newVoiceId = await addVoiceToMyVoices({
          publicUserId: voice.public_owner_id,
          voiceId: character.voiceId,
          newName: character.displayName,
        });
        return {
          id: character.id,
          originalVoiceId: character.voiceId,
          newVoiceId,
          success: true,
          type: "character",
        };
      } catch (error) {
        await logger.error(`Failed to add character voice`, {
          characterId: character.id,
          voiceId: character.voiceId,
          error: error instanceof Error ? error.stack : String(error),
        });
        return {
          id: character.id,
          originalVoiceId: character.voiceId,
          newVoiceId: "",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          type: "character",
        };
      }
    }),
  ]);

  const successCount = allResults.filter((r) => r.success).length;
  await logger.info("Completed adding voices", {
    totalVoices: allResults.length,
    successCount,
    failureCount: allResults.length - successCount,
  });

  return allResults;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const testCharacters: Character[] = [
      {
        id: 1,
        displayName: "Test Character 1",
        fullName: "Test Character One",
        voiceId: "tSVwqkJGEKjLklhiN0Nx",
        createdAt: new Date().toISOString(),
        portraitUrl: "https://example.com/portrait1.jpg",
        voiceSampleUrl: "https://example.com/sample1.wav",
        age: 25,
        gender: "female",
        personality: "Friendly",
        backstory: "Test backstory",
        goals: ["Goal 1"],
        relationships: ["Relationship 1"],
        storyId: 1,
        physicalDescription: {
          hairStyle: "Long, wavy",
          hairColor: "Auburn",
          eyeColor: "Green",
          skinTone: "Fair",
          build: "Athletic",
          facialFeatures: "Heart-shaped face",
          clothing: "Casual adventurer's garb",
          accessories: "Silver pendant",
          distinctiveFeatures: "Small birthmark under left eye",
          expression: "Confident smile",
        },
      },
    ];

    try {
      const results = await addCharacterVoicesToMyVoices({
        characters: testCharacters,
        narratorVoiceId: "21m00Tcm4TlvDq8ikWAM",
      });
      console.log("Results:", JSON.stringify(results, null, 2));
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

