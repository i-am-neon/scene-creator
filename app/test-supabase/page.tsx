"use client";
import { Button } from "@/components/ui/button";
import { addStory, getStory } from "./actions";

export default function TestSupabasePage() {
  return (
    <div>
      <h1>Test Supabase Page</h1>
      <Button onClick={addStory}>Add Story</Button>
      <br />
      <br />
      <Button onClick={getStory}>Read Story</Button>
    </div>
  );
}

