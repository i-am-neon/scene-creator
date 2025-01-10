import { supabase } from "@/db/lib/init-supabase";
import { Story } from "@/types/story";
import { toSupabaseStory, toAppStory } from "./story-db-conversion";
import { TEST_STORY } from "@/lib/generate-whole-scene/test-data";

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

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const newStory = await insertStory(TEST_STORY);
      console.log("Inserted story:", newStory);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}
