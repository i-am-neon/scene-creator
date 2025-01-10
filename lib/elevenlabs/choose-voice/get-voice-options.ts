"use server";

import { Character } from "@/types/character";
import elevenlabs from "../init-eleven-labs";

export default async function getVoiceOptions({
  gender,
}: {
  gender: Character["gender"];
}) {
  const { voices: allVoices } = await elevenlabs.voices.getShared({
    language: "en",
    page_size: 100,
    page: 1,
  });
  let searchStrings: string[] = [];
  switch (gender) {
    case "male":
      searchStrings = ["male", "neutral"];
      break;
    case "female":
      searchStrings = ["female", "neutral"];
      break;
    default:
      searchStrings = ["male", "female", "neutral"];
  }
  console.log("allVoices.length :>> ", allVoices.length);
  console.log("allVoices[0] :>> ", allVoices[0]);
  const filteredVoices = allVoices.filter((voice) => {
    const voiceGender = voice?.gender;
    if (!voiceGender) {
      return true;
    }
    return searchStrings.includes(voiceGender);
    // return labels?.gender === gender && labels?.age === age;
  });

  return filteredVoices.map((voice) => ({
    id: voice.voice_id,
    name: voice.name,
    gender: voice.gender,
    accent: voice.accent,
    age: voice.age,
    description: voice.description,
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const voiceOptions = await getVoiceOptions({
    gender: "male",
  });

  console.log("voiceOptions.length :>> ", voiceOptions.length);

  console.log("voiceOptions :>> ", voiceOptions);
}

