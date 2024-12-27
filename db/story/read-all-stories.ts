import { Story } from "@/types/story";
import { supabase } from "../lib/init-supabase";
import { toAppStory } from "./story-db-conversion";

export default async function readAllStories(): Promise<Story[]> {
  const { data, error } = await supabase.from("stories").select("*");

  if (error || !data) {
    console.error("Error fetching all stories:", error);
    throw new Error("Error fetching all stories");
  }

  return data.map(toAppStory);
}

