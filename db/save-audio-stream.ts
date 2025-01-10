import { logger } from "@/lib/logger";
import { supabase } from "./lib/init-supabase";
import sanitizeFileName from "./lib/sanitize-file-name";
import { Readable } from "stream";
import { v4 as uuidv4 } from "uuid";

export default async function saveAudioStream({
  stream,
}: {
  stream: Readable;
}): Promise<string> {
  const chunks: Uint8Array[] = [];

  try {
    // Convert stream to buffer
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error occurred while saving audio";

    await logger.error(errorMessage, {
      error: error instanceof Error ? error.stack : String(error),
      streamSize: chunks.length,
      isSupabaseError: error instanceof Error && "statusCode" in error,
      statusCode:
        error instanceof Error && "statusCode" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).statusCode
          : undefined,
      supabaseMessage:
        error instanceof Error && "message" in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error as any).message
          : undefined,
      bucketName: "audio",
    });

    throw error;
  }
}
// to test, run gen-voice.ts

