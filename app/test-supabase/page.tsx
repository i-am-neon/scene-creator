"use client";
import { addStory, getStory } from "./actions";

export default function TestSupabasePage() {
  return (
    <div>
      <h1>Test Supabase Page</h1>
      <button onClick={addStory}>Add Story</button>
      <button onClick={getStory}>Read Story</button>
    </div>
  );
}

