import generateStructuredData from "@/lib/generate-structured-data";
import { Story } from "@/types/story";
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

export default async function chooseNarratorVoice(
  story: Omit<Story, "id" | "createdAt" | "imageUrl" | "narratorVoiceId">,
  maxRetries = DEFAULT_MAX_RETRIES
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Fetch all available voices
      const voices = await fetchVoices();

      // Shuffle the voices to prevent bias towards voices that appear first
      const shuffledVoices = _.shuffle(voices);

      const result = await generateStructuredData({
        callName: "chooseNarratorVoice",
        schema: VoiceSelectionSchema,
        systemMessage: `You are an expert at selecting narrative voices for storytelling.
        Consider these factors when choosing a voice:
        1. Genre and tone of the story
        2. World setting and atmosphere
        3. Target audience expectations
        4. Storytelling style needed
        5. Emotional range required for the narrative
        6. Clarity and engagement factor
        
        Prioritize voices that have:
        - Clear diction and professional delivery
        - Appropriate gravitas for the story's tone
        - Sufficient emotional range for storytelling
        - Natural pacing and rhythm`,
        prompt: `
        Story Information:
        Title: ${story.title}
        World Concept: ${story.worldIdea}
        World History: ${story.worldOverview.history}
        Story Premise: ${story.storyOverview.premise}
        Main Characters: ${story.storyOverview.mainCharacterIdeas
          .map((char) => `${char.name} - ${char.description}`)
          .join("\n")}
        
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
        
        Select the most appropriate narrator voice ID based on the story's characteristics and voice attributes.
        Consider how well the voice can carry the narrative and maintain engagement throughout the story.
        Return both the voice ID and your reasoning.
        Make sure to return the **voice ID**, not the voice name. The voice ID will be a uuid.`,
        temperature: 0.7,
      });

      // Validate that the selected voice ID exists in the available voices
      const selectedVoice = voices.find((v) => v.id === result.voiceId);
      if (!selectedVoice) {
        const error = new Error(
          `Selected voice ID ${result.voiceId} not found in available voices`
        );
        if (attempt < maxRetries - 1) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          await logger.warn("Invalid narrator voice ID selected, retrying", {
            storyTitle: story.title,
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

      await logger.info("Narrator voice selected for story", {
        storyTitle: story.title,
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
        await logger.warn(
          "Failed to choose narrator voice for story, retrying",
          {
            error: error instanceof Error ? error.stack : String(error),
            storyTitle: story.title,
            attempt: attempt + 1,
            nextAttemptDelay: delay,
          }
        );
        await sleep(delay);
        continue;
      }

      await logger.error("Failed to choose narrator voice after all retries", {
        error: error instanceof Error ? error.stack : String(error),
        storyTitle: story.title,
        attempts: attempt + 1,
      });
      throw error;
    }
  }

  throw (
    lastError ||
    new Error(`Failed to choose narrator voice after ${maxRetries} attempts`)
  );
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testStory: Omit<
    Story,
    "id" | "createdAt" | "imageUrl" | "narratorVoiceId"
  > = {
    title: "The Lost Kingdom",
    worldIdea: "A medieval fantasy realm where magic is rare but powerful",
    worldOverview: {
      history:
        "A once-great kingdom now fallen into mystery and legend, where ancient magics still linger in forgotten places.",
    },
    storyOverview: {
      premise:
        "A young scholar discovers an ancient map that could lead to the kingdom's lost capital.",
      mainCharacterIdeas: [
        {
          name: "Elena Brightscroll",
          description: "Young historian with a passion for ancient mysteries",
        },
        {
          name: "Marcus Stoneshield",
          description: "Veteran warrior turned guide",
        },
      ],
    },
  };

  chooseNarratorVoice(testStory)
    .then((voiceId) => console.log("Selected narrator voice ID:", voiceId))
    .catch(console.error);
}
