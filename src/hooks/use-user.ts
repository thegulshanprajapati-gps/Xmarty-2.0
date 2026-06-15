'use client';

import { useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  enrolled_courses?: string[];
  mobile_number?: string;
  profile_picture?: string;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        if (mounted) {
          setUser(data.user || null);
        }
      } catch (error) {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,
  };
}
