'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  enrolled_courses?: string[];
  created_at?: string;
}

export function useSupabaseUser() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;
      setSession(session);

      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (mounted) setProfile(data as SupabaseProfile | null);
      }

      setLoading(false);
    };

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user?.id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data as SupabaseProfile | null);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return {
    user: session?.user || null,
    profile,
    session,
    loading,
  };
}
