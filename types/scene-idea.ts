import { z } from "zod";

export const SceneIdeaSchema = z.object({
  sceneIdea: z.string(),
  newCharacterIdeas: z.array(z.string()),
  existingCharacterIDsIncludedInScene: z.array(z.string()),
});

export type SceneIdea = z.infer<typeof SceneIdeaSchema>;

