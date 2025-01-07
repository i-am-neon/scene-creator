import generateStructuredData from "@/lib/generate-structured-data";
import { CharacterPreSave } from "@/types/character";
import { z } from "zod";
import { TEST_ELENA } from "../generate-whole-scene/test-data";
import getVoiceOptions from "./get-voice-options";

const VoiceSelectionSchema = z.object({
  voiceId: z.string(),
});

export default async function chooseVoice(
  character: CharacterPreSave
): Promise<string> {
  const voices = await getVoiceOptions({ gender: character.gender });

  const result = await generateStructuredData({
    callName: "chooseVoice",
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
         `- ${v.name}: ${v.description || "No description"}
     Labels: ${Object.entries(v.labels || {})
       .filter(([key]) => key !== "use_case")
       .map(([key, value]) => `${key}: ${value}`)
       .join(", ")} 
     ID: ${v.id}`
     )
     .join("\n")}
   
   Select the most appropriate voice ID based on character traits and voice attributes.`,
    temperature: 1,
  });

  return result.voiceId;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  chooseVoice(TEST_ELENA).then(console.log);
}

