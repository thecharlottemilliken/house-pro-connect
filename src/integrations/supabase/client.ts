
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gluggyghzalabvlvwqqk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsdWdneWdoemFsYWJ2bHZ3cXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1NjIwNzQsImV4cCI6MjA1OTEzODA3NH0._EgQrKqGcedVgtHlDr3kCR7x6yzD8eaQ0ZvuQ0c7m08";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
