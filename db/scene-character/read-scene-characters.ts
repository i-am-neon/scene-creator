import { Character } from "@/types/character";
import { toAppCharacter } from "../character/character-db-conversion";
import { supabase } from "../lib/init-supabase";

export const readSceneCharacters = async (
  sceneId: number
): Promise<Character[]> => {
  // Query the junction table to get character IDs, then join with characters table
  const { data, error } = await supabase
    .from("scene_characters")
    .select(
      `
      character_id,
      characters:characters (*)
    `
    )
    .eq("scene_id", sceneId);

  if (error) {
    console.error("Error fetching scene characters:", error);
    return [];
  }

  // Extract and convert the character data
  return data
    .map((row) => row.characters)
    .filter((char): char is NonNullable<typeof char> => char !== null)
    .map(toAppCharacter);
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const sceneId = 8; // Replace with a valid scene ID
    const characters = await readSceneCharacters(sceneId);
    console.log("Characters in scene:", characters);
  })();
}

