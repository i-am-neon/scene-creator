import { Character } from "@/types/character";
import { toAppCharacter } from "./character-db-conversion";
import { supabase } from "../lib/init-supabase";

export const readCharacter = async (id: number): Promise<Character | null> => {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching character:", error);
    return null;
  }

  return data ? toAppCharacter(data) : null;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const id = 22;
    const character = await readCharacter(id);
    console.log("Character:", character);
  })();
}

