import { supabase } from "@/lib/init-supabase";
import { Story } from "@/types/story";

export default async function insertStory(
  story: Omit<Story, "id" | "createdAt">
): Promise<Story> {
  const { data, error } = await supabase
    .from("stories")
    .insert([
      {
        title: story.title,
        world_idea: story.worldIdea,
        world_overview: story.worldOverview,
        story_overview: story.storyOverview,
      },
    ])
    .select();

  if (error || !data) {
    console.error("error", error);
    throw new Error("Error inserting story");
  }

  return {
    id: data[0].id,
    createdAt: data[0].created_at,
    title: data[0].title,
    worldIdea: data[0].world_idea,
    worldOverview: data[0].world_overview as { history: string },
    storyOverview: data[0].story_overview as { premise: string },
  };
}

