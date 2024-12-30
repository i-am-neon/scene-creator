import { supabase } from "./lib/init-supabase";
import sanitizeFileName from "./lib/sanitize-file-name";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

export default async function saveAudio({
  stream,
}: {
  stream: Readable;
}): Promise<string | null> {
  try {
    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const path = sanitizeFileName(`${uuidv4()}.webm`);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: "audio/webm",
      });

    if (error) {
      throw error;
    }

    const bucketName = "audio";
    const publicAudioUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${data.path}`;
    return publicAudioUrl;
  } catch (error) {
    console.error("Error uploading audio:", error);
    return null;
  }
}

// to test, run gen-voice.ts

