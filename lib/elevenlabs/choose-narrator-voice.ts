"use server";
import { z } from "zod";
import { Story } from "@/types/story";
import generateStructuredData from "@/lib/generate-structured-data";
import { LibraryVoiceResponse } from "elevenlabs/api";
import { logger } from "@/lib/logger";
import { voiceOptions, voiceOptionsMap } from "./voice-options/voice-options";
import _ from "lodash";

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Only essential voice information for selection
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

export async function chooseNarratorVoice(
  story: Omit<Story, "id" | "createdAt" | "imageUrl" | "narratorVoiceId">,
  maxRetries: number = DEFAULT_MAX_RETRIES
): Promise<string> {
  try {
    if (voiceOptions.length === 0) {
      throw new Error("No voices available for narration");
    }

    const simplifiedVoices = voiceOptions.map(simplifyVoiceInfo);

    // Shuffle the voices to prevent bias towards voices that appear first
    const shuffledSimplifiedVoices = _.shuffle(simplifiedVoices);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const systemMessage = `You are a voice casting expert specializing in selecting narrators for storytelling.
When choosing a narrative voice, consider:
- The story's tone and theme
- World setting and historical period
- Target audience and genre expectations
- Voice clarity and storytelling capability
- Accent appropriateness for the story's setting`;

        const prompt = `Choose the most appropriate narrator voice for this story:
${JSON.stringify(story, null, 2)}

Available voices:
${JSON.stringify(shuffledSimplifiedVoices, null, 2)}

Choose a voice that will enhance the storytelling experience and match the story's tone and setting.`;

        const result = await generateStructuredData({
          callName: "chooseNarratorVoice",
          schema: VoiceSelectionSchema,
          systemMessage,
          prompt,
          temperature: 0.7,
        });

        const selectedVoice = voiceOptionsMap[result.selectedVoiceId];

        if (!selectedVoice) {
          throw new Error(
            `Selected voice ID ${result.selectedVoiceId} not found in available voices`
          );
        }

        await logger.info("Narrator voice selected for story", {
          storyTitle: story.title,
          selectedVoiceId: selectedVoice.voice_id,
          voiceName: selectedVoice.name,
          reasoning: result.reasoning,
          attempt: attempt + 1,
        });

        return selectedVoice.voice_id;
      } catch (error) {
        lastError = error as Error;
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown error occurred while selecting narrator voice";

        if (attempt < maxRetries - 1) {
          const delay = BASE_DELAY * Math.pow(2, attempt);
          await logger.warn("Voice selection failed, retrying", {
            error: errorMessage,
            attempt: attempt + 1,
            nextAttemptDelay: delay,
            storyTitle: story.title,
          });
          await sleep(delay);
          continue;
        }

        throw error;
      }
    }

    throw (
      lastError ||
      new Error(`Failed to select voice after ${maxRetries} attempts`)
    );
  } catch (error) {
    await logger.error("Failed to choose narrator voice for story", {
      error: error instanceof Error ? error.stack : String(error),
      storyTitle: story.title,
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const testStory: Omit<Story, "id" | "createdAt" | "narratorVoiceId"> = {
        title: "The Chronicles of the Lost Library",
        worldIdea:
          "A mysterious library that exists between dimensions, holding the knowledge of countless worlds.",
        imageUrl: "https://example.com/library.jpg",
        worldOverview: {
          history:
            "The Interdimensional Library was created millennia ago by the Archivists, a group of powerful beings dedicated to preserving knowledge across all realities. As dimensions shifted and civilizations rose and fell, the Library remained constant, though its halls grew ever more labyrinthine with each passing age.",
        },
        storyOverview: {
          premise:
            "When a young apprentice archivist discovers an ancient prophecy hidden within a forgotten tome, she must navigate the Library's endless corridors and face its mysteries to prevent a catastrophic loss of knowledge that could unravel reality itself.",
          mainCharacterIdeas: [
            {
              name: "Elena Blackwood",
              description:
                "A brilliant but cautious apprentice archivist with a unique ability to read magical texts",
            },
          ],
        },
      };

      const selectedVoice = await chooseNarratorVoice(testStory);
      console.log("Selected narrator voice:", voiceOptionsMap[selectedVoice]);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

