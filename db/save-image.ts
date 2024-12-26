import { supabase } from "./lib/init-supabase";
import sanitizeFileName from "./lib/sanitize-file-name";

export default async function saveImage({
  url,
  name,
  folder,
  fileExtension,
}: {
  url: string;
  name: string;
  folder: string;
  fileExtension: string;
}): Promise<{
  id: string;
  path: string;
  fullPath: string;
} | null> {
  try {
    // Fetch the image from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch the image: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Ensure the correct content type
    const contentType = blob.type || `image/${fileExtension}`;

    // Convert Blob to a Buffer (needed for Supabase upload)
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const path = sanitizeFileName(`${folder}/${name}.${fileExtension}`);
    // Upload the file to Supabase
    const { data, error } = await supabase.storage
      .from("images")
      .upload(path, buffer, {
        cacheControl: "3600",
        upsert: true,
        contentType, // Set the correct content type
      });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = await saveImage({
    url: "https://replicate.delivery/xezq/nimaVbpofflZ5U8FxM7VnyFc7XWSeepIOeMebW0HCMycBFqfJA/out-0.jpg",
    name: "example!@@#$%^&*() hi hi!",
    folder: "examples",
    fileExtension: "jpg",
  });
  console.log("Image saved:", res);
}

