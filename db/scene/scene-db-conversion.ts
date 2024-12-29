import { Database } from "@/types/database.types";
import { Scene, Script } from "@/types/scene";

type SupabaseScene = Database["public"]["Tables"]["scenes"]["Row"];

export const toAppScene = (supabaseScene: SupabaseScene): Scene => ({
  id: supabaseScene.id,
  createdAt: supabaseScene.created_at,
  title: supabaseScene.title,
  description: supabaseScene.description,
  order: supabaseScene.order,
  script: supabaseScene.script as Script,
  storyId: supabaseScene.story_id,
});

export const toSupabaseScene = (
  scene: Omit<Scene, "id" | "createdAt">
): Omit<SupabaseScene, "id" | "created_at"> => ({
  title: scene.title,
  description: scene.description,
  order: scene.order,
  script: scene.script,
  story_id: scene.storyId,
});
