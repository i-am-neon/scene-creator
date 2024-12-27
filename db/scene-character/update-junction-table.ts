import { supabase } from "../lib/init-supabase";

type SceneCharacter = {
  sceneId: number;
  characterIds: number[]; // List of character IDs to associate with the scene
};

/**
 * Updates the junction table by linking characters to a scene.
 * Removes any existing links for the scene before adding the new ones.
 */
export const updateJunctionTable = async ({
  sceneId,
  characterIds,
}: SceneCharacter): Promise<boolean> => {
  // Start by deleting existing entries for the scene
  const { error: deleteError } = await supabase
    .from("scene_characters")
    .delete()
    .eq("scene_id", sceneId);

  if (deleteError) {
    console.error(
      "Error removing existing scene-character links:",
      deleteError
    );
    return false;
  }

  // Prepare new entries for the junction table
  const newLinks = characterIds.map((characterId) => ({
    scene_id: sceneId,
    character_id: characterId,
  }));

  // Insert the new links
  const { error: insertError } = await supabase
    .from("scene_characters")
    .insert(newLinks);

  if (insertError) {
    console.error("Error inserting new scene-character links:", insertError);
    return false;
  }

  console.log("Successfully updated junction table for scene:", sceneId);
  return true;
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const sceneId = 5; // Replace with a valid scene ID
    const characterIds = [1, 2, 3]; // Replace with valid character IDs

    const success = await updateJunctionTable({ sceneId, characterIds });
    console.log("Junction table update successful:", success);
  })();
}
