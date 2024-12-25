"use server";
import { supabase } from "@/lib/init-supabase";

export async function testSupabase() {
  console.log("supabase :>> ", supabase);
}

