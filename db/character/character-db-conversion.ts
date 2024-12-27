import { Character } from "@/types/character";
import { Database } from "@/types/database.types";

type SupabaseCharacter = Database["public"]["Tables"]["characters"]["Row"];

export const toAppCharacter = (
  supabaseCharacter: SupabaseCharacter
): Character => ({
  id: supabaseCharacter.id,
  name: supabaseCharacter.name,
  age: supabaseCharacter.age,
  gender: supabaseCharacter.gender,
  personality: supabaseCharacter.personality,
  backstory: supabaseCharacter.backstory,
  createdAt: supabaseCharacter.created_at,
  storyId: supabaseCharacter.story_id,
});

export const toSupabaseCharacter = (
  character: Omit<Character, "id" | "createdAt">
): Omit<SupabaseCharacter, "id" | "created_at"> => ({
  name: character.name,
  age: character.age,
  gender: character.gender,
  personality: character.personality,
  backstory: character.backstory,
  story_id: character.storyId,
});
