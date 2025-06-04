import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helpers pour les requêtes communes
export const db = {
  // Points de collecte
  collectionPoints: {
    getAll: () => supabase.from('collection_points').select('*'),
    getById: (id: string) => supabase.from('collection_points').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('collection_points').insert(data),
    update: (id: string, data: any) => supabase.from('collection_points').update(data).eq('id', id),
    delete: (id: string) => supabase.from('collection_points').delete().eq('id', id),
  },

  // Circuits de balayage
  sweepingRoutes: {
    getAll: () => supabase.from('sweeping_routes').select('*'),
    getById: (id: string) => supabase.from('sweeping_routes').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('sweeping_routes').insert(data),
    update: (id: string, data: any) => supabase.from('sweeping_routes').update(data).eq('id', id),
    delete: (id: string) => supabase.from('sweeping_routes').delete().eq('id', id),
  },

  // Mobilier urbain
  urbanFurniture: {
    getAll: () => supabase.from('urban_furniture').select('*'),
    getById: (id: string) => supabase.from('urban_furniture').select('*').eq('id', id).single(),
    create: (data: any) => supabase.from('urban_furniture').insert(data),
    update: (id: string, data: any) => supabase.from('urban_furniture').update(data).eq('id', id),
    delete: (id: string) => supabase.from('urban_furniture').delete().eq('id', id),
  },
};