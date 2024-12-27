import { supabase } from "@/db/lib/init-supabase";
import { Story } from "@/types/story";
import { toSupabaseStory, toAppStory } from "./story-db-conversion";

export default async function insertStory(
  story: Omit<Story, "id" | "createdAt">
): Promise<Story> {
  const { data, error } = await supabase
    .from("stories")
    .insert([toSupabaseStory(story)])
    .select();

  if (error || !data) {
    console.error("Error inserting story:", error);
    throw new Error("Error inserting story");
  }

  return toAppStory(data[0]);
}

