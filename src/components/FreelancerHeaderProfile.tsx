"use client";

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function FreelancerHeaderProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/user/me');
        const json = await res.json();
        if (res.ok) {
          setUser(json);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const initials = useMemo(() => {
    const name = String(user?.name || '').trim();
    if (!name) return 'FR';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase() || '')
      .join('');
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Memuat akun...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">{user?.name || 'Freelancer'}</p>
        <div className="flex items-center gap-1 justify-end">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          <p className="text-xs text-gray-500">{user?.email || 'Online'}</p>
        </div>
      </div>
      <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
        {initials}
      </div>
    </div>
  );
}
