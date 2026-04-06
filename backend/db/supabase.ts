import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  sessions: {
    getAll: async () => {
      const { data, error } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (name: string) => {
      const { data, error } = await supabase.from('sessions').insert({ name }).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('sessions').delete().eq('id', id);
      if (error) throw error;
    },
  },
  papers: {
    getBySession: async (sessionId: number) => {
      const { data, error } = await supabase.from('papers').select('*').eq('session_id', sessionId);
      if (error) throw error;
      return data;
    },
    create: async (paper: any) => {
      const { data, error } = await supabase.from('papers').insert(paper).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase.from('papers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('papers').delete().eq('id', id);
      if (error) throw error;
    },
  },
  queries: {
    getBySession: async (sessionId: number) => {
      const { data, error } = await supabase.from('queries').select('*').eq('session_id', sessionId);
      if (error) throw error;
      return data;
    },
    create: async (sessionId: number, text: string) => {
      const { data, error } = await supabase.from('queries').insert({ session_id: sessionId, text }).select().single();
      if (error) throw error;
      return data;
    },
  },
  analyses: {
    getByQuery: async (queryId: number) => {
      const { data, error } = await supabase.from('analyses').select('*').eq('query_id', queryId);
      if (error) throw error;
      return data;
    },
    create: async (queryId: number, text: string) => {
      const { data, error } = await supabase.from('analyses').insert({ query_id: queryId, text }).select().single();
      if (error) throw error;
      return data;
    },
  },
  notes: {
    getAll: async () => {
      const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (note: any) => {
      const { data, error } = await supabase.from('notes').insert(note).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase.from('notes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
  },
  subscriptions: {
    getAll: async () => {
      const { data, error } = await supabase.from('subscriptions').select('*');
      if (error) throw error;
      return data;
    },
    create: async (sub: any) => {
      const { data, error } = await supabase.from('subscriptions').insert(sub).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase.from('subscriptions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);
      if (error) throw error;
    },
  },
};

export default db;
