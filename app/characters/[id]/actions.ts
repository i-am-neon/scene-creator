"use server";
import { readCharacter } from "@/db/character/read-character";
import { updateCharacter } from "@/db/character/update-character";
import generateCharacterPortraitUrl from "@/lib/generate-character-portrait-url/generate-character-portrait-url";
import { CharacterPreSave } from "@/types/character";

export default async function regenerateCharacterPortrait(characterId: number) {
  const character = await readCharacter(characterId);

  const portraitUrl = await generateCharacterPortraitUrl(
    character as CharacterPreSave
  );

  await updateCharacter(characterId, { portraitUrl });
}

