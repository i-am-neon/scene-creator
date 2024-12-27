"use server";
import { insertCharacter } from "@/db/character/insert-character";
import { updateJunctionTable } from "@/db/scene-character/update-junction-table";
import { insertScene } from "@/db/scene/insert-scene";

export const createSceneWithCharacters = async () => {
  try {
    // Step 1: Insert the scene
    const newScene = {
      title: "The Great Escape",
      description: "The hero flees the fortress.",
      order: 1,
      script: { characterIds: [1, 2], text: "hi" }, // Custom script format
      storyId: 5, // Replace with the appropriate story ID
    };
    const sceneId = await insertScene(newScene);

    if (!sceneId) {
      console.error("Failed to insert the scene.");
      return;
    }

    console.log("Scene inserted with ID:", sceneId);

    // Step 2: Insert characters
    const characters = [
      {
        name: "Erynn",
        age: 25,
        gender: "female",
        personality: "cunning and resourceful",
        backstory: "A rogue with a mysterious past",
        storyId: 5,
      },
      {
        name: "Krynn",
        age: 30,
        gender: "male",
        personality: "brave and loyal",
        backstory: "A knight with a tragic history.",
        storyId: 5,
      },
    ];

    const characterIds: number[] = [];

    for (const character of characters) {
      const characterId = await insertCharacter(character);
      if (characterId) characterIds.push(characterId);
    }

    if (characterIds.length === 0) {
      console.error("No characters were successfully inserted.");
      return;
    }

    console.log("Characters inserted with IDs:", characterIds);

    // Step 3: Update the junction table
    const success = await updateJunctionTable({
      sceneId,
      characterIds,
    });

    if (!success) {
      console.error("Failed to update the junction table.");
      return;
    }

    console.log("Junction table updated successfully!");
  } catch (error) {
    console.error("Error during scene and character creation:", error);
  }
};

// Test entry point for Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await createSceneWithCharacters();
  })();
}

