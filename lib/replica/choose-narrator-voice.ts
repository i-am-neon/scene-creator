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

export default async function chooseNarratorVoice(
  story: Story
): Promise<string> {
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
      Return both the voice ID and your reasoning.`,
      temperature: 0.7,
    });

    await logger.info("Narrator voice selected for story", {
      storyTitle: story.title,
      selectedVoiceId: result.voiceId,
      reasoning: result.reasoning,
    });

    return result.voiceId;
  } catch (error) {
    await logger.error("Failed to choose narrator voice for story", {
      error: error instanceof Error ? error.stack : String(error),
      storyTitle: story.title,
    });
    throw error;
  }
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const testStory: Story = {
    id: 1,
    createdAt: new Date().toISOString(),
    title: "The Lost Kingdom",
    worldIdea: "A medieval fantasy realm where magic is rare but powerful",
    imageUrl: "https://example.com/image.jpg",
    narratorVoiceId: "", // This will be filled by our function
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
