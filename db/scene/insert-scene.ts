import { Scene, Script } from "@/types/scene";
import { supabase } from "../lib/init-supabase";
import { toSupabaseScene } from "./scene-db-conversion";

export const insertScene = async (
  scene: Omit<Scene, "id" | "createdAt">
): Promise<Scene> => {
  const supabaseScene = toSupabaseScene(scene);

  const { data, error } = await supabase
    .from("scenes")
    .insert(supabaseScene)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  console.log("Scene inserted with ID:", data.id);
  return {
    ...scene,
    id: data.id,
  };
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const newScene: Omit<Scene, "id" | "createdAt"> = {
      characterPositions: { someone: "far-left" },
      title: "The Great Escape",
      description: "The hero flees the fortress.",
      order: 1,
      script: [{ characterName: "something", text: "hi" }] as Script,
      storyId: 5, // Replace with a valid story ID
    };

    const sceneId = await insertScene(newScene);
    console.log("Inserted Scene ID:", sceneId);
  })();
}

