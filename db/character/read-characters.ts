import { Character } from "@/types/character";
import { toAppCharacter } from "./character-db-conversion";
import { supabase } from "../lib/init-supabase";

export const readCharacters = async (storyId: number): Promise<Character[]> => {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("story_id", storyId);

  if (error) {
    console.error("Error fetching characters:", error);
    return [];
  }

  return data ? data.map(toAppCharacter) : [];
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const storyId = 5; // Replace with a valid story_id for testing
    const characters = await readCharacters(storyId);
    console.log("Characters:", characters);
  })();
}

