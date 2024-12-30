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
    };

    const characterId = await insertCharacter(newCharacter);
    console.log("Inserted Character ID:", characterId);
  })();
}

