import { Scene } from "@/types/scene";
import { toAppScene } from "./scene-db-conversion";
import { supabase } from "../lib/init-supabase";

export const readScenes = async (storyId: number): Promise<Scene[]> => {
  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("story_id", storyId);

  if (error) {
    console.error("Error fetching scenes:", error);
    return [];
  }

  return data ? data.map(toAppScene) : [];
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const storyId = 5; // Replace with a valid story_id for testing
    const scenes = await readScenes(storyId);
    console.log("Scenes:", scenes);
  })();
}

