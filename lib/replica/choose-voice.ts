import generateStructuredData from "@/lib/generate-structured-data";
import { CharacterPreSave } from "@/types/character";
import { z } from "zod";
import { fetchVoices } from "./fetch-voices";
import _ from "lodash";
import { logger } from "@/lib/logger";

const VoiceSelectionSchema = z.object({
  voiceId: z.string(),
  reasoning: z.string().describe("Explanation for why this voice was chosen"),
});

export type VoiceSelection = z.infer<typeof VoiceSelectionSchema>;

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default async function chooseVoice(
  character: CharacterPreSave,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fetch all available voices
      const voices = await fetchVoices();

      // Filter voices by gender if specified
      const genderFilteredVoices = voices.filter(
        (v) => v.gender === character.gender
      );

      // If no voices match the gender, fall back to all voices
      const availableVoices =
        genderFilteredVoices.length > 0 ? genderFilteredVoices : voices;

      // Shuffle the voices to prevent bias towards voices that appear first
      const shuffledVoices = _.shuffle(availableVoices);

      const result = await generateStructuredData({
        callName: "chooseVoice",
        schema: VoiceSelectionSchema,
        systemMessage: `You are an expert at matching voices to character descriptions.
        Consider these factors when choosing a voice:
        1. Gender alignment (if specified)
        2. Age appropriateness
        3. Accent and speaking style matching the character's background
        4. Voice characteristics matching personality traits
        5. Available voice styles matching potential emotional range needed`,
        prompt: `
        Character Information:
        Name: ${character.displayName}
        Gender: ${character.gender}
        Age: ${character.age}
        Personality: ${character.personality}
        Backstory: ${character.backstory}
        
        Available voices (shuffled to prevent selection bias):
        ${shuffledVoices
          .map(
            (v) => `
        Name: ${v.name}
        Description: ${v.description}
        Gender: ${v.gender}
        Age Range: ${v.voiceAge}
        Accent: ${v.accent}
        Characteristics: ${v.characteristics.join(", ")}
        Available Styles: ${v.styles.map((s) => s.name).join(", ")}
        ID: ${v.id}
        `
          )
          .join("\n---\n")}
        
        Select the most appropriate voice ID based on the character traits and voice attributes. 
        Provide clear reasoning for your choice, explaining how the voice characteristics match the character.
        Return both the voice ID and your reasoning.
        Make sure to return the **voice ID**, not the voice name. The voice ID will be a uuid.`,
      });

      // Validate that the selected voice ID exists in the available voices
      const selectedVoice = voices.find((v) => v.id === result.voiceId);
      if (!selectedVoice) {
        const error = new Error(
          `Selected voice ID ${result.voiceId} not found in available voices`
        );
        if (attempt < maxRetries - 1) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          await logger.warn("Invalid voice ID selected, retrying", {
            characterName: character.displayName,
            selectedVoiceId: result.voiceId,
            reasoning: result.reasoning,
            attempt: attempt + 1,
            nextAttemptDelay: delay,
          });
          await sleep(delay);
          continue;
        }
        throw error;
      }

      await logger.info("Voice selected for character", {
        characterName: character.displayName,
        selectedVoiceId: result.voiceId,
        selectedVoiceName: selectedVoice.name,
        reasoning: result.reasoning,
        attempt: attempt + 1,
      });

      return result.voiceId;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = BASE_DELAY * Math.pow(2, attempt);
        await logger.warn("Failed to choose voice for character, retrying", {
          error: error instanceof Error ? error.stack : String(error),
          character: character.displayName,
          attempt: attempt + 1,
          nextAttemptDelay: delay,
        });
        await sleep(delay);
        continue;
      }

      await logger.error(
        "Failed to choose voice for character after all retries",
        {
          error: error instanceof Error ? error.stack : String(error),
          character: character.displayName,
          attempts: attempt + 1,
        }
      );
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to choose voice after ${maxRetries} attempts`)
  );
}

// Test character for the example
const TEST_CHARACTER: CharacterPreSave = {
  displayName: "Captain Marcus",
  fullName: "Marcus Alexander Blackwood",
  age: 45,
  gender: "male",
  personality:
    "Stern and commanding, with a dry sense of humor. Natural leader who inspires loyalty.",
  backstory:
    "A veteran spaceship captain with decades of experience. Known for his tactical brilliance and unwavering dedication to his crew.",
  goals: ["Protect his crew", "Complete the mission", "Maintain order"],
  relationships: ["First Officer Chen", "Engineer Rodriguez"],
  physicalDescription: {
    hairStyle: "Neatly combed back, perfectly maintained",
    hairColor: "Pure silver-white",
    eyeColor: "Sharp gray with decades of wisdom",
    skinTone: "Pale and aristocratic",
    build: "Tall and lean with an elderly yet dignified bearing",
    facialFeatures: "Distinguished aquiline features, high forehead",
    clothing:
      "Formal Council robes in deep blue and silver with subtle magical preservation runes",
    accessories:
      "Councilor's staff of office, various rings of political significance",
    distinctiveFeatures:
      "Ancient magical signet ring disguised as a Council seal",
    expression: "Carefully neutral with hints of hidden knowledge",
  },
};

if (import.meta.url === `file://${process.argv[1]}`) {
  chooseVoice(TEST_CHARACTER)
    .then((voiceId) => console.log("Selected voice ID:", voiceId))
    .catch(console.error);
}
