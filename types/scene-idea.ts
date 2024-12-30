import { z } from "zod";
import { CharacterIdeaSchema } from "./character-idea";

export const SceneIdeaSchema = z.object({
  sceneIdea: z.string(),
  newCharacterIdeas: z.array(CharacterIdeaSchema),
  existingCharacterIDsIncludedInScene: z.array(z.string()),
});

export type SceneIdea = z.infer<typeof SceneIdeaSchema>;

