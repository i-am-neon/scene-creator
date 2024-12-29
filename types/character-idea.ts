import { z } from "zod";

export const CharacterIdeaSchema = z.object({
  name: z.string(),
  description: z.string(),
});
export type CharacterIdea = z.infer<typeof CharacterIdeaSchema>;
