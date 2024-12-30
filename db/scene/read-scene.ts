import { Scene } from "@/types/scene";
import { toAppScene } from "./scene-db-conversion";
import { supabase } from "../lib/init-supabase";

export const readScene = async (id: number): Promise<Scene | null> => {
  const { data, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching scene:", error);
    return null;
  }

  return data ? toAppScene(data) : null;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const id = 6;
    const scene = await readScene(id);
    console.log("Scene:", scene);
  })();
}

