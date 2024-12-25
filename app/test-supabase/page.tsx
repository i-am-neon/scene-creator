"use client";
import { useCallback } from "react";
import { testSupabase } from "./actions";

export default function TestSupabasePage() {
  const _testSupabase = useCallback(async () => {
    testSupabase();
  }, []);
  return (
    <div>
      <h1>Test Supabase Page</h1>
      <button onClick={_testSupabase}>Test</button>
    </div>
  );
}

