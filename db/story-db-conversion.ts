import { Story } from "@/types/story";
import { Database } from "@/db/database.types";

type SupabaseStory = Database["public"]["Tables"]["stories"]["Row"];

export const toAppStory = (supabaseStory: SupabaseStory): Story => ({
  id: supabaseStory.id,
  createdAt: supabaseStory.created_at,
  title: supabaseStory.title,
  worldIdea: supabaseStory.world_idea,
  worldOverview: supabaseStory.world_overview as { history: string },
  storyOverview: supabaseStory.story_overview as { premise: string },
});

export const toSupabaseStory = (
  story: Omit<Story, "id" | "createdAt">
): Omit<SupabaseStory, "id" | "created_at"> => ({
  title: story.title,
  world_idea: story.worldIdea,
  world_overview: story.worldOverview,
  story_overview: story.storyOverview,
});
