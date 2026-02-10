
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebundacdvcfzyuhirtnj.supabase.co';
const supabaseKey = 'sb_publishable_PAYykpuo-6VamVtMjUGgWQ_g6DKYqM8';

export const supabase = createClient(supabaseUrl, supabaseKey);
