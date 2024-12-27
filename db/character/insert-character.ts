import { Character } from "@/types/character";
import { supabase } from "../lib/init-supabase";
import { toSupabaseCharacter } from "./character-db-conversion";

export const insertCharacter = async (
  character: Omit<Character, "id" | "createdAt">
): Promise<number | null> => {
  const supabaseCharacter = toSupabaseCharacter(character);

  const { data, error } = await supabase
    .from("characters")
    .insert(supabaseCharacter)
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting character:", error);
    return null;
  }

  console.log("Character inserted with ID:", data.id);
  return data.id;
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const newCharacter = {
      name: "Erynn",
      age: 25,
      gender: "female",
      personality: "cunning and resourceful",
      backstory: "A rogue with a mysterious past",
      storyId: 5, // Replace with a valid story ID
    };

    const characterId = await insertCharacter(newCharacter);
    console.log("Inserted Character ID:", characterId);
  })();
}

