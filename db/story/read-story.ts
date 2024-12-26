import { Story } from "@/types/story";
import { supabase } from "../lib/init-supabase";
import { toAppStory } from "../lib/story-db-conversion";

export default async function readStory(id: number): Promise<Story> {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", id)
    .single(); // Ensures only one row is returned

  if (error || !data) {
    console.error("Error reading story:", error);
    throw new Error("Error reading story");
  }

  return toAppStory(data);
}

