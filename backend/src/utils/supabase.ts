import { createClient } from "@supabase/supabase-js";
import { config } from "../config/config";

if (!config.supabase.url || !config.supabase.key) {
  throw new Error("Missing Supabase credentials in environment variables");
}

export const supabase = createClient(config.supabase.url, config.supabase.key);
