"use server";
import { z } from "zod";
import { Character } from "@/types/character";
import generateStructuredData from "@/lib/generate-structured-data";
import { LibraryVoiceResponse } from "elevenlabs/api";
import { logger } from "@/lib/logger";
import { getVoicesByGender } from "./voice-options/voice-options";
import _ from "lodash";

interface VoiceSelectionInfo {
  voice_id: string;
  name: string;
  accent: string;
  age: string;
  descriptive: string;
  use_case: string;
  description: string;
}

const VoiceSelectionSchema = z.object({
  selectedVoiceId: z.string(),
  reasoning: z.string(),
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function simplifyVoiceInfo(voice: LibraryVoiceResponse): VoiceSelectionInfo {
  return {
    voice_id: voice.voice_id,
    name: voice.name,
    accent: voice.accent,
    age: voice.age,
    descriptive: voice.descriptive,
    use_case: voice.use_case,
    description: voice.description,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function chooseVoice({
  character,
  voiceOptions,
}: {
  character: Omit<
    Character,
    | "id"
    | "createdAt"
    | "storyId"
    | "portraitUrl"
    | "voiceId"
    | "voiceSampleUrl"
  >;
  voiceOptions: LibraryVoiceResponse[];
}): Promise<string> {
  if (voiceOptions.length === 0) {
    throw new Error(`No voices found for gender: ${character.gender}`);
  }

  const simplifiedVoices = voiceOptions.map(simplifyVoiceInfo);

  // Shuffle the voices to prevent bias towards voices that appear first
  const shuffledSimplifiedVoices = _.shuffle(simplifiedVoices);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const systemMessage = `You are an expert voice casting director specializing in matching character voices for narrative storytelling.

Key Selection Criteria:
1. Voice ID MUST be selected from the provided voice_id field, not the name
2. Age Alignment: Match voice age range with character's age
3. Personality Match: Voice qualities should reflect character traits
4. Accent Appropriateness: Consider character's background and setting
5. Performance Style: Evaluate voice's suitability for storytelling

Important:
- ALWAYS return a valid voice_id from the available options
- Do NOT return voice names or create new IDs
- Consider both technical voice qualities and emotional resonance`;

      const prompt = `Select the most suitable voice for this character:
${JSON.stringify(character, null, 2)}

Available voices (SELECT USING voice_id ONLY):
${JSON.stringify(shuffledSimplifiedVoices, null, 2)}`;

      const result = await generateStructuredData({
        callName: "chooseVoice",
        schema: VoiceSelectionSchema,
        systemMessage,
        prompt,
        temperature: 0.7,
      });

      const selectedVoice = voiceOptions.find(
        (v) => v.voice_id === result.selectedVoiceId
      );

      if (!selectedVoice) {
        throw new Error(
          `Selected voice ID ${result.selectedVoiceId} not found in available voices`
        );
      }

      await logger.info("Voice selected for character", {
        characterName: character.displayName,
        selectedVoiceId: selectedVoice.voice_id,
        voiceName: selectedVoice.name,
        reasoning: result.reasoning,
        attempt: attempt + 1,
      });

      return selectedVoice.voice_id;
    } catch (error) {
      lastError = error as Error;

      if (attempt < MAX_RETRIES - 1) {
        await logger.warn("Voice selection failed, retrying", {
          error: error instanceof Error ? error.message : String(error),
          characterName: character.displayName,
          attempt: attempt + 1,
          nextAttemptDelay: RETRY_DELAY,
        });
        await sleep(RETRY_DELAY);
        continue;
      }

      await logger.error(
        "Failed to choose voice for character after all retries",
        {
          error: error instanceof Error ? error.stack : String(error),
          characterName: character.displayName,
          attempts: attempt + 1,
        }
      );
      throw lastError;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to select voice after ${MAX_RETRIES} attempts`)
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const testCharacter: Omit<
        Character,
        | "id"
        | "createdAt"
        | "storyId"
        | "portraitUrl"
        | "voiceId"
        | "voiceSampleUrl"
      > = {
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
          hairStyle: "Long, silky hair usually kept neatly braided",
          hairColor: "Deep chestnut brown with copper highlights",
          eyeColor: "Sapphire blue with silver flecks",
          skinTone: "Fair complexion",
          build: "Slender and graceful",
          facialFeatures: "Heart-shaped face with high cheekbones",
          clothing: "Professional attire in muted colors",
          accessories: "Reading glasses, leather satchel",
          distinctiveFeatures: "Faint magical sigils on palms",
          expression: "Observant intensity",
        },
      };

      const selectedVoice = await chooseVoice({
        character: testCharacter,
        voiceOptions: getVoicesByGender("female"),
      });
      console.log("Selected voice:", selectedVoice);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

