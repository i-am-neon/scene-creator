"use server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { logger } from "@/lib/logger";
import fetchAllVoices from "./fetch-all-voices";
import { LibraryVoiceResponse } from "elevenlabs/api";

function transformVoiceData(voice: LibraryVoiceResponse): LibraryVoiceResponse {
  return {
    ...voice,
    instagram_username: voice.instagram_username ?? undefined,
    twitter_username: voice.twitter_username ?? undefined,
    youtube_username: voice.youtube_username ?? undefined,
    tiktok_username: voice.tiktok_username ?? undefined,
    notice_period: voice.notice_period ?? undefined,
  };
}

export async function saveVoiceOptionsToFile() {
  try {
    const voices = await fetchAllVoices();
    const transformedVoices = voices.map(transformVoiceData);

    const fileContent = `// Generated on ${new Date().toISOString()}
// This file is auto-generated. Do not edit directly.

import { LibraryVoiceResponse } from "elevenlabs/api";

export const voiceOptions: LibraryVoiceResponse[] = ${JSON.stringify(
      transformedVoices,
      (key, value) => (value === undefined ? undefined : value),
      2
    )};

export const voiceOptionsMap: Record<string, LibraryVoiceResponse> = voiceOptions.reduce((acc, voice) => ({
  ...acc,
  [voice.voice_id]: voice
}), {});

type Gender = "male" | "female" | "other";

export function getVoicesByGender(gender: Gender): LibraryVoiceResponse[] {
  if (gender === "other") {
    return voiceOptions.filter(voice => 
      voice.gender !== "male" && voice.gender !== "female"
    );
  }
  return voiceOptions.filter(voice => voice.gender === gender);
}
`;

    const filePath = join(
      process.cwd(),
      "lib",
      "elevenlabs",
      "voice-options",
      "voice-options.ts"
    );
    await writeFile(filePath, fileContent, "utf-8");

    await logger.info("Successfully saved voice options to file", {
      filePath,
      voiceCount: voices.length,
    });

    return filePath;
  } catch (error) {
    await logger.error("Failed to save voice options", {
      error: error instanceof Error ? error.stack : String(error),
    });
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const filePath = await saveVoiceOptionsToFile();
      console.log("Voice options saved to:", filePath);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

