import { Story, StoryOverview, WorldOverview } from "@/types/story";
import { Database } from "@/types/database.types";

type SupabaseStory = Database["public"]["Tables"]["stories"]["Row"];

export const toAppStory = (supabaseStory: SupabaseStory): Story => ({
  id: supabaseStory.id,
  createdAt: supabaseStory.created_at,
  imageUrl: supabaseStory.image_url,
  narratorVoiceId: supabaseStory.narrator_voice_id,
  title: supabaseStory.title,
  worldIdea: supabaseStory.world_idea,
  worldOverview: supabaseStory.world_overview as WorldOverview,
  storyOverview: supabaseStory.story_overview as StoryOverview,
  usedVoiceIds: supabaseStory.used_voice_ids,
});

export const toSupabaseStory = (
  story: Omit<Story, "id" | "createdAt">
): Omit<SupabaseStory, "id" | "created_at"> => ({
  title: story.title,
  image_url: story.imageUrl,
  narrator_voice_id: story.narratorVoiceId,
  world_idea: story.worldIdea,
  world_overview: story.worldOverview,
  story_overview: story.storyOverview,
  used_voice_ids: story.usedVoiceIds,
});

