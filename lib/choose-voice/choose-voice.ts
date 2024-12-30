import generateStructuredData from "@/lib/generate-structured-data";
import { Character } from "@/types/character";
import { z } from "zod";
import getVoiceOptions from "./get-voice-options";
import { TEST_ELENA } from "../generate-whole-scene/test-data";

const VoiceSelectionSchema = z.object({
  voiceId: z.string(),
});

export default async function chooseVoice(
  character: Character
): Promise<string> {
  const voices = await getVoiceOptions({ gender: character.gender });

  const result = await generateStructuredData({
    schema: VoiceSelectionSchema,
    systemMessage:
      "You are an expert at matching voices to character descriptions.",
    prompt: `
   Character: ${character.displayName}
   Gender: ${character.gender}
   Age: ${character.age}
   Personality: ${character.personality}
   
   Available voices:
   ${voices
     .map(
       (v) =>
         `- ${v.name}: ${Object.entries(v.labels || {})
           .filter(([key]) => key !== "use_case")
           .map(([key, value]) => `${key}: ${value}`)
           .join(", ")} (ID: ${v.voice_id})`
     )
     .join("\n")}
   
   Select the most appropriate voice ID based on character traits and voice attributes.`,
    temperature: 0.2,
  });

  return result.voiceId;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  chooseVoice(TEST_ELENA).then(console.log);
}

