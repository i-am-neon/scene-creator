import saveAudio from "@/db/save-audio";
import elevenlabs from "./init-eleven-labs";

export default async function genVoice({
  voiceId,
  text,
}: {
  voiceId: string;
  text: string;
}) {
  const audio = await elevenlabs.generate({
    voice: voiceId,
    text,
    model_id: "eleven_multilingual_v2",
  });

  return saveAudio({
    stream: audio,
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  genVoice({
    voiceId: "rm6bQBXZFIjAZKKIhbhm",
    text: "Hello, world! I am a goddamn minitaur!",
  }).then(console.log);
}

