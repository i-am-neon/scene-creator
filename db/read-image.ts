import { supabase } from "./lib/init-supabase";

export default async function readImage({
  bucketName,
  imagePath,
}: {
  bucketName: string;
  imagePath: string;
}) {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(imagePath);
  if (error) {
    throw error;
  }
  return data;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = await readImage({
    bucketName: "images",
    imagePath: "example.jpg",
  });
  console.log("Image read:", res);
}

