import { Story } from "@/types/story";
import { supabase } from "../lib/init-supabase";
import { toAppStory } from "./story-db-conversion";

export default async function readStory(id: number): Promise<Story | null> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single(); // Ensures only one row is returned

  if (error || !data) {
    console.error("Error reading story:", error);
    return null;
  }

  return toAppStory(data);
}

