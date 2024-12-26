"use client";
import { useCallback } from "react";
import { addStory } from "./actions";

export default function TestSupabasePage() {
  const _testSupabase = useCallback(async () => {
    addStory();
  }, []);
  return (
    <div>
      <h1>Test Supabase Page</h1>
      <button onClick={_testSupabase}>Add Story</button>
    </div>
  );
}

