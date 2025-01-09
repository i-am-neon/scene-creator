"use server";

import { Character } from "@/types/character";
import elevenlabs from "../elevenlabs/init-eleven-labs";

export default async function getVoiceOptions({
  gender,
}: {
  gender: Character["gender"];
}) {
  const { voices: allVoices } = await elevenlabs.voices.getAll();
  let searchStrings: string[] = [];
  switch (gender) {
    case "male":
      searchStrings = ["male", "neutral"];
      break;
    case "female":
      searchStrings = ["female", "neutral"];
      break;
    case "other":
      searchStrings = ["male", "female", "neutral"];
      break;
    default:
      searchStrings = ["male", "female", "neutral"];
  }
  const filteredVoices = allVoices.filter((voice) => {
    const voiceGender = voice?.labels?.gender;
    if (!voiceGender) {
      return true;
    }
    return searchStrings.includes(voiceGender);
    // return labels?.gender === gender && labels?.age === age;
  });

  return filteredVoices.map((voice) => ({
    id: voice.voice_id,
    name: voice.name,
    labels: voice.labels,
    description: voice.description,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const voiceOptions = await getVoiceOptions({
    gender: "other",
  });

  console.log("voiceOptions.length :>> ", voiceOptions.length);

  console.log("voiceOptions :>> ", voiceOptions);
}
