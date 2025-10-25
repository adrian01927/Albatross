
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ztmanxugnjodlwhunbmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0bWFueHVnbmpvZGx3aHVuYm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjkyMDYsImV4cCI6MjA3NjkwNTIwNn0.L9b8_d6ebe0bu4guFsiNMz_DNb9S_4HNbTwQ54Xjt1Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
