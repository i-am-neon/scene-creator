import { Character } from "@/types/character";
import { supabase } from "../lib/init-supabase";
import { toSupabaseCharacter } from "./character-db-conversion";

export const insertCharacter = async (
  character: Omit<Character, "id" | "createdAt">
): Promise<Character> => {
  const supabaseCharacter = toSupabaseCharacter(character);
  const { data, error } = await supabase
    .from("characters")
    .insert(supabaseCharacter)
    .select("*")
    .single();

  if (error) {
    console.error("Error inserting character:", error);
    throw error;
  }

  return {
    ...character,
    id: data.id,
    createdAt: data.created_at,
  };
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const newCharacter: Omit<Character, "id" | "createdAt"> = {
      displayName: "Erynn",
      fullName: "Erynn Nightshade",
      goals: ["Survive the night", "Find the truth"],
      portraitUrl: "https://example.com/character.jpg",
      age: 25,
      gender: "female",
      personality: "cunning and resourceful",
      backstory: "A rogue with a mysterious past",
      storyId: 5, // Replace with a valid story ID
      relationships: ["Rogue's Guild", "Mysterious Stranger"],
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
      voiceId: "1",
      voiceSampleUrl: "https://example.com/voice-sample.mp3",
    };

    const characterId = await insertCharacter(newCharacter);
    console.log("Inserted Character ID:", characterId);
  })();
}

