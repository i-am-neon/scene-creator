import { Character } from "@/types/character";
import { supabase } from "../lib/init-supabase";
import { toSupabaseCharacter } from "./character-db-conversion";

export const updateCharacter = async (
  id: number,
  updates: Partial<Omit<Character, "id" | "createdAt">>
): Promise<Character> => {
  const supabaseUpdates = toSupabaseCharacter(
    updates as Omit<Character, "id" | "createdAt">
  );

  const { data, error } = await supabase
    .from("characters")
    .update(supabaseUpdates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating character:", error);
    throw error;
  }

  return {
    ...updates,
    id: data.id,
    createdAt: data.created_at,
  } as Character;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const updates = {
      displayName: "Erynn the Archivist",
      personality: "studious and determined",
      goals: ["Master ancient texts", "Protect forbidden knowledge"],
    };

    try {
      const updatedCharacter = await updateCharacter(1, updates);
      console.log("Updated Character:", updatedCharacter);
    } catch (error) {
      console.error("Test failed:", error);
    }
  })();
}
