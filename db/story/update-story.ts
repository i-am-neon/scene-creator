import { supabase } from "@/db/lib/init-supabase";
import { Story } from "@/types/story";
import { toSupabaseStory, toAppStory } from "./story-db-conversion";

export default async function updateStory(
  id: number,
  updates: Partial<Omit<Story, "id" | "createdAt">>
): Promise<Story> {
  const { data, error } = await supabase
    .from("stories")
    .update(toSupabaseStory(updates as Story))
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating story:", error);
    throw new Error("Error updating story");
  }

  return toAppStory(data);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const storyId = 75; // Replace with valid story ID
      const updates: Partial<Omit<Story, "id" | "createdAt">> = {
        usedVoiceIds: ["voice1", "voice2"], // Example update
      };
      const updatedStory = await updateStory(storyId, updates);
      console.log("Updated story:", updatedStory);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

