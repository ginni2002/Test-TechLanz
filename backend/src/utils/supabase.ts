import { createClient } from "@supabase/supabase-js";
import { config } from "../config/config";
import fetch from "node-fetch";

if (!config.supabase.url || !config.supabase.key) {
  throw new Error("Missing Supabase credentials in environment variables");
}

console.log("Supabase URL:", config.supabase.url);

export const supabase = createClient(config.supabase.url, config.supabase.key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    fetch: fetch as any,
  },
});

supabase.auth.getSession().then(
  () => console.log("Supabase connection successful"),
  (error) => console.error("Supabase connection error:", error)
);
