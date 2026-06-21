import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jnjdhkdnagjnvxoionbu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuamRoa2RuYWdqbnZ4b2lvbmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTEwMTcsImV4cCI6MjA5NzYyNzAxN30.p9VN5JEeQckR4JWFOqaz350b_sy_T7a2WhcDmG-CTBk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
