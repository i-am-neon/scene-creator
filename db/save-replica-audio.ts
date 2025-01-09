import { logger } from "@/lib/logger";
import { supabase } from "./lib/init-supabase";
import sanitizeFileName from "./lib/sanitize-file-name";
import { v4 as uuidv4 } from "uuid";

export default async function saveAudio({
  url,
}: {
  url: string;
}): Promise<string> {
  try {
    // Fetch the audio from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    // Get the audio data as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const path = sanitizeFileName(`${uuidv4()}.wav`);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: "audio/wav",
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
      downloadUrl: url,
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

// Test with Bun
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const res = await saveAudio({
        url: "https://storage-production20220131061146038100000006.s3.amazonaws.com/previews/55a0aad5-a739-402f-9cec-36b01ff81a41/a5c2591b-9fd9-4f92-b259-b1dbd9d4007c/a5c2591b-9fd9-4f92-b259-b1dbd9d4007c.wav?response-content-type=audio%2Fwav&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAW7JGOG73XHENOAE3%2F20250109%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20250109T212259Z&X-Amz-Expires=300&X-Amz-SignedHeaders=host&X-Amz-Signature=e1ff91fb7e6df7395de779b57222a7357280b1f77a3ecd940fcd07cf7d4f5dec",
      });
      console.log("Audio saved:", res);
    } catch (error) {
      console.error("Error:", error);
    }
  })();
}

