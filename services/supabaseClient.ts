import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase com as credenciais fornecidas.
const supabaseUrl = 'https://tqssfeblayfwzbwldbfc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxc3NmZWJsYXlmd3pid2xkYmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzUwODQsImV4cCI6MjA3MzMxMTA4NH0.NZAJV69wj_eDnV8gJU5aseOXqhG0YobEF_t4z_AxKcU';

// Cria e exporta o cliente Supabase para ser usado em toda a aplicação.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
