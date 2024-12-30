import { Character } from "@/types/character";
import { Database } from "@/types/database.types";

type SupabaseCharacter = Database["public"]["Tables"]["characters"]["Row"];

export const toAppCharacter = (
  supabaseCharacter: SupabaseCharacter
): Character => ({
  id: supabaseCharacter.id,
  displayName: supabaseCharacter.display_name,
  fullName: supabaseCharacter.full_name,
  portraitUrl: supabaseCharacter.portrait_url,
  voiceId: supabaseCharacter.voice_id,
  voiceSampleUrl: supabaseCharacter.voice_sample_url,
  age: supabaseCharacter.age,
  gender: supabaseCharacter.gender as Character["gender"],
  personality: supabaseCharacter.personality,
  backstory: supabaseCharacter.backstory,
  goals: supabaseCharacter.goals,
  relationships: supabaseCharacter.relationships,
  createdAt: supabaseCharacter.created_at,
  storyId: supabaseCharacter.story_id,
});

export const toSupabaseCharacter = (
  character: Omit<Character, "id" | "createdAt">
): Omit<SupabaseCharacter, "id" | "created_at"> => ({
  display_name: character.displayName,
  full_name: character.fullName,
  portrait_url: character.portraitUrl,
  voice_id: character.voiceId,
  voice_sample_url: character.voiceSampleUrl,
  goals: character.goals,
  relationships: character.relationships,
  age: character.age,
  gender: character.gender,
  personality: character.personality,
  backstory: character.backstory,
  story_id: character.storyId,
});

