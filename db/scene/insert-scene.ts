import { Scene, Script } from "@/types/scene";
import { supabase } from "../lib/init-supabase";
import { toSupabaseScene } from "./scene-db-conversion";

export const insertScene = async (
  scene: Omit<Scene, "id" | "createdAt">
): Promise<number | null> => {
  const supabaseScene = toSupabaseScene(scene);

  const { data, error } = await supabase
    .from("scenes")
    .insert(supabaseScene)
    .select("id")
    .single();

  if (error) {
    console.error("Error inserting scene:", error);
    return null;
  }

  console.log("Scene inserted with ID:", data.id);
  return data.id;
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const newScene = {
      title: "The Great Escape",
      description: "The hero flees the fortress.",
      order: 1,
      script: { characterIds: [1, 2], text: "hi" } as Script,
      storyId: 5, // Replace with a valid story ID
    };

    const sceneId = await insertScene(newScene);
    console.log("Inserted Scene ID:", sceneId);
  })();
}

