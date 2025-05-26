// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wnfxbbfupztbpurizhdy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduZnhiYmZ1cHp0YnB1cml6aGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODcyNjksImV4cCI6MjA2Mzg2MzI2OX0.NaNyDp9YIU-wyHfaiNJAknHT5tE7S71hmSFU5m8LKe8";

export const supabase = createClient(supabaseUrl, supabaseKey);
